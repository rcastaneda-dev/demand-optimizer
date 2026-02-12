"""ILP solver for school selection optimization (FR4).

Uses Google OR-Tools to find the combination of schools that maximizes
the total number of students served, subject to:
  - Per-SKU demand of selected schools ≤ 90% of available stock (FR2)
  - Each school is all-or-nothing (FR3)
"""

from dataclasses import dataclass, field

from ortools.linear_solver import pywraplp

from .demand import SchoolDemandProfile

SAFETY_FACTOR = 0.90


@dataclass
class SelectionReport:
    selected_school_ids: list[str]
    total_students_served: int


@dataclass
class InventoryImpactItem:
    sku_id: str
    total_stock: int
    allocated: int
    remaining: int
    usage_pct: float


@dataclass
class ShortageItem:
    sku_id: str
    school_id: str
    demand: int
    available_after_allocation: int
    deficit: int


@dataclass
class SolverResult:
    selection: SelectionReport
    inventory_impact: list[InventoryImpactItem]
    shortages: list[ShortageItem]


def solve(
    profiles: dict[str, SchoolDemandProfile],
    inventory: dict[str, int],
) -> SolverResult:
    """Run the ILP solver and produce all three output reports.

    Args:
        profiles: school_id → SchoolDemandProfile (from aggregate_demand)
        inventory: sku_id → total_stock_available
    """
    solver = pywraplp.Solver.CreateSolver("SCIP")
    if solver is None:
        raise RuntimeError("SCIP solver not available")

    school_ids = list(profiles.keys())

    # --- Decision variables: binary per school ---
    x: dict[str, pywraplp.Variable] = {}
    for sid in school_ids:
        x[sid] = solver.BoolVar(sid)

    # --- Objective: maximize total students served ---
    solver.Maximize(
        solver.Sum(profiles[sid].total_students * x[sid] for sid in school_ids)
    )

    # --- Constraints: per-SKU demand ≤ 90% of stock ---
    all_skus: set[str] = set()
    for p in profiles.values():
        all_skus.update(p.sku_demand.keys())

    for sku in all_skus:
        cap = int(inventory.get(sku, 0) * SAFETY_FACTOR)
        solver.Add(
            solver.Sum(
                profiles[sid].sku_demand.get(sku, 0) * x[sid] for sid in school_ids
            )
            <= cap
        )

    # --- Solve ---
    status = solver.Solve()

    if status not in (pywraplp.Solver.OPTIMAL, pywraplp.Solver.FEASIBLE):
        return SolverResult(
            selection=SelectionReport(selected_school_ids=[], total_students_served=0),
            inventory_impact=[],
            shortages=_build_shortage_report([], profiles, inventory),
        )

    selected = [sid for sid in school_ids if x[sid].solution_value() > 0.5]
    total_served = sum(profiles[sid].total_students for sid in selected)

    # --- Inventory Impact Report ---
    sku_allocated: dict[str, int] = {}
    for sid in selected:
        for sku, qty in profiles[sid].sku_demand.items():
            sku_allocated[sku] = sku_allocated.get(sku, 0) + qty

    impact: list[InventoryImpactItem] = []
    for sku in sorted(inventory.keys()):
        stock = inventory[sku]
        alloc = sku_allocated.get(sku, 0)
        remaining = stock - alloc
        usage_pct = (alloc / stock * 100) if stock > 0 else 0.0
        impact.append(
            InventoryImpactItem(
                sku_id=sku,
                total_stock=stock,
                allocated=alloc,
                remaining=remaining,
                usage_pct=round(usage_pct, 2),
            )
        )

    # --- Shortage Report ---
    shortages = _build_shortage_report(selected, profiles, inventory)

    return SolverResult(
        selection=SelectionReport(
            selected_school_ids=selected,
            total_students_served=total_served,
        ),
        inventory_impact=impact,
        shortages=shortages,
    )


def _build_shortage_report(
    selected: list[str],
    profiles: dict[str, SchoolDemandProfile],
    inventory: dict[str, int],
) -> list[ShortageItem]:
    """Find bottleneck SKUs for the largest excluded school."""
    excluded = [
        sid
        for sid in profiles
        if sid not in selected
    ]
    if not excluded:
        return []

    # Sort excluded schools by total_students descending — report on the largest
    excluded.sort(key=lambda sid: profiles[sid].total_students, reverse=True)
    target = excluded[0]

    # Compute remaining stock after serving selected schools
    sku_used: dict[str, int] = {}
    for sid in selected:
        for sku, qty in profiles[sid].sku_demand.items():
            sku_used[sku] = sku_used.get(sku, 0) + qty

    shortages: list[ShortageItem] = []
    for sku, demand in profiles[target].sku_demand.items():
        stock = inventory.get(sku, 0)
        cap = int(stock * SAFETY_FACTOR)
        available = cap - sku_used.get(sku, 0)
        if demand > available:
            shortages.append(
                ShortageItem(
                    sku_id=sku,
                    school_id=target,
                    demand=demand,
                    available_after_allocation=max(available, 0),
                    deficit=demand - available,
                )
            )

    shortages.sort(key=lambda s: s.deficit, reverse=True)
    return shortages

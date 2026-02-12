"""Unit tests for the ILP solver with known-answer scenarios."""

from app.solver.demand import SchoolDemandProfile
from app.solver.optimizer import solve, SAFETY_FACTOR


def _profile(school_id: str, total_students: int, sku_demand: dict[str, int]):
    return SchoolDemandProfile(
        school_id=school_id,
        total_students=total_students,
        sku_demand=sku_demand,
    )


class TestSolverBasic:
    """Basic solver behaviour."""

    def test_single_school_fits(self):
        """One school that easily fits within the 90% cap."""
        profiles = {
            "S1": _profile("S1", 50, {"BLANCA-T8": 50, "PANTALON AZUL-T8": 50, "ZAPATO-30": 50}),
        }
        inventory = {"BLANCA-T8": 100, "PANTALON AZUL-T8": 100, "ZAPATO-30": 100}

        result = solve(profiles, inventory)

        assert result.selection.selected_school_ids == ["S1"]
        assert result.selection.total_students_served == 50
        assert result.shortages == []

    def test_single_school_exceeds_cap(self):
        """One school whose demand exceeds the 90% cap on a SKU."""
        # Demand 95 but 90% of 100 = 90 → won't fit
        profiles = {
            "S1": _profile("S1", 95, {"BLANCA-T8": 95}),
        }
        inventory = {"BLANCA-T8": 100}

        result = solve(profiles, inventory)

        assert result.selection.selected_school_ids == []
        assert result.selection.total_students_served == 0
        # S1 should appear in shortage report
        assert len(result.shortages) > 0
        assert result.shortages[0].school_id == "S1"

    def test_no_schools(self):
        """Empty input produces empty output."""
        result = solve({}, {"BLANCA-T8": 100})

        assert result.selection.selected_school_ids == []
        assert result.selection.total_students_served == 0


class TestSolverOptimality:
    """Verify the solver picks the combination that maximises students."""

    def test_prefers_larger_school(self):
        """Given two schools competing for the same SKU, pick the larger one."""
        # 90% of 100 = 90.  S1 needs 80, S2 needs 50.  Both can't fit (130 > 90).
        profiles = {
            "S1": _profile("S1", 80, {"BLANCA-T8": 80}),
            "S2": _profile("S2", 50, {"BLANCA-T8": 50}),
        }
        inventory = {"BLANCA-T8": 100}

        result = solve(profiles, inventory)

        assert result.selection.selected_school_ids == ["S1"]
        assert result.selection.total_students_served == 80

    def test_prefers_two_small_over_one_large(self):
        """Two small schools (total 90 students) beat one large (80 students)."""
        # 90% of 200 = 180
        # S1 needs 80, S2 needs 50, S3 needs 40 → S2+S3=90 students, demand 90 units
        # S1 alone = 80 students.  S2+S3 = 90 students → solver picks S2+S3
        profiles = {
            "BIG": _profile("BIG", 80, {"BLANCA-T8": 150}),
            "SM1": _profile("SM1", 50, {"BLANCA-T8": 50}),
            "SM2": _profile("SM2", 40, {"BLANCA-T8": 40}),
        }
        inventory = {"BLANCA-T8": 200}
        # cap = 180.  BIG alone = 150 (fits, 80 students)
        # SM1+SM2 = 90 (fits, 90 students) → optimal

        result = solve(profiles, inventory)

        assert sorted(result.selection.selected_school_ids) == ["SM1", "SM2"]
        assert result.selection.total_students_served == 90

    def test_multiple_sku_constraint(self):
        """Constraint on different SKUs forces exclusion."""
        # S1 needs SKU-A and SKU-B, S2 only needs SKU-A
        # SKU-A cap = 90, SKU-B cap = 45
        profiles = {
            "S1": _profile("S1", 60, {"SKU-A": 60, "SKU-B": 50}),
            "S2": _profile("S2", 40, {"SKU-A": 40}),
        }
        inventory = {"SKU-A": 100, "SKU-B": 50}
        # SKU-B cap = 45 → S1 needs 50 → S1 excluded.  S2 fits.

        result = solve(profiles, inventory)

        assert result.selection.selected_school_ids == ["S2"]
        assert result.selection.total_students_served == 40


class TestInventoryImpact:
    """Verify the inventory impact report."""

    def test_impact_numbers(self):
        profiles = {
            "S1": _profile("S1", 30, {"BLANCA-T8": 30, "ZAPATO-30": 30}),
        }
        inventory = {"BLANCA-T8": 100, "ZAPATO-30": 200}

        result = solve(profiles, inventory)

        assert result.selection.selected_school_ids == ["S1"]

        impact_by_sku = {i.sku_id: i for i in result.inventory_impact}
        shirt = impact_by_sku["BLANCA-T8"]
        assert shirt.allocated == 30
        assert shirt.remaining == 70
        assert shirt.usage_pct == 30.0

        shoe = impact_by_sku["ZAPATO-30"]
        assert shoe.allocated == 30
        assert shoe.remaining == 170
        assert shoe.usage_pct == 15.0


class TestShortageReport:
    """Verify the shortage report targets the largest excluded school."""

    def test_shortage_identifies_bottleneck(self):
        # S1 (100 students) selected, S2 (60 students) excluded due to SKU-B
        profiles = {
            "S1": _profile("S1", 100, {"SKU-A": 80}),
            "S2": _profile("S2", 60, {"SKU-A": 10, "SKU-B": 50}),
        }
        inventory = {"SKU-A": 100, "SKU-B": 50}
        # SKU-A cap=90, SKU-B cap=45.  S1 uses 80 of SKU-A.
        # S2 needs 10 SKU-A (remaining cap = 90-80=10, fits) and 50 SKU-B (cap=45, doesn't fit)
        # Both can't be selected because S1+S2 SKU-A = 90 (fits) but SKU-B = 50 > 45

        result = solve(profiles, inventory)

        assert "S1" in result.selection.selected_school_ids
        assert "S2" not in result.selection.selected_school_ids

        assert len(result.shortages) > 0
        assert result.shortages[0].school_id == "S2"
        assert result.shortages[0].sku_id == "SKU-B"
        assert result.shortages[0].deficit == 5  # needs 50, cap-used = 45-0 = 45

    def test_no_shortage_when_all_selected(self):
        profiles = {
            "S1": _profile("S1", 10, {"SKU-A": 10}),
        }
        inventory = {"SKU-A": 100}

        result = solve(profiles, inventory)

        assert result.selection.selected_school_ids == ["S1"]
        assert result.shortages == []

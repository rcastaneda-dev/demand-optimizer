"""Aggregate student-level data into School Demand Profiles (FR1).

Each student requires:
  - 1 shirt (BLANCA or CELESTE in a specific size)
  - 1 pants/skirt (one of 6 types in a specific size)
  - 1 pair of shoes (specific size)

The output is a dict keyed by school_id containing:
  - total_students: number of students in the school
  - sku_demand: {sku_id: total_units_needed}
"""

from collections import defaultdict
from dataclasses import dataclass, field

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student import Student


@dataclass
class SchoolDemandProfile:
    school_id: str
    total_students: int = 0
    sku_demand: dict[str, int] = field(default_factory=dict)


async def aggregate_demand(session: AsyncSession) -> dict[str, SchoolDemandProfile]:
    """Query all students and return demand profiles grouped by school."""
    result = await session.execute(select(Student))
    students = result.scalars().all()

    profiles: dict[str, SchoolDemandProfile] = {}
    demand_accum: dict[str, dict[str, int]] = defaultdict(lambda: defaultdict(int))
    student_counts: dict[str, int] = defaultdict(int)

    for s in students:
        student_counts[s.school_id] += 1
        demand_accum[s.school_id][s.shirt_sku] += 1
        demand_accum[s.school_id][s.pants_sku] += 1
        demand_accum[s.school_id][s.shoe_size_sku] += 1

    for school_id, sku_demand in demand_accum.items():
        profiles[school_id] = SchoolDemandProfile(
            school_id=school_id,
            total_students=student_counts[school_id],
            sku_demand=dict(sku_demand),
        )

    return profiles

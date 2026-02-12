"""Aggregate student-level data into School Demand Profiles (FR1).

Each student requires 2 uniforms (same SKU) and 1 pair of shoes.
The output is a dict keyed by school_id containing:
  - total_students: number of students in the school
  - sku_demand: {sku_id: total_units_needed}
"""

from collections import defaultdict
from dataclasses import dataclass, field

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student import Student

UNIFORMS_PER_STUDENT = 2
SHOES_PER_STUDENT = 1


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
        demand_accum[s.school_id][s.uniform_size_sku] += UNIFORMS_PER_STUDENT
        demand_accum[s.school_id][s.shoe_size_sku] += SHOES_PER_STUDENT

    for school_id, sku_demand in demand_accum.items():
        profiles[school_id] = SchoolDemandProfile(
            school_id=school_id,
            total_students=student_counts[school_id],
            sku_demand=dict(sku_demand),
        )

    return profiles

from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import get_db
from app.models.job import Job, JobStatus
from app.models.student import Student
from app.schemas.picking import PickingItem, PickingList, PickingSchool, PickingStudent

router = APIRouter(tags=["picking"])


@router.get("/picking/{job_id}", response_model=PickingList)
async def get_picking_list(
    job_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Generate a picking list grouped by School → Student → Items."""
    job = await db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.status != JobStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Job is not completed yet")
    if not job.result_json:
        raise HTTPException(status_code=400, detail="Job has no results")

    selected_ids = set(job.result_json["selection"]["selected_school_ids"])

    # Query students belonging to selected schools
    rows = (
        await db.execute(
            select(Student)
            .where(Student.school_id.in_(selected_ids))
            .order_by(Student.school_id, Student.student_id)
        )
    ).scalars().all()

    # Group by school
    by_school: dict[str, list[Student]] = defaultdict(list)
    for student in rows:
        by_school[student.school_id].append(student)

    schools = []
    for school_id in sorted(by_school.keys()):
        students = by_school[school_id]
        picking_students = [
            PickingStudent(
                student_id=s.student_id,
                items=[
                    PickingItem(sku_id=s.shirt_sku, type="shirt"),
                    PickingItem(sku_id=s.pants_sku, type="pants"),
                    PickingItem(sku_id=s.shoe_size_sku, type="shoes"),
                ],
            )
            for s in students
        ]
        schools.append(PickingSchool(
            school_id=school_id,
            total_students=len(students),
            students=picking_students,
        ))

    return PickingList(schools=schools)

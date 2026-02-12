from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import get_db
from app.models.student import Student
from app.schemas.student import StudentItem

router = APIRouter(tags=["students"])


@router.post("/students", status_code=201)
async def upsert_students(
    items: list[StudentItem],
    db: AsyncSession = Depends(get_db),
):
    """Upload/upsert student enrollment data."""
    for item in items:
        existing = await db.get(Student, item.student_id)
        if existing:
            existing.school_id = item.school_id
            existing.shirt_sku = item.shirt_sku
            existing.pants_sku = item.pants_sku
            existing.shoe_size_sku = item.shoe_size_sku
        else:
            db.add(
                Student(
                    student_id=item.student_id,
                    school_id=item.school_id,
                    shirt_sku=item.shirt_sku,
                    pants_sku=item.pants_sku,
                    shoe_size_sku=item.shoe_size_sku,
                )
            )
    await db.commit()
    return {"upserted": len(items)}

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import get_db
from app.schemas.school import SchoolProfile
from app.solver.demand import aggregate_demand

router = APIRouter(tags=["schools"])


@router.get("/schools", response_model=list[SchoolProfile])
async def list_schools(db: AsyncSession = Depends(get_db)):
    """List schools with aggregated demand profiles."""
    profiles = await aggregate_demand(db)
    return [
        SchoolProfile(
            school_id=p.school_id,
            total_students=p.total_students,
            sku_demand=p.sku_demand,
        )
        for p in sorted(profiles.values(), key=lambda p: p.total_students, reverse=True)
    ]

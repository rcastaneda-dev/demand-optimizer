from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import get_db
from app.models.inventory import Inventory
from app.models.job import Job, JobStatus
from app.schemas.inventory import InventoryItem, InventoryListItem

router = APIRouter(tags=["inventory"])


@router.post("/inventory", status_code=201)
async def upsert_inventory(
    items: list[InventoryItem],
    db: AsyncSession = Depends(get_db),
):
    """Upload/upsert inventory data."""
    for item in items:
        existing = await db.get(Inventory, item.sku_id)
        if existing:
            existing.description = item.description
            existing.total_stock_available = item.total_stock_available
        else:
            db.add(
                Inventory(
                    sku_id=item.sku_id,
                    description=item.description,
                    total_stock_available=item.total_stock_available,
                )
            )
    await db.commit()
    return {"upserted": len(items)}


@router.get("/inventory", response_model=list[InventoryListItem])
async def list_inventory(db: AsyncSession = Depends(get_db)):
    """List inventory with allocation data from the latest completed optimization."""
    rows = (await db.execute(select(Inventory).order_by(Inventory.sku_id))).scalars().all()

    # Build allocation map from the latest completed job
    alloc_map: dict[str, dict] = {}
    latest_job = (
        await db.execute(
            select(Job)
            .where(Job.status == JobStatus.COMPLETED)
            .order_by(Job.created_at.desc())
            .limit(1)
        )
    ).scalar_one_or_none()

    if latest_job and latest_job.result_json:
        for impact in latest_job.result_json.get("inventory_impact", []):
            alloc_map[impact["sku_id"]] = impact

    result = []
    for r in rows:
        impact = alloc_map.get(r.sku_id)
        if impact:
            allocated = impact.get("allocated", 0)
            remaining = r.total_stock_available - allocated
            usage_pct = impact.get("usage_pct", 0.0) / 100.0
        else:
            allocated = 0
            remaining = r.total_stock_available
            usage_pct = 0.0

        result.append(
            InventoryListItem(
                sku_id=r.sku_id,
                description=r.description,
                total_stock_available=r.total_stock_available,
                allocated=allocated,
                remaining=remaining,
                usage_pct=usage_pct,
            )
        )

    return result

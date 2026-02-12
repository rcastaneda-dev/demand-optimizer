from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import get_db
from app.models.inventory import Inventory
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
    """List inventory with current stock. Usage percentages are populated after optimization."""
    rows = (await db.execute(select(Inventory).order_by(Inventory.sku_id))).scalars().all()
    return [
        InventoryListItem(
            sku_id=r.sku_id,
            description=r.description,
            total_stock_available=r.total_stock_available,
            allocated=0,
            remaining=r.total_stock_available,
            usage_pct=0.0,
        )
        for r in rows
    ]

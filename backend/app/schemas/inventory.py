from pydantic import BaseModel


class InventoryItem(BaseModel):
    sku_id: str
    description: str
    total_stock_available: int


class InventoryListItem(BaseModel):
    sku_id: str
    description: str
    total_stock_available: int
    allocated: int
    remaining: int
    usage_pct: float

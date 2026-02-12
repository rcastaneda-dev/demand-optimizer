from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Inventory(Base):
    __tablename__ = "inventory"

    sku_id: Mapped[str] = mapped_column(String, primary_key=True)
    description: Mapped[str] = mapped_column(String, nullable=False)
    total_stock_available: Mapped[int] = mapped_column(Integer, nullable=False)

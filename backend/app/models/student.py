from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class Student(Base):
    __tablename__ = "students"

    student_id: Mapped[str] = mapped_column(String, primary_key=True)
    school_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    uniform_size_sku: Mapped[str] = mapped_column(String, nullable=False)
    shoe_size_sku: Mapped[str] = mapped_column(String, nullable=False)

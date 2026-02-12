from pydantic import BaseModel


class SchoolProfile(BaseModel):
    school_id: str
    total_students: int
    sku_demand: dict[str, int]

from pydantic import BaseModel


class PickingItem(BaseModel):
    sku_id: str
    type: str  # "shirt", "pants", or "shoes"


class PickingStudent(BaseModel):
    student_id: str
    items: list[PickingItem]


class PickingSchool(BaseModel):
    school_id: str
    total_students: int
    students: list[PickingStudent]


class PickingList(BaseModel):
    schools: list[PickingSchool]

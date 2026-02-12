from pydantic import BaseModel


class StudentItem(BaseModel):
    student_id: str
    school_id: str
    shirt_sku: str
    pants_sku: str
    shoe_size_sku: str

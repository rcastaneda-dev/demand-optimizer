from datetime import datetime
from typing import Any

from pydantic import BaseModel


class JobCreated(BaseModel):
    job_id: int


class JobStatus(BaseModel):
    job_id: int
    status: str
    created_at: datetime
    result: Any | None = None

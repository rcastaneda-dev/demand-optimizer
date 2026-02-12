import csv
import io

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import get_db
from app.models.inventory import Inventory
from app.models.student import Student

router = APIRouter(prefix="/upload", tags=["upload"])

INVENTORY_COLUMNS = {"sku_id", "description", "total_stock_available"}
STUDENT_COLUMNS = {"student_id", "school_id", "shirt_sku", "pants_sku", "shoe_size_sku"}


class CSVPayload(BaseModel):
    csv_content: str


def _parse_csv(text: str, required_columns: set[str]) -> tuple[list[dict], list[str]]:
    """Parse CSV text, validate columns, return (rows, errors)."""
    # Strip BOM if present
    text = text.lstrip("\ufeff")
    reader = csv.DictReader(io.StringIO(text))

    if reader.fieldnames is None:
        raise HTTPException(status_code=400, detail="CSV is empty or has no header row")

    actual = {f.strip() for f in reader.fieldnames}
    missing = required_columns - actual
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(sorted(missing))}",
        )

    rows: list[dict] = []
    errors: list[str] = []
    for i, raw_row in enumerate(reader, start=2):  # row 1 is header
        row = {k.strip(): (v.strip() if v else "") for k, v in raw_row.items()}
        blank = [c for c in required_columns if not row.get(c)]
        if blank:
            errors.append(f"Row {i}: blank value(s) for {', '.join(sorted(blank))}")
            continue
        rows.append(row)

    return rows, errors


async def _upsert_inventory(rows: list[dict], errors: list[str], db: AsyncSession) -> dict:
    upserted = 0
    for row in rows:
        try:
            stock = int(row["total_stock_available"])
        except ValueError:
            errors.append(f"Invalid stock value for SKU {row['sku_id']}: {row['total_stock_available']}")
            continue

        existing = await db.get(Inventory, row["sku_id"])
        if existing:
            existing.description = row["description"]
            existing.total_stock_available = stock
        else:
            db.add(Inventory(
                sku_id=row["sku_id"],
                description=row["description"],
                total_stock_available=stock,
            ))
        upserted += 1

    await db.commit()
    return {"upserted": upserted, "errors": errors}


async def _upsert_students(rows: list[dict], errors: list[str], db: AsyncSession) -> dict:
    for row in rows:
        existing = await db.get(Student, row["student_id"])
        if existing:
            existing.school_id = row["school_id"]
            existing.shirt_sku = row["shirt_sku"]
            existing.pants_sku = row["pants_sku"]
            existing.shoe_size_sku = row["shoe_size_sku"]
        else:
            db.add(Student(
                student_id=row["student_id"],
                school_id=row["school_id"],
                shirt_sku=row["shirt_sku"],
                pants_sku=row["pants_sku"],
                shoe_size_sku=row["shoe_size_sku"],
            ))

    await db.commit()
    return {"upserted": len(rows), "errors": errors}


# ── File upload endpoints (curl / Postman) ──

@router.post("/inventory")
async def upload_inventory_csv(
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
):
    """Upload inventory data from a CSV file."""
    content = await file.read()
    rows, errors = _parse_csv(content.decode("utf-8-sig"), INVENTORY_COLUMNS)
    return await _upsert_inventory(rows, errors, db)


@router.post("/students")
async def upload_students_csv(
    file: UploadFile,
    db: AsyncSession = Depends(get_db),
):
    """Upload student enrollment data from a CSV file."""
    content = await file.read()
    rows, errors = _parse_csv(content.decode("utf-8-sig"), STUDENT_COLUMNS)
    return await _upsert_students(rows, errors, db)


# ── JSON body endpoints (mobile app) ──

@router.post("/inventory/text")
async def upload_inventory_text(
    payload: CSVPayload,
    db: AsyncSession = Depends(get_db),
):
    """Upload inventory data as CSV text in a JSON body."""
    rows, errors = _parse_csv(payload.csv_content, INVENTORY_COLUMNS)
    return await _upsert_inventory(rows, errors, db)


@router.post("/students/text")
async def upload_students_text(
    payload: CSVPayload,
    db: AsyncSession = Depends(get_db),
):
    """Upload student enrollment data as CSV text in a JSON body."""
    rows, errors = _parse_csv(payload.csv_content, STUDENT_COLUMNS)
    return await _upsert_students(rows, errors, db)

"""Seed the database with sample inventory and student data for testing."""

import asyncio

from sqlalchemy import select

from app.models import async_session, init_db, Inventory, Student

INVENTORY_SEED = [
    ("UNI-XS", "Uniform Extra Small", 200),
    ("UNI-S", "Uniform Small", 500),
    ("UNI-M", "Uniform Medium", 800),
    ("UNI-L", "Uniform Large", 600),
    ("UNI-XL", "Uniform Extra Large", 300),
    ("SHOE-5", "Shoes Size 5", 150),
    ("SHOE-6", "Shoes Size 6", 350),
    ("SHOE-7", "Shoes Size 7", 500),
    ("SHOE-8", "Shoes Size 8", 450),
    ("SHOE-9", "Shoes Size 9", 300),
    ("SHOE-10", "Shoes Size 10", 200),
]

STUDENTS_SEED = [
    # School A — 50 students
    *[(f"STU-A{i:03d}", "SCHOOL-A", "UNI-M", "SHOE-7") for i in range(1, 31)],
    *[(f"STU-A{i:03d}", "SCHOOL-A", "UNI-L", "SHOE-8") for i in range(31, 51)],
    # School B — 30 students
    *[(f"STU-B{i:03d}", "SCHOOL-B", "UNI-S", "SHOE-6") for i in range(1, 21)],
    *[(f"STU-B{i:03d}", "SCHOOL-B", "UNI-M", "SHOE-7") for i in range(21, 31)],
    # School C — 80 students (large school, may be constrained)
    *[(f"STU-C{i:03d}", "SCHOOL-C", "UNI-M", "SHOE-7") for i in range(1, 41)],
    *[(f"STU-C{i:03d}", "SCHOOL-C", "UNI-L", "SHOE-8") for i in range(41, 61)],
    *[(f"STU-C{i:03d}", "SCHOOL-C", "UNI-XL", "SHOE-9") for i in range(61, 81)],
    # School D — 20 students (small school)
    *[(f"STU-D{i:03d}", "SCHOOL-D", "UNI-XS", "SHOE-5") for i in range(1, 11)],
    *[(f"STU-D{i:03d}", "SCHOOL-D", "UNI-S", "SHOE-6") for i in range(11, 21)],
    # School E — 40 students
    *[(f"STU-E{i:03d}", "SCHOOL-E", "UNI-S", "SHOE-6") for i in range(1, 16)],
    *[(f"STU-E{i:03d}", "SCHOOL-E", "UNI-M", "SHOE-7") for i in range(16, 41)],
]


async def seed() -> None:
    await init_db()

    async with async_session() as session:
        # Only seed if tables are empty
        existing = (await session.execute(select(Inventory))).scalars().first()
        if existing:
            print("Database already seeded — skipping.")
            return

        for sku_id, description, stock in INVENTORY_SEED:
            session.add(
                Inventory(
                    sku_id=sku_id,
                    description=description,
                    total_stock_available=stock,
                )
            )

        for student_id, school_id, uniform_sku, shoe_sku in STUDENTS_SEED:
            session.add(
                Student(
                    student_id=student_id,
                    school_id=school_id,
                    uniform_size_sku=uniform_sku,
                    shoe_size_sku=shoe_sku,
                )
            )

        await session.commit()
        print(
            f"Seeded {len(INVENTORY_SEED)} inventory items "
            f"and {len(STUDENTS_SEED)} students across 5 schools."
        )


if __name__ == "__main__":
    asyncio.run(seed())

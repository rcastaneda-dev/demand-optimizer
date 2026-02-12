"""Seed the database with sample inventory and student data for testing."""

import asyncio

from sqlalchemy import select

from app.models import async_session, init_db, Inventory, Student

# ---------------------------------------------------------------------------
# Shirt SKUs: {type}-{size}  (2 types × 11 sizes = 22 SKUs)
# ---------------------------------------------------------------------------
SHIRT_TYPES = ["BLANCA", "CELESTE"]
SHIRT_SIZES = ["T1X", "T4", "T6", "T8", "T10", "T12", "T14", "T16", "T18", "T20", "T22"]

# ---------------------------------------------------------------------------
# Pants/Skirt SKUs: {type}-{size}  (6 types × 12 sizes = 72 SKUs)
# ---------------------------------------------------------------------------
PANTS_TYPES = [
    "FALDA AZUL CON TIRANTE",
    "FALDA AZUL",
    "FALDA BEIGE",
    "SHORT AZUL",
    "PANTALON BEIGE",
    "PANTALON AZUL",
]
PANTS_SIZES = [
    "T1X", "T2X", "T4", "T6", "T8", "T10", "T12", "T14", "T16", "T18", "T20", "T22",
]

# ---------------------------------------------------------------------------
# Shoe SKUs: ZAPATO-{size}
# ---------------------------------------------------------------------------
SHOE_SIZES = list(range(22, 42))  # sizes 22–41

# ---------------------------------------------------------------------------
# Build inventory seed list
# ---------------------------------------------------------------------------
INVENTORY_SEED: list[tuple[str, str, int]] = []

for shirt_type in SHIRT_TYPES:
    for size in SHIRT_SIZES:
        sku = f"{shirt_type}-{size}"
        INVENTORY_SEED.append((sku, f"Camisa {shirt_type} {size}", 300))

for pants_type in PANTS_TYPES:
    for size in PANTS_SIZES:
        sku = f"{pants_type}-{size}"
        INVENTORY_SEED.append((sku, f"{pants_type} {size}", 200))

for shoe_size in SHOE_SIZES:
    sku = f"ZAPATO-{shoe_size}"
    INVENTORY_SEED.append((sku, f"Zapato Talla {shoe_size}", 250))

# ---------------------------------------------------------------------------
# Student seed — 5 schools with varied uniform needs
# (student_id, school_id, shirt_sku, pants_sku, shoe_size_sku)
# ---------------------------------------------------------------------------
STUDENTS_SEED: list[tuple[str, str, str, str, str]] = [
    # School A — 50 students (primary school, younger kids)
    *[
        (f"STU-A{i:03d}", "SCHOOL-A", "BLANCA-T6", "FALDA AZUL-T6", "ZAPATO-28")
        for i in range(1, 21)
    ],
    *[
        (f"STU-A{i:03d}", "SCHOOL-A", "BLANCA-T8", "PANTALON AZUL-T8", "ZAPATO-30")
        for i in range(21, 51)
    ],
    # School B — 30 students (mixed sizes)
    *[
        (f"STU-B{i:03d}", "SCHOOL-B", "CELESTE-T10", "SHORT AZUL-T10", "ZAPATO-32")
        for i in range(1, 16)
    ],
    *[
        (f"STU-B{i:03d}", "SCHOOL-B", "CELESTE-T12", "PANTALON BEIGE-T12", "ZAPATO-34")
        for i in range(16, 31)
    ],
    # School C — 80 students (large school, wide size range)
    *[
        (f"STU-C{i:03d}", "SCHOOL-C", "BLANCA-T10", "FALDA AZUL CON TIRANTE-T10", "ZAPATO-33")
        for i in range(1, 31)
    ],
    *[
        (f"STU-C{i:03d}", "SCHOOL-C", "BLANCA-T14", "PANTALON AZUL-T14", "ZAPATO-36")
        for i in range(31, 61)
    ],
    *[
        (f"STU-C{i:03d}", "SCHOOL-C", "CELESTE-T18", "PANTALON AZUL-T18", "ZAPATO-39")
        for i in range(61, 81)
    ],
    # School D — 20 students (small school, youngest kids)
    *[
        (f"STU-D{i:03d}", "SCHOOL-D", "BLANCA-T1X", "FALDA BEIGE-T1X", "ZAPATO-22")
        for i in range(1, 11)
    ],
    *[
        (f"STU-D{i:03d}", "SCHOOL-D", "CELESTE-T4", "SHORT AZUL-T4", "ZAPATO-25")
        for i in range(11, 21)
    ],
    # School E — 40 students
    *[
        (f"STU-E{i:03d}", "SCHOOL-E", "CELESTE-T8", "FALDA AZUL-T8", "ZAPATO-30")
        for i in range(1, 21)
    ],
    *[
        (f"STU-E{i:03d}", "SCHOOL-E", "BLANCA-T12", "PANTALON BEIGE-T12", "ZAPATO-34")
        for i in range(21, 41)
    ],
]


async def seed() -> None:
    await init_db()

    async with async_session() as session:
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

        for student_id, school_id, shirt, pants, shoes in STUDENTS_SEED:
            session.add(
                Student(
                    student_id=student_id,
                    school_id=school_id,
                    shirt_sku=shirt,
                    pants_sku=pants,
                    shoe_size_sku=shoes,
                )
            )

        await session.commit()
        print(
            f"Seeded {len(INVENTORY_SEED)} inventory SKUs "
            f"and {len(STUDENTS_SEED)} students across 5 schools."
        )


if __name__ == "__main__":
    asyncio.run(seed())

# EquipRoute — Distribution Optimizer

A decision-support tool for optimizing school uniform and shoe distribution. Uses Integer Linear Programming (ILP) to maximize the number of students served while enforcing a 10% inventory safety buffer per SKU.

## How It Works

1. **Upload** inventory and student enrollment data
2. **Optimize** — the ILP solver selects the combination of schools that serves the most students without exceeding 90% of any SKU's stock
3. **Review** — selection report, inventory impact, and bottleneck SKU analysis

A school is only eligible if **100% of its students' needs** can be fulfilled (all-or-nothing).

## Uniform Kit

Each student receives a full kit of **3 items**, each tracked as a separate inventory SKU:

| Item | Types | Sizes |
|------|-------|-------|
| **Shirt** | BLANCA, CELESTE | T1X, T4, T6, T8, T10, T12, T14, T16, T18, T20, T22 |
| **Pants/Skirt** | FALDA AZUL CON TIRANTE, FALDA AZUL, FALDA BEIGE, SHORT AZUL, PANTALON BEIGE, PANTALON AZUL | T1X, T2X, T4, T6, T8, T10, T12, T14, T16, T18, T20, T22 |
| **Shoes** | ZAPATO | 22–41 |

SKU format: `{TYPE}-{SIZE}` (e.g. `BLANCA-T10`, `PANTALON AZUL-T14`, `ZAPATO-34`)

## Project Structure

```
backend/
  app/
    main.py            # FastAPI application entry point
    seed.py            # Database seed script with sample data
    models/            # SQLAlchemy models (Inventory, Student, Job)
    solver/            # Demand aggregation and ILP solver
    routes/            # API endpoint handlers
    schemas/           # Pydantic request/response schemas
  tests/
  pyproject.toml       # Python project config and dependencies
```

## Tech Stack

- **API:** FastAPI + Uvicorn
- **Solver:** Google OR-Tools (ILP)
- **Database:** SQLite via SQLAlchemy (async)
- **Python:** 3.11+

## Getting Started

```bash
cd backend
pip install -e ".[dev]"
python -c "import asyncio; from app.seed import seed; from app.models.base import engine; asyncio.run(seed()); asyncio.run(engine.dispose())"
uvicorn app.main:app --reload
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/inventory` | Upload/upsert inventory data |
| `GET` | `/inventory` | List all SKUs with stock levels |
| `POST` | `/students` | Upload/upsert student enrollment data |
| `GET` | `/schools` | List schools with aggregated demand profiles |
| `POST` | `/optimize` | Trigger the ILP solver (returns `job_id`) |
| `GET` | `/jobs/{job_id}` | Poll job status and retrieve results |
| `GET` | `/health` | Health check |

Interactive docs available at `/docs` when the server is running.

## Current Progress

- [x] **Phase 1.1** — Project setup (pyproject.toml, folder structure, dependencies)
- [x] **Phase 1.2** — Database layer (SQLAlchemy models, seed data, demand aggregation helper)
- [x] **Phase 1.3** — ILP solver (OR-Tools optimization engine)
- [x] **Phase 1.4** — API endpoints
- [ ] **Phase 2** — Expo mobile frontend
- [ ] **Phase 3** — Integration and warehouse features

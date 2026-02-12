# EquipRoute — Implementation Tasks

## Phase 1: Backend Foundation

### 1.1 Project Setup
- [x] Initialize Python project with `pyproject.toml` (Python 3.11+)
- [x] Install core dependencies: FastAPI, uvicorn, Google OR-Tools, SQLAlchemy
- [x] Create project folder structure:
  ```
  backend/
    app/
      main.py
      models/
      routes/
      solver/
      schemas/
    tests/
  ```

### 1.2 Database Layer (SQLite)
- [x] Define SQLAlchemy models:
  - `Inventory` — `sku_id`, `description`, `total_stock_available`
  - `Student` — `student_id`, `school_id`, `uniform_size_sku`, `shoe_size_sku`
  - `Job` — `job_id`, `status` (PENDING/PROCESSING/COMPLETED), `result_json`, `created_at`
- [x] Create database initialization script and seed data for testing
- [x] Write helper to aggregate student demand into School Demand Profiles (FR1)

### 1.3 The ILP Solver (Core Logic)
- [x] Implement school demand aggregation: sum SKU needs per school, compute `total_students` per school
- [x] Implement the OR-Tools ILP solver (FR4):
  - Binary decision variable per school (serve=1 / skip=0)
  - Objective: maximize total students served
  - Constraints: for each SKU, total demand of selected schools ≤ 90% of stock
- [x] Generate output reports:
  - **Selection Report** — list of approved `school_id`s
  - **Inventory Impact Report** — predicted post-distribution stock levels
  - **Shortage Report** — bottleneck SKUs blocking the next-largest excluded school
- [x] Write unit tests for the solver with known-answer scenarios

### 1.4 API Endpoints
- [x] `POST /optimize` — triggers solver as a BackgroundTask, returns `job_id`
- [x] `GET /jobs/{job_id}` — returns job status and results when completed
- [x] `POST /inventory` — upload/upsert inventory data
- [x] `POST /students` — upload/upsert student enrollment data
- [x] `GET /schools` — list schools with aggregated demand profiles
- [x] `GET /inventory` — list inventory with current stock and usage percentages

---

## Phase 2: Expo Mobile Frontend

### 2.1 Project Setup
- [x] Initialize Expo (React Native) project
- [x] Install NativeWind and configure Tailwind
- [x] Set up React Context for global state (job status, school list, inventory)
- [x] Configure API client pointing to FastAPI backend

### 2.2 Optimization Dashboard (Home Screen)
- [x] Build header with Global Health bar (total student coverage)
- [x] Build summary status cards: Eligible Schools vs. Blocked Schools
- [x] Build the "Optimize" FAB that calls `POST /optimize`
- [x] Implement job polling: hit `GET /jobs/{id}` until status is COMPLETED

### 2.3 School Selection List (Output View)
- [x] Build school card component:
  - School name & district (left)
  - Kit Readiness progress bar (center)
  - Student count (right)
  - Fulfillment Badge (green pill with checkmark for selected schools)
- [x] Rank schools by student count
- [x] Add Quick Filter sticky bar (Most Students / Fewest Bottlenecks)
- [x] Tap-to-expand: show per-school shopping list of sizes

### 2.4 Inventory Safety Wall (Monitor View)
- [x] Build horizontal gauge charts for each SKU showing usage vs. 90% cap
  - Gauge turns red as it nears the safety buffer
- [x] Highlight bottleneck SKU insight message
  - e.g., "Missing 12 pairs of Size 8 shoes to unlock Springfield High"

### 2.5 Navigation & Polish
- [ ] Set up tab/stack navigation: Home → Approved Schools → Inventory Health → Warehouse Prep
- [ ] Apply design tokens: colors (#2D5BFF, #27AE60, #F2994A, #EB5757), Inter/Roboto fonts
- [ ] Glassmorphism card styling for selected vs. excluded schools

---

## Phase 3: Integration & Warehouse Features

### 3.1 Data Upload Flow
- [ ] Build file upload screen for inventory and student enrollment CSVs
- [ ] Backend CSV parsing and validation endpoint

### 3.2 Warehouse Picking View
- [ ] Backend endpoint: generate picking list grouped by School → Student → Items
- [ ] Frontend screen rendering the picking list

### 3.3 Mobile-Specific Features
- [ ] Pull-to-refresh for re-syncing inventory levels
- [ ] Haptic feedback when 90% limit is breached during manual adjustments
- [ ] Scan-to-Verify: camera-based barcode scanner for warehouse kit verification

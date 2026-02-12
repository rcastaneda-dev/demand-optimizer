# Tech Stack Definition: EquipRoute (Lightweight Version)

## 1. Core Architecture
* **Pattern:** Monolithic Backend with a Mobile Frontend.
* **Processing Model:** **In-Process Background Tasks.** The server handles optimization requests in the background without needing an external message broker.

---

## 2. The Backend (Python-Centric)
We keep the logic in Python to leverage the OR-Tools library but simplify the surrounding "plumbing."

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Language** | **Python 3.11+** | Required for mathematical optimization libraries. |
| **Solver** | **Google OR-Tools** | The "Engine" that solves the school-level allocation problem. |
| **Framework** | **FastAPI** | Includes built-in `BackgroundTasks` to run the solver without blocking the API. |
| **Task Handler** | **FastAPI BackgroundTasks** | Replaces Celery. Handles the optimization job in a separate thread on the same server. |

---

## 3. The Data Layer (SQLite-First)
Since we are removing Redis, we can use the database itself to track job status.

* **Primary Database:** **SQLite** (or PostgreSQL if scaling is a concern).
    * *Why:* For many internal tools, SQLite is more than enough. It's a single file, requires zero configuration, and handles relational data perfectly.
* **State Tracking:** A `jobs` table in SQLite replaces Redis.
    * *Columns:* `job_id`, `status` (PENDING, PROCESSING, COMPLETED), `result_json`.

---

## 4. The Frontend (Mobile UI)
To match the high-fidelity design without adding complex state libraries:

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | **Expo (React Native)** | The fastest way to build and deploy the Dribbble-inspired UI. |
| **State Management** | **React Context + Hooks** | Replaces heavy state libraries. Simple and sufficient for this app's flow. |
| **Styling** | **NativeWind** | Utility-first CSS for mobile, making it easy to replicate the "Smart Order" look. |

---

## 5. Simplified Data Flow
1.  **Mobile App** hits `/optimize`.
2.  **FastAPI** creates a record in the `jobs` table and triggers a `BackgroundTask`.
3.  **FastAPI** immediately returns the `job_id` to the Mobile App.
4.  **The Solver** runs in the background. When finished, it updates the `jobs` table with the list of approved schools.
5.  **Mobile App** polls `/job/{id}` every few seconds until the status is `COMPLETED`.
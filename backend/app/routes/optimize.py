import dataclasses

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import get_db, async_session
from app.models.inventory import Inventory
from app.models.job import Job, JobStatus
from app.schemas.job import JobCreated, JobStatus as JobStatusSchema
from app.solver.demand import aggregate_demand
from app.solver.optimizer import solve

router = APIRouter(tags=["optimize"])


async def _run_solver(job_id: int) -> None:
    """Background task: run the ILP solver and persist the result."""
    async with async_session() as db:
        job = await db.get(Job, job_id)
        if job is None:
            return

        job.status = JobStatus.PROCESSING
        await db.commit()

        profiles = await aggregate_demand(db)
        rows = (await db.execute(select(Inventory))).scalars().all()
        inv = {r.sku_id: r.total_stock_available for r in rows}

        result = solve(profiles, inv)

        job.status = JobStatus.COMPLETED
        job.result_json = dataclasses.asdict(result)
        await db.commit()


@router.post("/optimize", response_model=JobCreated, status_code=202)
async def trigger_optimize(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Trigger the solver as a background task. Returns the job_id immediately."""
    job = Job()
    db.add(job)
    await db.commit()
    await db.refresh(job)

    background_tasks.add_task(_run_solver, job.job_id)
    return JobCreated(job_id=job.job_id)


@router.get("/jobs/{job_id}", response_model=JobStatusSchema)
async def get_job(job_id: int, db: AsyncSession = Depends(get_db)):
    """Return job status and results when completed."""
    job = await db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")

    return JobStatusSchema(
        job_id=job.job_id,
        status=job.status.value,
        created_at=job.created_at,
        result=job.result_json,
    )

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import List
from uuid import UUID

from .. import models, schemas
from ..deps import get_db, get_current_active_user

router = APIRouter(
    prefix="/progress",
    tags=["progress"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[schemas.UserProgress])
async def get_user_progress(
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    query = select(models.UserProgress).where(models.UserProgress.user_id == current_user.id)
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=schemas.UserProgress)
async def update_progress(
    progress: schemas.UserProgressCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    # Check if already exists
    query = select(models.UserProgress).where(
        models.UserProgress.user_id == current_user.id,
        models.UserProgress.roadmap_step_id == progress.roadmap_step_id
    )
    result = await db.execute(query)
    existing_progress = result.scalars().first()

    if existing_progress:
        existing_progress.is_completed = progress.is_completed
        await db.commit()
        await db.refresh(existing_progress)
        return existing_progress
    
    # Create new
    new_progress = models.UserProgress(
        user_id=current_user.id,
        roadmap_step_id=progress.roadmap_step_id,
        is_completed=progress.is_completed
    )
    db.add(new_progress)
    await db.commit()
    await db.refresh(new_progress)
    return new_progress

@router.delete("/{roadmap_step_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_progress(
    roadmap_step_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    query = select(models.UserProgress).where(
        models.UserProgress.user_id == current_user.id,
        models.UserProgress.roadmap_step_id == roadmap_step_id
    )
    result = await db.execute(query)
    progress = result.scalars().first()
    
    if progress:
        await db.delete(progress)
        await db.commit()
    
    return None

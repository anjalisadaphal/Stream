from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from .. import models, schemas
from ..deps import get_db, get_current_admin_user, get_current_active_user

router = APIRouter(
    prefix="/content",
    tags=["content"],
    responses={404: {"description": "Not found"}},
)

# Roadmaps

@router.post("/roadmaps", response_model=schemas.Roadmap)
async def create_roadmap(
    roadmap: schemas.RoadmapCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    db_roadmap = models.Roadmap(**roadmap.model_dump())
    db.add(db_roadmap)
    await db.commit()
    await db.refresh(db_roadmap)
    return db_roadmap

@router.get("/roadmaps", response_model=List[schemas.Roadmap])
async def read_roadmaps(
    domain: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    query = select(models.Roadmap)
    if domain:
        query = query.where(models.Roadmap.domain == domain)
    # Order by step_number
    query = query.order_by(models.Roadmap.step_number)
    result = await db.execute(query)
    return result.scalars().all()

@router.delete("/roadmaps/{roadmap_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_roadmap(
    roadmap_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    query = select(models.Roadmap).where(models.Roadmap.id == roadmap_id)
    result = await db.execute(query)
    roadmap = result.scalars().first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    
    await db.delete(roadmap)
    await db.commit()
    return None

# Resources

@router.post("/resources", response_model=schemas.Resource)
async def create_resource(
    resource: schemas.ResourceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    db_resource = models.Resource(**resource.model_dump())
    db.add(db_resource)
    await db.commit()
    await db.refresh(db_resource)
    return db_resource

@router.get("/resources", response_model=List[schemas.Resource])
async def read_resources(
    domain: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    query = select(models.Resource)
    if domain:
        query = query.where(models.Resource.domain == domain)
    result = await db.execute(query)
    return result.scalars().all()

@router.delete("/resources/{resource_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resource(
    resource_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_admin_user)
):
    query = select(models.Resource).where(models.Resource.id == resource_id)
    result = await db.execute(query)
    resource = result.scalars().first()
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    await db.delete(resource)
    await db.commit()
    return None

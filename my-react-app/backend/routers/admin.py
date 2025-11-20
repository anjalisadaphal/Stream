from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List, Dict, Any
from .. import models, schemas, deps

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(deps.get_current_admin_user)]
)

@router.get("/stats")
async def get_admin_stats(db: AsyncSession = Depends(deps.get_db)):
    # Count questions
    questions_result = await db.execute(select(func.count(models.Question.id)))
    questions_count = questions_result.scalar() or 0
    
    # Count users
    users_result = await db.execute(select(func.count(models.User.id)))
    users_count = users_result.scalar() or 0
    
    # Count attempts
    attempts_result = await db.execute(select(func.count(models.QuizAttempt.id)))
    attempts_count = attempts_result.scalar() or 0
    
    return {
        "totalQuestions": questions_count,
        "totalUsers": users_count,
        "assessmentsTaken": attempts_count
    }

@router.post("/questions", response_model=schemas.Question)
async def create_question(
    question_in: schemas.QuestionCreate,
    db: AsyncSession = Depends(deps.get_db)
):
    new_question = models.Question(**question_in.dict())
    db.add(new_question)
    await db.commit()
    await db.refresh(new_question)
    return new_question

@router.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    db: AsyncSession = Depends(deps.get_db)
):
    result = await db.execute(select(models.Question).where(models.Question.id == question_id))
    question = result.scalars().first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
        
    await db.delete(question)
    await db.commit()
    return {"message": "Question deleted successfully"}

@router.get("/users", response_model=List[schemas.User]) # Or a specific AdminUserSchema
async def get_users(db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(models.User))
    users = result.scalars().all()
    return users

@router.get("/attempts/all", response_model=List[schemas.QuizAttempt])
async def get_all_attempts(db: AsyncSession = Depends(deps.get_db)):
    result = await db.execute(select(models.QuizAttempt).order_by(models.QuizAttempt.completed_at.desc()))
    attempts = result.scalars().all()
    return attempts

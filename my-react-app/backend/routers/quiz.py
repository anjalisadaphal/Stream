from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from uuid import UUID
from .. import models, schemas, deps

router = APIRouter(
    prefix="/quiz",
    tags=["quiz"],
)

@router.get("/questions", response_model=List[schemas.Question])
async def get_questions(
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    # Fetch 30 random questions from the database
    result = await db.execute(
        select(models.Question)
        .order_by(func.random())
        .limit(30)
    )
    questions = result.scalars().all()
    return questions

@router.get("/attempts", response_model=List[schemas.QuizAttempt])
async def get_attempts(
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    result = await db.execute(
        select(models.QuizAttempt)
        .where(models.QuizAttempt.user_id == current_user.id)
        .order_by(models.QuizAttempt.completed_at.desc())
    )
    attempts = result.scalars().all()
    return attempts

@router.post("/attempts", response_model=schemas.QuizAttempt)
async def create_attempt(
    attempt_in: schemas.QuizAttemptCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    # Calculate scores based on responses
    # Fetch all questions to verify answers
    result = await db.execute(select(models.Question))
    questions = {q.id: q for q in result.scalars().all()}
    
    programmer_score = 0
    analytics_score = 0
    tester_score = 0
    total_score = 0
    
    db_responses = []
    
    for response in attempt_in.responses:
        question = questions.get(response.question_id)
        if not question:
            continue
            
        is_correct = (question.correct_answer == response.selected_answer)
        
        if is_correct:
            total_score += 1
            if question.domain == models.QuizDomain.programmer:
                programmer_score += 1
            elif question.domain == models.QuizDomain.analytics:
                analytics_score += 1
            elif question.domain == models.QuizDomain.tester:
                tester_score += 1
        
        db_responses.append(models.QuizResponse(
            question_id=response.question_id,
            selected_answer=response.selected_answer,
            is_correct=is_correct
        ))

    # Determine recommended domain
    scores = {
        models.QuizDomain.programmer: programmer_score,
        models.QuizDomain.analytics: analytics_score,
        models.QuizDomain.tester: tester_score
    }
    recommended_domain = max(scores, key=scores.get)
    
    # Create attempt
    new_attempt = models.QuizAttempt(
        user_id=current_user.id,
        recommended_domain=recommended_domain,
        programmer_score=programmer_score,  # 1 mark per correct answer
        analytics_score=analytics_score,    # 1 mark per correct answer
        tester_score=tester_score,          # 1 mark per correct answer
        total_score=total_score             # 1 mark per correct answer
    )
    
    db.add(new_attempt)
    await db.flush()  # Flush to get the ID without committing
    
    # Add responses
    for resp in db_responses:
        resp.attempt_id = new_attempt.id
        db.add(resp)
    
    await db.commit()
    await db.refresh(new_attempt)
    
    return new_attempt

@router.get("/attempts/{attempt_id}/ai-guidance")
async def get_ai_guidance(
    attempt_id: str,
    db: AsyncSession = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Generate AI-powered career guidance for a specific quiz attempt.
    Returns personalized roadmap, job profiles, skills to improve, and resources.
    """
    from ..services import gemini_service
    
    # Fetch the attempt
    result = await db.execute(
        select(models.QuizAttempt)
        .where(models.QuizAttempt.id == UUID(attempt_id))
        .where(models.QuizAttempt.user_id == current_user.id)
    )
    attempt = result.scalars().first()
    
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    
    try:
        # Generate AI guidance
        guidance = await gemini_service.generate_career_guidance(
            recommended_domain=attempt.recommended_domain.value,
            programmer_score=attempt.programmer_score,
            analytics_score=attempt.analytics_score,
            tester_score=attempt.tester_score,
            total_score=attempt.total_score
        )
        
        return guidance
        
    except ValueError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate AI guidance: {str(e)}")

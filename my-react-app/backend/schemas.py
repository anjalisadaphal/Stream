from pydantic import BaseModel, EmailStr, UUID4
from typing import Optional, List
from datetime import datetime
from .models import AppRole, QuizDomain, DifficultyLevel

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None

class UserLogin(UserBase):
    password: str

class User(UserBase):
    id: UUID4
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Profile Schemas
class ProfileBase(BaseModel):
    full_name: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: UUID4
    email: EmailStr
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Question Schemas
class QuestionBase(BaseModel):
    question_text: str
    option_1: str
    option_2: str
    option_3: str
    option_4: str
    domain: QuizDomain
    difficulty: DifficultyLevel

class QuestionCreate(QuestionBase):
    correct_answer: int

class Question(QuestionBase):
    id: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Quiz Attempt Schemas
class QuizResponseBase(BaseModel):
    question_id: UUID4
    selected_answer: int

class QuizResponseCreate(QuizResponseBase):
    pass

class QuizResponse(QuizResponseBase):
    id: UUID4
    is_correct: bool
    created_at: datetime

    class Config:
        from_attributes = True

class QuizAttemptBase(BaseModel):
    recommended_domain: QuizDomain
    programmer_score: int
    analytics_score: int
    tester_score: int
    total_score: int

class QuizAttemptCreate(BaseModel):
    responses: List[QuizResponseCreate]

class QuizAttempt(QuizAttemptBase):
    id: UUID4
    user_id: UUID4
    share_id: UUID4
    completed_at: datetime
    # responses: List[QuizResponse] = [] # Optional to include responses

    class Config:
        from_attributes = True

# Roadmap Schemas
class RoadmapBase(BaseModel):
    domain: str
    step_number: int
    title: str
    description: str

class RoadmapCreate(RoadmapBase):
    pass

class Roadmap(RoadmapBase):
    id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

# Resource Schemas
class ResourceBase(BaseModel):
    domain: str
    title: str
    link: str
    type: str

class ResourceCreate(ResourceBase):
    pass

class Resource(ResourceBase):
    id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

# User Progress Schemas
class UserProgressBase(BaseModel):
    roadmap_step_id: UUID4
    is_completed: bool

class UserProgressCreate(UserProgressBase):
    pass

class UserProgress(UserProgressBase):
    id: UUID4
    user_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True

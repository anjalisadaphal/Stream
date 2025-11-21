from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import timedelta
from .. import models, schemas, auth, deps

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)

@router.post("/register", response_model=schemas.Token)
async def register(user: schemas.UserCreate, db: AsyncSession = Depends(deps.get_db)):
    try:
        # Check if user exists
        result = await db.execute(select(models.User).where(models.User.email == user.email))
        db_user = result.scalars().first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        hashed_password = auth.get_password_hash(user.password)
        new_user = models.User(email=user.email, hashed_password=hashed_password)
        db.add(new_user)
        await db.flush()  # Generate ID without committing transaction
        
        # Create profile
        new_profile = models.Profile(id=new_user.id, email=new_user.email, full_name=user.full_name or user.email)
        db.add(new_profile)
        
        # Assign default role
        new_role = models.UserRole(user_id=new_user.id, role=models.AppRole.user)
        db.add(new_role)
        
        await db.commit()
        await db.refresh(new_user)
        
        # Create access token
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": new_user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException as he:
        await db.rollback()
        raise he
    except Exception as e:
        await db.rollback()
        print(f"Registration error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.post("/login", response_model=schemas.Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(deps.get_db)):
    try:
        result = await db.execute(select(models.User).where(models.User.email == form_data.username))
        user = result.scalars().first()
        
        if not user or not auth.verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = auth.create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")

@router.get("/me")
async def read_users_me(
    current_user: models.User = Depends(deps.get_current_active_user),
    db: AsyncSession = Depends(deps.get_db)
):
    # Fetch user with profile and roles
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(models.User)
        .options(selectinload(models.User.profile))
        .options(selectinload(models.User.roles))
        .where(models.User.id == current_user.id)
    )
    user = result.scalars().first()
    
    # Get user roles
    roles = [role.role.value for role in user.roles] if user.roles else []
    
    # Return user data with profile and roles
    return {
        "id": str(user.id),
        "email": user.email,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
        "full_name": user.profile.full_name if user.profile else user.email,
        "roles": roles,
        "is_admin": "admin" in roles
    }

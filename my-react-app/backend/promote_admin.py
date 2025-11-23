import asyncio
import os
import sys
import argparse
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from dotenv import load_dotenv

# Add parent directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models import User, UserRole, AppRole
from backend.database import Base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
    elif DATABASE_URL.startswith("postgresql://"):
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# Fix for Render: Append ?ssl=require if not already present and not localhost
if DATABASE_URL and "localhost" not in DATABASE_URL and "?ssl=" not in DATABASE_URL:
    DATABASE_URL += "?ssl=require"

async def promote_user(email: str):
    if not DATABASE_URL:
        print("Error: DATABASE_URL is not set.")
        return

    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Find user
        print(f"Searching for user with email: {email}")
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalars().first()

        if not user:
            print(f"Error: User with email '{email}' not found.")
            return

        # Check existing roles
        result = await session.execute(select(UserRole).where(UserRole.user_id == user.id))
        roles = result.scalars().all()
        
        is_admin = any(r.role == AppRole.admin for r in roles)
        
        if is_admin:
            print(f"User '{email}' is already an Admin.")
        else:
            print(f"Promoting '{email}' to Admin...")
            new_role = UserRole(user_id=user.id, role=AppRole.admin)
            session.add(new_role)
            await session.commit()
            print(f"Success! '{email}' is now an Admin.")

    await engine.dispose()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Promote a user to Admin.")
    parser.add_argument("email", type=str, help="The email address of the user to promote")
    args = parser.parse_args()

    asyncio.run(promote_user(args.email))

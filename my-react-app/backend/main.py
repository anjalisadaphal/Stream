from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import logging
import os
from contextlib import asynccontextmanager
from .database import engine, Base

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting application...")
    
    # Log DB URL status (masked)
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        safe_url = db_url.split("@")[-1] if "@" in db_url else "..."
        logger.info(f"DATABASE_URL is set. Host: {safe_url}")
    else:
        logger.error("DATABASE_URL is NOT set!")

    try:
        # Create tables on startup
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created successfully.")
    except Exception as e:
        logger.error(f"Error initializing database: {e}")
        # Don't raise, so the app can still start and we can see logs
        
    yield

app = FastAPI(title="Stream Backend", lifespan=lifespan)

# Configure CORS - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=False,  # Must be False when allow_origins is ["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)

from .routers import auth, quiz, admin

app.include_router(auth.router)
app.include_router(quiz.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Stream API"}

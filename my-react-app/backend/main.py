from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Stream Backend")

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

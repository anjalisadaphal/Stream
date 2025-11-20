import asyncio
import sys
import os

# Add the parent directory to sys.path to allow imports from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, Base
from backend import models

async def init_models():
    try:
        async with engine.begin() as conn:
            # await conn.run_sync(Base.metadata.drop_all) # Uncomment to reset DB
            await conn.run_sync(Base.metadata.create_all)
        print("Tables created successfully.")
    except Exception as e:
        print(f"Error creating tables: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(init_models())

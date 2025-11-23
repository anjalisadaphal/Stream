import os
from dotenv import load_dotenv
from sqlalchemy.engine.url import make_url

load_dotenv()

url_str = os.getenv("DATABASE_URL")

if not url_str:
    print("DATABASE_URL is NOT set in .env")
else:
    try:
        # Handle the replacement logic we use in the scripts
        if url_str.startswith("postgres://"):
            url_str = url_str.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url_str.startswith("postgresql://"):
            url_str = url_str.replace("postgresql://", "postgresql+asyncpg://", 1)
            
        url = make_url(url_str)
        print(f"Drivername: {url.drivername}")
        print(f"Username:   {url.username}")
        print(f"Password:   {'******' if url.password else 'None'}")
        print(f"Host:       {url.host}")
        print(f"Port:       {url.port}")
        print(f"Database:   {url.database}")
        
        if url.username == "postgresql":
            print("\nWARNING: The username is 'postgresql'. This is unusual. Did you mean 'postgres'?")
            
    except Exception as e:
        print(f"Error parsing URL: {e}")

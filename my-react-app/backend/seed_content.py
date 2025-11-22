import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from models import Roadmap, Resource, QuizDomain

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

roadmaps_data = [
    # Programmer
    {"domain": "programmer", "step_number": 1, "title": "Master the Fundamentals", "description": "Learn Python/JavaScript in depth. Understand variables, loops, functions, and data types."},
    {"domain": "programmer", "step_number": 2, "title": "Learn a Framework", "description": "Pick a web framework like React, Django, or Node.js and build a simple application."},
    {"domain": "programmer", "step_number": 3, "title": "Understand Databases", "description": "Learn SQL basics (SELECT, INSERT, UPDATE) and how to connect a database to your app."},
    {"domain": "programmer", "step_number": 4, "title": "Build Projects", "description": "Create 3-5 portfolio projects (e.g., To-Do App, Weather App, Blog)."},
    {"domain": "programmer", "step_number": 5, "title": "Prepare for Interviews", "description": "Practice Data Structures & Algorithms (DSA) on LeetCode or HackerRank."},

    # Analytics
    {"domain": "analytics", "step_number": 1, "title": "Learn SQL Fundamentals", "description": "Master database queries, joins, and aggregations. This is the core of analytics."},
    {"domain": "analytics", "step_number": 2, "title": "Data Visualization", "description": "Learn to create charts and dashboards using Excel, Tableau, or Power BI."},
    {"domain": "analytics", "step_number": 3, "title": "Python for Analytics", "description": "Learn Python libraries like Pandas, NumPy, and Matplotlib for data manipulation."},
    {"domain": "analytics", "step_number": 4, "title": "Build Analytics Projects", "description": "Find a dataset on Kaggle and perform a complete analysis, visualizing your findings."},
    {"domain": "analytics", "step_number": 5, "title": "Advanced Analytics", "description": "Introduction to Machine Learning basics and statistical modeling."},

    # Tester
    {"domain": "tester", "step_number": 1, "title": "Testing Fundamentals", "description": "Understand manual testing concepts, SDLC, STLC, and bug life cycle."},
    {"domain": "tester", "step_number": 2, "title": "Test Automation", "description": "Learn an automation tool like Selenium, Cypress, or Playwright."},
    {"domain": "tester", "step_number": 3, "title": "API Testing", "description": "Learn how to test APIs using Postman or REST Assured."},
    {"domain": "tester", "step_number": 4, "title": "Build Test Projects", "description": "Create a comprehensive test suite for a demo website."},
    {"domain": "tester", "step_number": 5, "title": "CI/CD Integration", "description": "Learn how to integrate your tests into a CI/CD pipeline (e.g., GitHub Actions)."},
]

resources_data = [
    # Programmer
    {"domain": "programmer", "title": "Full Stack Web Development", "link": "https://www.udemy.com/course/the-web-developer-bootcamp/", "type": "Course"},
    {"domain": "programmer", "title": "FreeCodeCamp", "link": "https://www.freecodecamp.org/", "type": "Course"},
    {"domain": "programmer", "title": "MDN Web Docs", "link": "https://developer.mozilla.org/", "type": "Guide"},
    
    # Analytics
    {"domain": "analytics", "title": "Google Data Analytics Certificate", "link": "https://www.coursera.org/professional-certificates/google-data-analytics", "type": "Course"},
    {"domain": "analytics", "title": "Kaggle", "link": "https://www.kaggle.com/", "type": "Practice"},
    {"domain": "analytics", "title": "Tableau Public", "link": "https://public.tableau.com/en-us/s/", "type": "Tool"},

    # Tester
    {"domain": "tester", "title": "Ministry of Testing", "link": "https://www.ministryoftesting.com/", "type": "Community"},
    {"domain": "tester", "title": "TestAutomationUniversity", "link": "https://testautomationuniversity.applitools.com/", "type": "Course"},
    {"domain": "tester", "title": "Selenium Documentation", "link": "https://www.selenium.dev/documentation/", "type": "Guide"},
]

async def seed_data():
    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        print("Seeding roadmaps...")
        for item in roadmaps_data:
            roadmap = Roadmap(**item)
            session.add(roadmap)
        
        print("Seeding resources...")
        for item in resources_data:
            resource = Resource(**item)
            session.add(resource)
            
        await session.commit()
        print("Seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())

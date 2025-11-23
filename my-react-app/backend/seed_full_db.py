import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from dotenv import load_dotenv

# Add parent directory to path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models import Question, Roadmap, Resource, QuizDomain, DifficultyLevel
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

# --- DATA ---

questions_data = [
    # Programmer Domain
    {
        "question_text": "Which of the following is a mutable data type in Python?",
        "option_1": "Tuple",
        "option_2": "String",
        "option_3": "List",
        "option_4": "Integer",
        "correct_answer": 3,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "What does HTML stand for?",
        "option_1": "Hyper Text Markup Language",
        "option_2": "High Tech Modern Language",
        "option_3": "Hyper Transfer Mark Language",
        "option_4": "Home Tool Markup Language",
        "correct_answer": 1,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "Which symbol is used for comments in Python?",
        "option_1": "//",
        "option_2": "/* */",
        "option_3": "#",
        "option_4": "--",
        "correct_answer": 3,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "What is the time complexity of accessing an element in an array by index?",
        "option_1": "O(n)",
        "option_2": "O(1)",
        "option_3": "O(log n)",
        "option_4": "O(n^2)",
        "correct_answer": 2,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "Which keyword is used to define a function in JavaScript?",
        "option_1": "def",
        "option_2": "func",
        "option_3": "function",
        "option_4": "method",
        "correct_answer": 3,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },

    # Analytics Domain
    {
        "question_text": "Which SQL clause is used to filter records?",
        "option_1": "GROUP BY",
        "option_2": "ORDER BY",
        "option_3": "WHERE",
        "option_4": "LIMIT",
        "correct_answer": 3,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "What type of chart is best for showing trends over time?",
        "option_1": "Pie Chart",
        "option_2": "Bar Chart",
        "option_3": "Line Chart",
        "option_4": "Scatter Plot",
        "correct_answer": 3,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "In statistics, what is the 'mean'?",
        "option_1": "The middle value",
        "option_2": "The most frequent value",
        "option_3": "The average value",
        "option_4": "The highest value",
        "correct_answer": 3,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "Which Python library is primarily used for data manipulation?",
        "option_1": "Matplotlib",
        "option_2": "Pandas",
        "option_3": "Flask",
        "option_4": "PyGame",
        "correct_answer": 2,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "What does CSV stand for?",
        "option_1": "Computer Style View",
        "option_2": "Comma Separated Values",
        "option_3": "Common Sheet Version",
        "option_4": "Code Syntax Value",
        "correct_answer": 2,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.easy
    },

    # Tester Domain
    {
        "question_text": "What is the main purpose of regression testing?",
        "option_1": "To test new features",
        "option_2": "To ensure existing functionality still works after changes",
        "option_3": "To test the user interface",
        "option_4": "To test performance",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "Which of these is a valid bug severity level?",
        "option_1": "High",
        "option_2": "Complex",
        "option_3": "Slow",
        "option_4": "Difficult",
        "correct_answer": 1,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "What does SDLC stand for?",
        "option_1": "System Design Life Cycle",
        "option_2": "Software Development Life Cycle",
        "option_3": "Software Design Logic Code",
        "option_4": "System Development Loop Code",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "Which tool is commonly used for API testing?",
        "option_1": "Selenium",
        "option_2": "Postman",
        "option_3": "Jira",
        "option_4": "Git",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "What is 'Black Box' testing?",
        "option_1": "Testing with knowledge of the internal code",
        "option_2": "Testing without knowledge of the internal code",
        "option_3": "Testing only the database",
        "option_4": "Testing only at night",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },
]

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
    if not DATABASE_URL:
        print("Error: DATABASE_URL is not set.")
        return

    engine = create_async_engine(DATABASE_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 1. Seed Questions
        print("Checking Questions...")
        result = await session.execute(select(Question))
        existing_questions = result.scalars().all()
        
        if not existing_questions:
            print("Seeding Questions...")
            for q_data in questions_data:
                question = Question(**q_data)
                session.add(question)
        else:
            print(f"Questions already exist ({len(existing_questions)} found). Skipping.")

        # 2. Seed Roadmaps
        print("Checking Roadmaps...")
        result = await session.execute(select(Roadmap))
        existing_roadmaps = result.scalars().all()

        if not existing_roadmaps:
            print("Seeding Roadmaps...")
            for r_data in roadmaps_data:
                roadmap = Roadmap(**r_data)
                session.add(roadmap)
        else:
            print(f"Roadmaps already exist ({len(existing_roadmaps)} found). Skipping.")

        # 3. Seed Resources
        print("Checking Resources...")
        result = await session.execute(select(Resource))
        existing_resources = result.scalars().all()

        if not existing_resources:
            print("Seeding Resources...")
            for res_data in resources_data:
                resource = Resource(**res_data)
                session.add(resource)
        else:
            print(f"Resources already exist ({len(existing_resources)} found). Skipping.")

        await session.commit()
        print("Database seeding completed!")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_data())

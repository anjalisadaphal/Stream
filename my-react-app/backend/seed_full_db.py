import asyncio
import os
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
from dotenv import load_dotenv
# Add a flag to force reseeding (set FORCE_RESEED=true in .env to enable)
FORCE_RESEED = os.getenv("FORCE_RESEED", "false").lower() == "true"

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

    # ------------------ DSA ------------------
    {
        "question_text": "Which data structure uses FIFO (First In First Out)?",
        "option_1": "Stack",
        "option_2": "Queue",
        "option_3": "Tree",
        "option_4": "Graph",
        "correct_answer": 2,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "What is the worst-case time complexity of Quick Sort?",
        "option_1": "O(n log n)",
        "option_2": "O(n)",
        "option_3": "O(n²)",
        "option_4": "O(log n)",
        "correct_answer": 3,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "Which traversal of a binary tree visits nodes in Left → Root → Right?",
        "option_1": "Inorder",
        "option_2": "Preorder",
        "option_3": "Postorder",
        "option_4": "Level Order",
        "correct_answer": 1,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "A hash collision can be resolved using which method?",
        "option_1": "Binary Search",
        "option_2": "Chaining",
        "option_3": "Merge Sort",
        "option_4": "Heapify",
        "correct_answer": 2,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.medium
    },

    # ------------------ Operating System ------------------
    {
        "question_text": "Which scheduling algorithm may cause starvation?",
        "option_1": "FCFS",
        "option_2": "SJF",
        "option_3": "Round Robin",
        "option_4": "EDF",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "A process in 'waiting' state is waiting for?",
        "option_1": "CPU",
        "option_2": "Memory",
        "option_3": "I/O",
        "option_4": "Cache",
        "correct_answer": 3,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "Thrashing occurs when:",
        "option_1": "CPU overheats",
        "option_2": "Too many interrupts occur",
        "option_3": "Pages are swapped excessively",
        "option_4": "Deadlock happens",
        "correct_answer": 3,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },

    # ------------------ DBMS ------------------
    {
        "question_text": "Which normal form removes transitive dependency?",
        "option_1": "1NF",
        "option_2": "2NF",
        "option_3": "3NF",
        "option_4": "BCNF",
        "correct_answer": 3,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "Which command is used to remove a table in SQL?",
        "option_1": "DELETE",
        "option_2": "DROP",
        "option_3": "REMOVE",
        "option_4": "CLEAR",
        "correct_answer": 2,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "A primary key:",
        "option_1": "Allows duplicates",
        "option_2": "Can be NULL",
        "option_3": "Uniquely identifies a record",
        "option_4": "Is optional",
        "correct_answer": 3,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.easy
    },

    # ------------------ Computer Networks ------------------
    {
        "question_text": "Which protocol is used to send emails?",
        "option_1": "SMTP",
        "option_2": "FTP",
        "option_3": "HTTP",
        "option_4": "SSH",
        "correct_answer": 1,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "In networking, TTL stands for:",
        "option_1": "Time to Load",
        "option_2": "Time to Live",
        "option_3": "Total Transmission Length",
        "option_4": "Transaction Log Level",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "Which layer of OSI is responsible for routing?",
        "option_1": "Transport",
        "option_2": "Network",
        "option_3": "Session",
        "option_4": "Data Link",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },

    # ------------------ OOPS ------------------
    {
        "question_text": "Which pillar of OOP refers to restricting access to data?",
        "option_1": "Abstraction",
        "option_2": "Inheritance",
        "option_3": "Encapsulation",
        "option_4": "Polymorphism",
        "correct_answer": 3,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "Which of the following supports runtime polymorphism?",
        "option_1": "Method Overloading",
        "option_2": "Method Overriding",
        "option_3": "Constructor",
        "option_4": "Static Method",
        "correct_answer": 2,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.medium
    },

    # ------------------ Programming ------------------
    {
        "question_text": "Which of the following is NOT a Java primitive type?",
        "option_1": "int",
        "option_2": "float",
        "option_3": "string",
        "option_4": "char",
        "correct_answer": 3,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "Which operator is used for exponentiation in Python?",
        "option_1": "^",
        "option_2": "**",
        "option_3": "exp()",
        "option_4": "//",
        "correct_answer": 2,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "JavaScript is:",
        "option_1": "Compiled",
        "option_2": "Interpreted",
        "option_3": "Both",
        "option_4": "None",
        "correct_answer": 2,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },

    # ------------------ Mixed QA / Testing ------------------
    {
        "question_text": "What is the purpose of a test case?",
        "option_1": "To describe test procedure",
        "option_2": "To write the source code",
        "option_3": "To deploy the system",
        "option_4": "To manage database",
        "correct_answer": 1,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "Boundary value analysis is a type of:",
        "option_1": "Black-box testing",
        "option_2": "White-box testing",
        "option_3": "Debugging",
        "option_4": "Unit testing",
        "correct_answer": 1,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },

    # ------------------ Batch 2 (Questions 21–40) ------------------

    # DSA
    {
        "question_text": "Which data structure is used in BFS traversal?",
        "option_1": "Stack",
        "option_2": "Queue",
        "option_3": "Heap",
        "option_4": "Tree",
        "correct_answer": 2,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "Which algorithm is used to detect a cycle in a linked list?",
        "option_1": "Kadane's Algorithm",
        "option_2": "Two Pointer Method",
        "option_3": "Dijkstra's Algorithm",
        "option_4": "Kruskal's Algorithm",
        "correct_answer": 2,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "Which heap is used in Dijkstra’s algorithm?",
        "option_1": "Binary Heap",
        "option_2": "Fibonacci Heap",
        "option_3": "Binomial Heap",
        "option_4": "Leftist Heap",
        "correct_answer": 2,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.hard
    },

    # OS
    {
        "question_text": "Which algorithm prevents deadlock by assigning priorities?",
        "option_1": "Banker's Algorithm",
        "option_2": "Priority Scheduling",
        "option_3": "Round Robin",
        "option_4": "FIFO",
        "correct_answer": 1,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.hard
    },
    {
        "question_text": "Context switching occurs when:",
        "option_1": "A process terminates",
        "option_2": "CPU switches from one process to another",
        "option_3": "Memory becomes full",
        "option_4": "Cache overflows",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },

    # DBMS
    {
        "question_text": "Which join returns only matching rows?",
        "option_1": "Left Join",
        "option_2": "Right Join",
        "option_3": "Full Join",
        "option_4": "Inner Join",
        "correct_answer": 4,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "Indexing improves:",
        "option_1": "Insert speed",
        "option_2": "Query performance",
        "option_3": "Backup speed",
        "option_4": "Delete performance",
        "correct_answer": 2,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.medium
    },

    # CN
    {
        "question_text": "Which device breaks a collision domain?",
        "option_1": "Hub",
        "option_2": "Router",
        "option_3": "Repeater",
        "option_4": "Transceiver",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "Which protocol resolves IP to MAC address?",
        "option_1": "DNS",
        "option_2": "ARP",
        "option_3": "RARP",
        "option_4": "TCP",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.easy
    },

    # OOPS
    {
        "question_text": "Which OOP feature allows multiple forms of the same method?",
        "option_1": "Encapsulation",
        "option_2": "Inheritance",
        "option_3": "Polymorphism",
        "option_4": "Abstraction",
        "correct_answer": 3,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.medium
    },

    # Programming
    {
        "question_text": "Which language uses indentation as syntax?",
        "option_1": "Java",
        "option_2": "C++",
        "option_3": "Python",
        "option_4": "C",
        "correct_answer": 3,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },

    # Testing
    {
        "question_text": "Smoke testing is also known as:",
        "option_1": "Sanity testing",
        "option_2": "Build verification testing",
        "option_3": "Load testing",
        "option_4": "Security testing",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.easy
    },


    # ------------------ Batch 3 (Questions 41–60) ------------------

    # DSA
    {
        "question_text": "Which tree is always height balanced?",
        "option_1": "BST",
        "option_2": "AVL Tree",
        "option_3": "B-Tree",
        "option_4": "Trie",
        "correct_answer": 2,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.hard
    },
    {
        "question_text": "Which of the following uses backtracking?",
        "option_1": "Binary Search",
        "option_2": "Tower of Hanoi",
        "option_3": "N-Queens Problem",
        "option_4": "Bubble Sort",
        "correct_answer": 3,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.hard
    },

    # OS
    {
        "question_text": "Which of the following is not a deadlock condition?",
        "option_1": "Mutual exclusion",
        "option_2": "Hold and wait",
        "option_3": "No preemption",
        "option_4": "Starvation",
        "correct_answer": 4,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },

    # DBMS
    {
        "question_text": "Which SQL keyword removes duplicate rows?",
        "option_1": "UNIQUE",
        "option_2": "DISTINCT",
        "option_3": "NODUP",
        "option_4": "FILTER",
        "correct_answer": 2,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "Truncate command:",
        "option_1": "Removes table permanently",
        "option_2": "Removes all rows but keeps structure",
        "option_3": "Deletes specific rows",
        "option_4": "Removes database",
        "correct_answer": 2,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.medium
    },

    # CN
    {
        "question_text": "Which layer in TCP/IP model handles reliable delivery?",
        "option_1": "Transport Layer",
        "option_2": "Network Layer",
        "option_3": "Application Layer",
        "option_4": "Link Layer",
        "correct_answer": 1,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },

    # Programming
    {
        "question_text": "Which keyword creates a constant in Java?",
        "option_1": "static",
        "option_2": "final",
        "option_3": "constant",
        "option_4": "immutable",
        "correct_answer": 2,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },

    # OOPS
    {
        "question_text": "Which of the following is an example of abstraction?",
        "option_1": "Using a car without knowing engine details",
        "option_2": "Method overriding",
        "option_3": "Using private variables",
        "option_4": "Using constructors",
        "correct_answer": 1,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },

    # Testing
    {
        "question_text": "Load testing checks:",
        "option_1": "How fast UI loads",
        "option_2": "System behavior under heavy load",
        "option_3": "Memory leak",
        "option_4": "Database encryption",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },


    # ------------------ Batch 4 (Questions 61–80) ------------------

    # DSA
    {
        "question_text": "Which sorting algorithm is stable?",
        "option_1": "Quick Sort",
        "option_2": "Merge Sort",
        "option_3": "Heap Sort",
        "option_4": "Selection Sort",
        "correct_answer": 2,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "A complete binary tree has:",
        "option_1": "Nodes aligned to the left",
        "option_2": "Nodes aligned to the right",
        "option_3": "All levels filled except possibly last",
        "option_4": "Exactly 2 children at every node",
        "correct_answer": 3,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },

    # OS
    {
        "question_text": "Which of the following is not a scheduling algorithm?",
        "option_1": "FCFS",
        "option_2": "SJF",
        "option_3": "LRU",
        "option_4": "Round Robin",
        "correct_answer": 3,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.easy
    },

    # DBMS
    {
        "question_text": "Which level of abstraction describes how data is stored?",
        "option_1": "Logical Level",
        "option_2": "Physical Level",
        "option_3": "View Level",
        "option_4": "Conceptual Level",
        "correct_answer": 2,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "Which is a non-relational database?",
        "option_1": "MySQL",
        "option_2": "PostgreSQL",
        "option_3": "MongoDB",
        "option_4": "Oracle",
        "correct_answer": 3,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.easy
    },

    # CN
    {
        "question_text": "What is the maximum length of an IPv4 address?",
        "option_1": "16 bits",
        "option_2": "32 bits",
        "option_3": "64 bits",
        "option_4": "128 bits",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.easy
    },
    {
        "question_text": "HTTPS uses which protocol for security?",
        "option_1": "SSL/TLS",
        "option_2": "SSH",
        "option_3": "IPSec",
        "option_4": "PGP",
        "correct_answer": 1,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },

    # Programming
    {
        "question_text": "Which is used for asynchronous operations in JavaScript?",
        "option_1": "setTimeout",
        "option_2": "await",
        "option_3": "async functions",
        "option_4": "All of the above",
        "correct_answer": 4,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.medium
    },

    # Testing
    {
        "question_text": "Which testing verifies individual units of code?",
        "option_1": "Unit Testing",
        "option_2": "Integration Testing",
        "option_3": "Regression Testing",
        "option_4": "Acceptance Testing",
        "correct_answer": 1,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.easy
    },


    # ------------------ Batch 5 (Questions 81–100) ------------------

    # DSA
    {
        "question_text": "Graph with no cycles is called:",
        "option_1": "DAG",
        "option_2": "Tree",
        "option_3": "Bipartite Graph",
        "option_4": "Subgraph",
        "correct_answer": 1,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "Which operation on stack is not valid?",
        "option_1": "Push",
        "option_2": "Pop",
        "option_3": "Insert at bottom",
        "option_4": "Peek",
        "correct_answer": 3,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.medium
    },

    # OS
    {
        "question_text": "Which of the following is a page replacement algorithm?",
        "option_1": "SSTF",
        "option_2": "LRU",
        "option_3": "SCAN",
        "option_4": "FCFS",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    },

    # DBMS
    {
        "question_text": "ACID property ensuring no partial transactions is:",
        "option_1": "Consistency",
        "option_2": "Atomicity",
        "option_3": "Isolation",
        "option_4": "Durability",
        "correct_answer": 2,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.medium
    },
    {
        "question_text": "Stored procedures are executed:",
        "option_1": "On client",
        "option_2": "On server",
        "option_3": "On cache",
        "option_4": "On proxy",
        "correct_answer": 2,
        "domain": QuizDomain.analytics,
        "difficulty": DifficultyLevel.medium
    },

    # CN
    {
        "question_text": "Which protocol uses 3-way handshake?",
        "option_1": "UDP",
        "option_2": "TCP",
        "option_3": "FTP",
        "option_4": "SMTP",
        "correct_answer": 2,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.easy
    },

    # OOPS
    {
        "question_text": "Which OOP concept hides background details?",
        "option_1": "Polymorphism",
        "option_2": "Abstraction",
        "option_3": "Inheritance",
        "option_4": "Encapsulation",
        "correct_answer": 2,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },

    # Programming
    {
        "question_text": "Which of these is not a loop in Java?",
        "option_1": "for",
        "option_2": "foreach",
        "option_3": "while",
        "option_4": "repeat-until",
        "correct_answer": 4,
        "domain": QuizDomain.programmer,
        "difficulty": DifficultyLevel.easy
    },

    # Testing
    {
        "question_text": "Which type of testing ensures security vulnerabilities?",
        "option_1": "Load Testing",
        "option_2": "Functional Testing",
        "option_3": "Security Testing",
        "option_4": "Sanity Testing",
        "correct_answer": 3,
        "domain": QuizDomain.tester,
        "difficulty": DifficultyLevel.medium
    }
]

roadmaps_data = [
    # ---------------- Programmer ----------------
    {"domain": "programmer", "step_number": 1, "title": "Master the Fundamentals", "description": "Learn Python/JavaScript deeply—variables, loops, functions, arrays, and OOP basics."},
    {"domain": "programmer", "step_number": 2, "title": "Learn Version Control", "description": "Understand Git & GitHub—commits, branches, merging, resolving conflicts."},
    {"domain": "programmer", "step_number": 3, "title": "Learn a Framework", "description": "Pick React, Django, Node.js, or Spring Boot. Build small modules."},
    {"domain": "programmer", "step_number": 4, "title": "Understand Databases", "description": "Learn SQL (SELECT, JOIN, GROUP BY) and NoSQL (MongoDB) fundamentals."},
    {"domain": "programmer", "step_number": 5, "title": "Build Projects", "description": "Create 3–5 portfolio projects (E-Commerce, Chat App, Finance Tracker)."},
    {"domain": "programmer", "step_number": 6, "title": "Master DSA", "description": "Solve problems on arrays, strings, recursion, DP, and graphs regularly."},
    {"domain": "programmer", "step_number": 7, "title": "Learn System Design Basics", "description": "Understand APIs, caching, load balancing, databases, and scaling concepts."},
    {"domain": "programmer", "step_number": 8, "title": "Prepare for Interviews", "description": "Practice DSA + core CS + projects + mock interviews on platforms like Pramp."},

    # ---------------- Analytics ----------------
    {"domain": "analytics", "step_number": 1, "title": "Learn SQL Fundamentals", "description": "Master joins, grouping, filtering, and window functions."},
    {"domain": "analytics", "step_number": 2, "title": "Learn Statistics", "description": "Understand mean, median, variance, probability, and hypothesis testing."},
    {"domain": "analytics", "step_number": 3, "title": "Data Visualization Tools", "description": "Learn Tableau/Power BI to build dashboards and reports."},
    {"domain": "analytics", "step_number": 4, "title": "Python for Analytics", "description": "Learn Pandas, NumPy, Matplotlib, Seaborn for data manipulation."},
    {"domain": "analytics", "step_number": 5, "title": "Build Data Projects", "description": "Analyze Kaggle datasets and build end-to-end analytics case studies."},
    {"domain": "analytics", "step_number": 6, "title": "Excel & Advanced Excel", "description": "Master Pivot Tables, VLOOKUP/XLOOKUP, conditional formatting."},
    {"domain": "analytics", "step_number": 7, "title": "Learn ML Basics", "description": "Understand linear regression, classification, clustering, and model evaluation."},
    {"domain": "analytics", "step_number": 8, "title": "Prepare for Interviews", "description": "Practice SQL challenges, case studies, and statistics interview questions."},

    # ---------------- Tester ----------------
    {"domain": "tester", "step_number": 1, "title": "Testing Fundamentals", "description": "Understand SDLC, STLC, test case writing, bug life cycle, and QA terms."},
    {"domain": "tester", "step_number": 2, "title": "Manual Testing Practice", "description": "Test demo apps, write bug reports, and practice real industry workflows."},
    {"domain": "tester", "step_number": 3, "title": "Automation Testing", "description": "Learn Selenium, Cypress, or Playwright for UI automation."},
    {"domain": "tester", "step_number": 4, "title": "API Testing", "description": "Use Postman or REST Assured to test APIs, write assertions, and automate flows."},
    {"domain": "tester", "step_number": 5, "title": "Performance Testing", "description": "Learn JMeter or Locust to test application load and stress."},
    {"domain": "tester", "step_number": 6, "title": "Build Test Frameworks", "description": "Implement POM, CI/CD integration, test reporting, and reusable scripts."},
    {"domain": "tester", "step_number": 7, "title": "Learn CI/CD Basics", "description": "Integrate test pipelines using GitHub Actions, Jenkins, or GitLab CI."},
    {"domain": "tester", "step_number": 8, "title": "Prepare for Interviews", "description": "Practice test scenarios, QA theory, automation questions, and coding basics."},
]

resources_data = [
    # ---------------- Programmer ----------------
    {"domain": "programmer", "title": "Full Stack Web Development Bootcamp", "link": "https://www.udemy.com/course/the-web-developer-bootcamp/", "type": "Course"},
    {"domain": "programmer", "title": "FreeCodeCamp", "link": "https://www.freecodecamp.org/", "type": "Course"},
    {"domain": "programmer", "title": "MDN Web Docs", "link": "https://developer.mozilla.org/", "type": "Guide"},
    {"domain": "programmer", "title": "NeetCode DSA", "link": "https://neetcode.io/", "type": "Practice"},
    {"domain": "programmer", "title": "JavaScript.info", "link": "https://javascript.info/", "type": "Guide"},
    {"domain": "programmer", "title": "Spring Boot Documentation", "link": "https://spring.io/projects/spring-boot", "type": "Guide"},
    {"domain": "programmer", "title": "LeetCode", "link": "https://leetcode.com/", "type": "Practice"},
    {"domain": "programmer", "title": "System Design Primer", "link": "https://github.com/donnemartin/system-design-primer", "type": "Guide"},

    # ---------------- Analytics ----------------
    {"domain": "analytics", "title": "Google Data Analytics Certificate", "link": "https://www.coursera.org/professional-certificates/google-data-analytics", "type": "Course"},
    {"domain": "analytics", "title": "Kaggle", "link": "https://www.kaggle.com/", "type": "Practice"},
    {"domain": "analytics", "title": "Tableau Public", "link": "https://public.tableau.com/", "type": "Tool"},
    {"domain": "analytics", "title": "Power BI Learning Path", "link": "https://learn.microsoft.com/en-us/power-bi/", "type": "Guide"},
    {"domain": "analytics", "title": "Analytics Vidhya", "link": "https://www.analyticsvidhya.com/", "type": "Guide"},
    {"domain": "analytics", "title": "Towards Data Science", "link": "https://towardsdatascience.com/", "type": "Blog"},
    {"domain": "analytics", "title": "StatQuest (YouTube)", "link": "https://www.youtube.com/user/joshstarmer", "type": "Video"},

    # ---------------- Tester ----------------
    {"domain": "tester", "title": "Ministry of Testing", "link": "https://www.ministryoftesting.com/", "type": "Community"},
    {"domain": "tester", "title": "Test Automation University", "link": "https://testautomationuniversity.applitools.com/", "type": "Course"},
    {"domain": "tester", "title": "Selenium Official Docs", "link": "https://www.selenium.dev/documentation/", "type": "Guide"},
    {"domain": "tester", "title": "Postman Learning Center", "link": "https://learning.postman.com/", "type": "Guide"},
    {"domain": "tester", "title": "JMeter User Manual", "link": "https://jmeter.apache.org/usermanual/", "type": "Guide"},
    {"domain": "tester", "title": "Cypress Documentation", "link": "https://docs.cypress.io/", "type": "Guide"},
    {"domain": "tester", "title": "Playwright Docs", "link": "https://playwright.dev/", "type": "Guide"}
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

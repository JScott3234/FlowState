"""
Seed script to populate dummy tasks for test@mulino.com
Run with: .venv\Scripts\python.exe seed_tasks.py
"""
from pymongo import MongoClient
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
USER_EMAIL = "test@mulino.com"

def seed_tasks():
    client = MongoClient(MONGO_URI)
    db = client["flowstate_db"]
    tasks_collection = db["tasks"]
    
    # Clear existing tasks for this user
    tasks_collection.delete_many({"email": USER_EMAIL})
    print(f"Cleared existing tasks for {USER_EMAIL}")
    
    # Get base time (today at 9 AM)
    now = datetime.now().replace(hour=9, minute=0, second=0, microsecond=0)
    
    dummy_tasks = [
        {
            "email": USER_EMAIL,
            "title": "Team Standup Meeting",
            "task_client_id": "seed-work-1",
            "description": "Daily standup with the dev team",
            "tag_names": ["work"],
            "start_time": now,
            "duration": 30,
            "is_completed": False,
            "color": "#3b82f6"  # Blue
        },
        {
            "email": USER_EMAIL,
            "title": "Review CS Assignment",
            "task_client_id": "seed-school-1",
            "description": "Review algorithms homework",
            "tag_names": ["school"],
            "start_time": now + timedelta(hours=2),
            "duration": 60,
            "is_completed": False,
            "color": "#8b5cf6"  # Purple
        },
        {
            "email": USER_EMAIL,
            "title": "Guitar Practice",
            "task_client_id": "seed-hobbies-1",
            "description": "Practice new song",
            "tag_names": ["hobbies"],
            "start_time": now + timedelta(hours=4),
            "duration": 45,
            "is_completed": False,
            "color": "#f97316"  # Orange
        },
        {
            "email": USER_EMAIL,
            "title": "Code Review PR #42",
            "task_client_id": "seed-work-2",
            "description": "Review frontend refactoring PR",
            "tag_names": ["work"],
            "start_time": now + timedelta(hours=6),
            "duration": 45,
            "is_completed": False,
            "color": "#3b82f6"  # Blue
        },
        {
            "email": USER_EMAIL,
            "title": "Read Chapter 5",
            "task_client_id": "seed-school-2",
            "description": "Database Systems textbook",
            "tag_names": ["school"],
            "start_time": now + timedelta(days=1, hours=1),
            "duration": 90,
            "is_completed": False,
            "color": "#8b5cf6"  # Purple
        }
    ]
    
    result = tasks_collection.insert_many(dummy_tasks)
    print(f"✓ Inserted {len(result.inserted_ids)} tasks for {USER_EMAIL}")
    
    # Verify
    count = tasks_collection.count_documents({"email": USER_EMAIL})
    print(f"✓ Total tasks for {USER_EMAIL}: {count}")
    
    client.close()

if __name__ == "__main__":
    seed_tasks()

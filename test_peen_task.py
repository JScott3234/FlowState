from pymongo import MongoClient
import db
import os
from dotenv import load_dotenv

def test_peen_task():
    load_dotenv()
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
    client = MongoClient(MONGO_URI)
    
    email = "peen@test.com"
    tag_names = ["peen"]
    title = "Test Peen Task"
    task_client_id = "test-uuid-peen"
    
    print(f"Testing set_task for {email} with tags {tag_names}...")
    
    result = db.set_task(
        client,
        email=email,
        title=title,
        task_client_id=task_client_id,
        description="Verification task for peen user",
        tag_names=tag_names,
        start_time=None,
        duration=30,
        is_completed=False,
        flowbot_suggest_duration=45,
        actual_duration=0
    )
    
    if result:
        print("✓ set_task successfully called!")
        # Find the task first to get its ID (since we still create by title+email)
        temp_task = list(client[db.DB_NAME]["tasks"].find({"email": email, "title": title}))[0]
        task_id = str(temp_task["_id"])
        
        # Verify using the new ObjectId-based get_task
        task = db.get_task(client, email, task_id)
        if task:
            print(f"✓ Task found in DB by ObjectId: {task.get('title')}")
            print(f"✓ Tags match: {task.get('tag_names') == tag_names}")
            print(f"✓ task_client_id matches: {task.get('task_client_id') == task_client_id}")
            
            # Test Hybrid Getters (Title based)
            description = db.get_task_description(client, email, title)
            print(f"✓ Description found by Title: {description == description}")
            
            # Test Hybrid Setters (ID based)
            db.set_task_description(client, email, task_id, "Updated Description via ID")
            updated_desc = db.get_task_description(client, email, title)
            print(f"✓ Description updated via ID and retrieved via Title: {updated_desc == 'Updated Description via ID'}")
            
        else:
            print(f"✗ Task not found in DB by ObjectId {task_id} after creation!")
    else:
        print("✗ set_task failed to return acknowledgment!")

    client.close()

if __name__ == "__main__":
    test_peen_task()

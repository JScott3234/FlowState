"""
FastAPI CORS Backend for FlowState
Exposes all db.py functions as REST endpoints with CORS support
"""

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Import all db functions
import db

# Load environment variables
load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173")

# Global MongoDB client
mongo_client: Optional[MongoClient] = None


# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class UserCreate(BaseModel):
    email: str
    description: Optional[str] = None


class UserDescriptionUpdate(BaseModel):
    description: str


class TagCreate(BaseModel):
    email: str
    tag_name: str
    tag_description: Optional[str] = None


class TagDescriptionUpdate(BaseModel):
    tag_description: str


class TaskCreate(BaseModel):
    email: str
    title: str
    description: Optional[str] = None
    tag_names: Optional[List[str]] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    is_completed: bool = False
    recurrence: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tag_names: Optional[List[str]] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    is_completed: Optional[bool] = None
    recurrence: Optional[str] = None


class TaskDescriptionUpdate(BaseModel):
    description: str


class TaskTagsUpdate(BaseModel):
    tag_names: List[str]


class TaskTagAdd(BaseModel):
    tag_name: str


class TaskTagRemove(BaseModel):
    tag_name: str


class AgentChatRequest(BaseModel):
    message: str
    user_id: str


class AgentRetrieveRequest(BaseModel):
    query: str
    user_id: str


# ============================================================================
# LIFECYCLE MANAGEMENT
# ============================================================================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage MongoDB connection lifecycle"""
    global mongo_client
    # Startup
    print(f"Connecting to MongoDB: {MONGO_URI[:20]}...")
    mongo_client = MongoClient(MONGO_URI)
    # Test connection
    try:
        mongo_client.admin.command('ping')
        print("✓ MongoDB connected successfully")
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
    
    yield
    
    # Shutdown
    if mongo_client:
        mongo_client.close()
        print("✓ MongoDB connection closed")


# ============================================================================
# FASTAPI APP
# ============================================================================

app = FastAPI(
    title="FlowState API",
    description="REST API for FlowState task management with AI agent integration",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = [origin.strip() for origin in ALLOWED_ORIGINS.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# HELPER FUNCTION
# ============================================================================

def get_client() -> MongoClient:
    """Get MongoDB client or raise error if not connected"""
    if mongo_client is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection not available"
        )
    return mongo_client


# ============================================================================
# ROOT ENDPOINT
# ============================================================================

@app.get("/")
async def root():
    return {
        "message": "Welcome to FlowState API",
        "version": "1.0.0",
        "docs": "/docs"
    }


# ============================================================================
# USER ENDPOINTS
# ============================================================================

@app.get("/api/users")
async def get_all_users():
    """Get all users"""
    client = get_client()
    users = db.get_all_users(client)
    # Convert ObjectId to string for JSON serialization
    for user in users:
        if "_id" in user:
            user["_id"] = str(user["_id"])
    return users


@app.get("/api/users/{email}")
async def get_user(email: str):
    """Get a specific user by email"""
    client = get_client()
    user = db.get_user(client, email)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if "_id" in user:
        user["_id"] = str(user["_id"])
    return user


@app.get("/api/users/{email}/description")
async def get_user_description(email: str):
    """Get user description"""
    client = get_client()
    description = db.get_user_description(client, email)
    if description is None:
        raise HTTPException(status_code=404, detail="User not found or no description")
    return {"description": description}


@app.post("/api/users", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate):
    """Create or update a user"""
    client = get_client()
    result = db.set_user(client, user.email, user.description)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create user")
    return {"message": "User created successfully", "email": user.email}


@app.put("/api/users/{email}/description")
async def update_user_description(email: str, update: UserDescriptionUpdate):
    """Update user description"""
    client = get_client()
    result = db.set_user_description(client, email, update.description)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to update description")
    return {"message": "Description updated successfully"}


@app.delete("/api/users/{email}")
async def delete_user(email: str):
    """Delete a user"""
    client = get_client()
    result = db.delete_user(client, email)
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


# ============================================================================
# TAG ENDPOINTS
# ============================================================================

@app.get("/api/tags")
async def get_all_tags():
    """Get all tags"""
    client = get_client()
    tags = db.get_all_tags(client)
    for tag in tags:
        if "_id" in tag:
            tag["_id"] = str(tag["_id"])
    return tags


@app.get("/api/tags/{email}")
async def get_all_tags_for_user(email: str):
    """Get all tags for a specific user"""
    client = get_client()
    tags = db.get_all_tags_for_user(client, email)
    for tag in tags:
        if "_id" in tag:
            tag["_id"] = str(tag["_id"])
    return tags


@app.get("/api/tags/{email}/{tag_name}")
async def get_tag(email: str, tag_name: str):
    """Get a specific tag"""
    client = get_client()
    tag = db.get_tag(client, email, tag_name)
    if tag is None:
        raise HTTPException(status_code=404, detail="Tag not found")
    if "_id" in tag:
        tag["_id"] = str(tag["_id"])
    return tag


@app.get("/api/tags/{email}/{tag_name}/description")
async def get_tag_description(email: str, tag_name: str):
    """Get tag description"""
    client = get_client()
    description = db.get_tag_description(client, email, tag_name)
    if description is None:
        raise HTTPException(status_code=404, detail="Tag not found or no description")
    return {"tag_description": description}


@app.post("/api/tags", status_code=status.HTTP_201_CREATED)
async def create_tag(tag: TagCreate):
    """Create or update a tag"""
    client = get_client()
    result = db.set_tag(client, tag.email, tag.tag_name, tag.tag_description)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create tag")
    return {"message": "Tag created successfully", "tag_name": tag.tag_name}


@app.put("/api/tags/{email}/{tag_name}/description")
async def update_tag_description(email: str, tag_name: str, update: TagDescriptionUpdate):
    """Update tag description"""
    client = get_client()
    result = db.set_tag_description(client, email, tag_name, update.tag_description)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to update tag description")
    return {"message": "Tag description updated successfully"}


@app.delete("/api/tags/{email}/{tag_name}")
async def delete_tag(email: str, tag_name: str):
    """Delete a tag"""
    client = get_client()
    result = db.delete_tag(client, email, tag_name)
    if not result:
        raise HTTPException(status_code=404, detail="Tag not found")
    return {"message": "Tag deleted successfully"}


# ============================================================================
# TASK ENDPOINTS
# ============================================================================

@app.get("/api/tasks")
async def get_all_tasks():
    """Get all tasks"""
    client = get_client()
    tasks = db.get_all_tasks(client)
    for task in tasks:
        if "_id" in task:
            task["_id"] = str(task["_id"])
    return tasks


@app.get("/api/tasks/{email}")
async def get_all_tasks_for_user(email: str):
    """Get all tasks for a specific user"""
    client = get_client()
    tasks = db.get_all_tasks_for_user(client, email)
    for task in tasks:
        if "_id" in task:
            task["_id"] = str(task["_id"])
    return tasks


@app.get("/api/tasks/{email}/{title}")
async def get_task(email: str, title: str):
    """Get a specific task"""
    client = get_client()
    task = db.get_task(client, email, title)
    if task is None:
        raise HTTPException(status_code=404, detail="Task not found")
    if "_id" in task:
        task["_id"] = str(task["_id"])
    return task


@app.get("/api/tasks/by-id/{task_id}")
async def get_task_by_id(task_id: str):
    """Get a task by MongoDB ObjectId"""
    client = get_client()
    try:
        task = db.get_task_by_id(client, task_id)
        if task is None:
            raise HTTPException(status_code=404, detail="Task not found")
        if "_id" in task:
            task["_id"] = str(task["_id"])
        return task
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid task ID: {str(e)}")


@app.get("/api/tasks/{email}/{title}/description")
async def get_task_description(email: str, title: str):
    """Get task description"""
    client = get_client()
    description = db.get_task_description(client, email, title)
    if description is None:
        raise HTTPException(status_code=404, detail="Task not found or no description")
    return {"description": description}


@app.get("/api/tasks/{email}/{title}/tags")
async def get_task_tags(email: str, title: str):
    """Get task tags"""
    client = get_client()
    tags = db.get_task_tags(client, email, title)
    if tags is None:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"tag_names": tags}


@app.get("/api/tasks/by-tag/{email}/{tag_name}")
async def get_tasks_by_tag(email: str, tag_name: str):
    """Get all tasks for a user with a specific tag"""
    client = get_client()
    tasks = db.get_tasks_by_tag(client, email, tag_name)
    for task in tasks:
        if "_id" in task:
            task["_id"] = str(task["_id"])
    return tasks


@app.post("/api/tasks", status_code=status.HTTP_201_CREATED)
async def create_task(task: TaskCreate):
    """Create or update a task"""
    client = get_client()
    result = db.set_task(
        client, 
        task.email, 
        task.title, 
        task.description, 
        task.tag_names,
        task.start_time,
        task.end_time,
        task.is_completed,
        task.recurrence
    )
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create task")
    return {"message": "Task created successfully", "title": task.title}


@app.patch("/api/tasks/{task_id}")
async def update_task(task_id: str, updates: TaskUpdate):
    """Update specific fields of a task"""
    client = get_client()
    # Filter out None values to only update what was sent
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
        
    result = db.update_task_fields(client, task_id, update_data)
    if not result:
        raise HTTPException(status_code=404, detail="Task not found or update failed")
    return {"message": "Task updated successfully"}


@app.put("/api/tasks/{email}/{title}/description")
async def update_task_description(email: str, title: str, update: TaskDescriptionUpdate):
    """Update task description"""
    client = get_client()
    result = db.set_task_description(client, email, title, update.description)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to update task description")
    return {"message": "Task description updated successfully"}


@app.put("/api/tasks/{email}/{title}/tags")
async def update_task_tags(email: str, title: str, update: TaskTagsUpdate):
    """Update task tags (replaces entire tag list)"""
    client = get_client()
    result = db.set_task_tags(client, email, title, update.tag_names)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to update task tags")
    return {"message": "Task tags updated successfully"}


@app.post("/api/tasks/{email}/{title}/tags/add")
async def add_tag_to_task(email: str, title: str, tag: TaskTagAdd):
    """Add a single tag to a task"""
    client = get_client()
    result = db.add_tag_to_task(client, email, title, tag.tag_name)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to add tag to task")
    return {"message": "Tag added to task successfully"}


@app.delete("/api/tasks/{email}/{title}/tags/remove")
async def remove_tag_from_task(email: str, title: str, tag: TaskTagRemove):
    """Remove a single tag from a task"""
    client = get_client()
    result = db.remove_tag_from_task(client, email, title, tag.tag_name)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to remove tag from task")
    return {"message": "Tag removed from task successfully"}


@app.delete("/api/tasks/{email}/{title}")
async def delete_task(email: str, title: str):
    """Delete a task"""
    client = get_client()
    result = db.delete_task(client, email, title)
    if not result:
        raise HTTPException(status_code=404, detail="Task not found or update failed")
    return {"message": "Task updated successfully"}


@app.delete("/api/tasks/{task_id}")
async def delete_task_by_id(task_id: str):
    """Delete a task by ID"""
    client = get_client()
    result = db.delete_task_by_id(client, task_id)
    if not result:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


# ============================================================================
# AGENT ENDPOINTS (PLACEHOLDERS)
# ============================================================================

@app.post("/api/agent/chat")
async def agent_chat(request: AgentChatRequest):
    """
    Chat with the AI agent (PLACEHOLDER)
    
    This endpoint will integrate with agent.py's LangGraph chatbot.
    Currently returns a placeholder response.
    """
    # TODO: Integrate with agent.py
    # from agent import graph
    # result = graph.invoke({
    #     "messages": [("user", request.message)],
    #     "user_id": request.user_id
    # })
    
    return {
        "message": "Agent chat endpoint - Coming soon!",
        "user_message": request.message,
        "user_id": request.user_id,
        "response": "This is a placeholder. Integration with agent.py pending."
    }


@app.post("/api/agent/retrieve")
async def agent_retrieve(request: AgentRetrieveRequest):
    """
    Retrieve relevant events using vector search (PLACEHOLDER)
    
    This endpoint will integrate with agent.py's retrieve_events function.
    Currently returns a placeholder response.
    """
    # TODO: Integrate with agent.py
    # from agent import retrieve_events
    # result = retrieve_events({
    #     "messages": [("user", request.query)],
    #     "user_id": request.user_id
    # })
    
    return {
        "message": "Agent retrieve endpoint - Coming soon!",
        "query": request.query,
        "user_id": request.user_id,
        "events": []
    }


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        client = get_client()
        client.admin.command('ping')
        return {
            "status": "healthy",
            "database": "connected"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

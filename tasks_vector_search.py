import os
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Load environment variables
load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "flowstate_db"
COLLECTION_NAME = "flowstate_tasks"  # As seen in task_intake.py
INDEX_NAME = "vector_index"          # Matches agent.py default

def get_mongo_client() -> MongoClient:
    """Returns a MongoDB client instance."""
    return MongoClient(MONGO_URI)

def vector_search_tasks_by_tag(query: str, email: str, tag_name: str, limit: int = 4) -> List[Dict[str, Any]]:
    """
    Performs a vector search on the tasks collection, filtered by user email and a specific tag.
    Finds tasks from a specific user with the same tag that have similar descriptions.
    
    Args:
        query: The semantic search query string (e.g., a task description).
        email: The user's email to filter tasks by.
        tag_name: The tag to filter tasks by.
        limit: Maximum number of similar tasks to return (default 4).
        
    Returns:
        A list of task documents with the specified email, tag, and similar descriptions.
    """
    client = get_mongo_client()
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    
    # Initialize Embedding Model (using gemini-embedding-001 as required)
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    
    # 1. Generate query embedding
    print(f"Generating embedding for query: '{query}'...")
    query_vector = embeddings.embed_query(query)
    
    # 2. Define Vector Search Pipeline with email and tag filters
    print(f"Filtering by email: '{email}' and tag: '{tag_name}'")
    pipeline = [
        {
            "$vectorSearch": {
                "index": INDEX_NAME,
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": 100,  # Recommended to be higher than limit
                "limit": limit,
                "filter": {
                    "email": email,      # Filter by user email
                    "tags": tag_name     # Filter by tag
                }
            }
        },
        {
            "$project": {
                "_id": 0,
                "title": 1,
                "description": 1,
                "tags": 1,
                "email": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]
    
    # 3. Execute Search
    print("Executing Atlas Vector Search...")
    try:
        results = list(collection.aggregate(pipeline))
        return results
    except Exception as e:
        print(f"Error executing vector search: {e}")
        return []
    finally:
        client.close()

if __name__ == "__main__":
    import sys
    
    # Usage: python tasks_vector_search.py <email> <tag_name> <search_query>
    # Example: python tasks_vector_search.py "user@example.com" "coding" "deep work on projects"
    
    if len(sys.argv) < 4:
        print("Usage: python tasks_vector_search.py <email> <tag_name> <search_query>")
        print("Example: python tasks_vector_search.py user@example.com coding 'deep work on projects'")
        sys.exit(1)
    
    email = sys.argv[1]
    tag_name = sys.argv[2]
    search_query = " ".join(sys.argv[3:])
    
    print(f"\n--- Searching for tasks from '{email}' with tag '{tag_name}' similar to: '{search_query}' ---")
    results = vector_search_tasks_by_tag(search_query, email, tag_name, limit=4)
    
    if not results:
        print("No similar tasks found. (Ensure you have data in 'flowstate_tasks' and a vector index created)")
    else:
        print(f"Found {len(results)} similar tasks:\n")
        for i, task in enumerate(results, 1):
            title = task.get("title", "Untitled")
            desc = task.get("description", "No description")
            tags = task.get("tags", [])
            task_email = task.get("email", "Unknown")
            score = task.get("score", 0.0)
            print(f"{i}. [{score:.4f}] {title}")
            print(f"   Email: {task_email}")
            print(f"   Tags: {', '.join(tags) if tags else 'None'}")
            if desc:
                print(f"   Description: {desc}")
            print("-" * 20)


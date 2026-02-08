"""
Tags Vector Search Agent Module

Takes in a new task's tag and tag description, then performs a vector search
on the tags collection to find the top 4 similar tags with similar descriptions.
"""

import os
from typing import List, Dict, Any
from dotenv import load_dotenv
from pymongo import MongoClient
from langchain_google_genai import GoogleGenerativeAIEmbeddings

# Load environment variables
load_dotenv()

# Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
DB_NAME = "flowstate_db"
COLLECTION_NAME = "tags"
INDEX_NAME = "tags_vector_index"  # Vector index for tags collection


def get_mongo_client() -> MongoClient:
    """Returns a MongoDB client instance."""
    return MongoClient(MONGO_URI)


def vector_search_similar_tags(
    tag_description: str,
    email: str,
    limit: int = 4
) -> List[Dict[str, Any]]:
    """
    Performs a vector search on the tags collection to find tags with similar descriptions.
    
    Args:
        tag_description: The description of the new tag to search for similar tags.
        email: The user's email to filter tags by (optional, searches all if not provided).
        limit: Maximum number of similar tags to return (default 4).
        
    Returns:
        A list of tag documents with similar descriptions, ordered by similarity score.
    """
    client = get_mongo_client()
    db = client[DB_NAME]
    collection = db[COLLECTION_NAME]
    
    # Initialize Embedding Model (using gemini-embedding-001 as required)
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-001")
    
    # 1. Generate query embedding from tag description
    print(f"Generating embedding for tag description: '{tag_description}'...")
    query_vector = embeddings.embed_query(tag_description)
    
    # 2. Define Vector Search Pipeline with optional email filter
    print(f"Searching for similar tags for user: '{email}'")
    
    # Build filter based on email
    search_filter = {"email": email} if email else {}
    
    pipeline = [
        {
            "$vectorSearch": {
                "index": INDEX_NAME,
                "path": "embedding",
                "queryVector": query_vector,
                "numCandidates": 100,  # Recommended to be higher than limit
                "limit": limit,
                "filter": search_filter
            }
        },
        {
            "$project": {
                "_id": 0,
                "tag_name": 1,
                "tag_description": 1,
                "email": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]
    
    # 3. Execute Search
    print("Executing Atlas Vector Search on tags collection...")
    try:
        results = list(collection.aggregate(pipeline))
        return results
    except Exception as e:
        print(f"Error executing vector search: {e}")
        return []
    finally:
        client.close()


def find_similar_tags_for_task(
    tag_name: str,
    tag_description: str,
    email: str,
    limit: int = 4
) -> List[Dict[str, Any]]:
    """
    Main agent function: Takes a new task's tag and description, 
    finds top 4 similar tags from the tags collection.
    
    Args:
        tag_name: The name of the tag being searched (for logging/context).
        tag_description: The description of the tag to find similar matches for.
        email: The user's email to filter tags by.
        limit: Maximum number of similar tags to return (default 4).
        
    Returns:
        A list of similar tag documents with their similarity scores.
    """
    print(f"\n{'='*60}")
    print(f"Finding Similar Tags Agent")
    print(f"{'='*60}")
    print(f"Input Tag: '{tag_name}'")
    print(f"Description: '{tag_description}'")
    print(f"User Email: '{email}'")
    print(f"{'='*60}\n")
    
    if not tag_description:
        print("Warning: No tag description provided. Cannot perform semantic search.")
        return []
    
    # Perform vector search using the tag description
    similar_tags = vector_search_similar_tags(tag_description, email, limit)
    
    # Filter out the exact same tag if it appears in results
    filtered_results = [
        tag for tag in similar_tags 
        if tag.get("tag_name", "").lower() != tag_name.lower()
    ]
    
    return filtered_results[:limit]


if __name__ == "__main__":
    import sys
    
    # Usage: python tags_vector_search.py <email> <tag_name> <tag_description>
    # Example: python tags_vector_search.py "user@example.com" "deep-work" "Focused coding sessions with no distractions"
    
    if len(sys.argv) < 4:
        print("Usage: python tags_vector_search.py <email> <tag_name> <tag_description>")
        print("Example: python tags_vector_search.py user@example.com deep-work 'Focused coding sessions'")
        sys.exit(1)
    
    email = sys.argv[1]
    tag_name = sys.argv[2]
    tag_description = " ".join(sys.argv[3:])
    
    results = find_similar_tags_for_task(tag_name, tag_description, email, limit=4)
    
    if not results:
        print("\nNo similar tags found.")
        print("(Ensure you have data in 'tags' collection with embeddings and a vector index created)")
    else:
        print(f"\nFound {len(results)} similar tags:\n")
        for i, tag in enumerate(results, 1):
            name = tag.get("tag_name", "Unknown")
            desc = tag.get("tag_description", "No description")
            tag_email = tag.get("email", "Unknown")
            score = tag.get("score", 0.0)
            print(f"{i}. [{score:.4f}] {name}")
            print(f"   Email: {tag_email}")
            print(f"   Description: {desc}")
            print("-" * 40)

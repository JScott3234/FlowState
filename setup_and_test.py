"""
Setup and Test Script for Time Estimation Agent

This script helps you set up test data and verify the time estimation agent works correctly.
"""

import os
from dotenv import load_dotenv
from pymongo import MongoClient
from db import set_tag
from task_time_estimator import estimate_task_time

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")


def setup_test_tags():
    """Create test tags with descriptions and embeddings."""
    print("="*60)
    print("SETTING UP TEST TAGS")
    print("="*60)
    
    client = MongoClient(MONGO_URI)
    test_email = "test@example.com"
    
    test_tags = [
        ("coding", "Programming and software development tasks"),
        ("deep-work", "Focused work sessions without distractions"),
        ("debugging", "Finding and fixing bugs in code"),
        ("frontend", "Frontend development and UI work"),
        ("backend", "Backend development and API work"),
        ("learning", "Learning new technologies and concepts"),
    ]
    
    print(f"\nCreating {len(test_tags)} test tags for {test_email}...\n")
    
    for tag_name, tag_description in test_tags:
        success = set_tag(client, test_email, tag_name, tag_description)
        status = "✓" if success else "✗"
        print(f"{status} Created tag: '{tag_name}'")
        print(f"   Description: {tag_description}")
    
    client.close()
    print("\n" + "="*60)
    print("TEST TAGS SETUP COMPLETE")
    print("="*60)


def test_time_estimation():
    """Test the time estimation agent with a sample task."""
    print("\n" + "="*60)
    print("TESTING TIME ESTIMATION AGENT")
    print("="*60)
    
    # Test case 1: Coding task
    print("\n--- Test Case 1: Coding Task ---")
    result1 = estimate_task_time(
        email="test@example.com",
        task_title="Implement REST API",
        task_description="Build a RESTful API with authentication and CRUD operations",
        tag_name="backend",
        tag_description="Backend development and API work",
        initial_estimate_minutes=120
    )
    
    print(f"✓ Recommendation: {result1['recommendation'].upper()}")
    print(f"✓ Suggested Time: {result1['suggested_minutes']} minutes")
    print(f"✓ Confidence: {result1['confidence'].upper()}")
    print(f"✓ Similar Tags: {result1['similar_tags_found']}")
    print(f"✓ Historical Tasks: {result1['historical_tasks_analyzed']}")
    print(f"\n📝 Reasoning: {result1['reasoning'][:200]}...")
    
    # Test case 2: Learning task
    print("\n--- Test Case 2: Learning Task ---")
    result2 = estimate_task_time(
        email="test@example.com",
        task_title="Learn React Hooks",
        task_description="Study React hooks documentation and build practice examples",
        tag_name="learning",
        tag_description="Learning new technologies and concepts",
        initial_estimate_minutes=60
    )
    
    print(f"✓ Recommendation: {result2['recommendation'].upper()}")
    print(f"✓ Suggested Time: {result2['suggested_minutes']} minutes")
    print(f"✓ Confidence: {result2['confidence'].upper()}")
    
    print("\n" + "="*60)
    print("TESTING COMPLETE")
    print("="*60)


def main():
    """Main function to run setup and tests."""
    print("\n" + "="*60)
    print("TIME ESTIMATION AGENT - SETUP & TEST")
    print("="*60)
    
    print("\nThis script will:")
    print("1. Create test tags with embeddings")
    print("2. Test the time estimation agent")
    print("\nNote: Ensure you have:")
    print("- MongoDB Atlas connection configured")
    print("- Vector index 'tags_vector_index' created on tags collection")
    print("- GOOGLE_API_KEY in your .env file")
    
    input("\nPress Enter to continue...")
    
    # Setup test data
    setup_test_tags()
    
    # Run tests
    test_time_estimation()
    
    print("\n✓ All setup and tests complete!")
    print("\nNext steps:")
    print("1. Verify tags have embeddings in MongoDB")
    print("2. Create vector index if not already done:")
    print("   - Index name: tags_vector_index")
    print("   - Path: embedding")
    print("   - Dimensions: 768 (for gemini-embedding-001)")
    print("3. Add historical tasks to test with real data")


if __name__ == "__main__":
    main()

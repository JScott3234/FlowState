
import asyncio
from main import agent_chat, AgentChatRequest

async def test_agent_chat_endpoint():
    print("Testing agent_chat endpoint...")
    
    # Test case 1: Standard chat
    req1 = AgentChatRequest(message="Hello, who are you?", user_id="test_user")
    res1 = await agent_chat(req1)
    print(f"Response 1: {res1['response']}")
    assert "response" in res1
    assert res1["user_id"] == "test_user"
    
    # Test case 2: Chat with URL
    req2 = AgentChatRequest(message="Summarize this: https://example.com", user_id="test_user")
    res2 = await agent_chat(req2)
    print(f"Response 2: {res2['response']}")
    assert "response" in res2

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(test_agent_chat_endpoint())

import asyncio
import websockets
import json
import requests
import uuid

async def test_websocket_and_agent():
    client_id = str(uuid.uuid4())
    uri = f"ws://localhost:8000/ws/{client_id}"
    
    # Task data
    task_data = {
        "email": "me@example.com",
        "title": f"Test Task {client_id[:8]}",
        "client_id": client_id,
        "description": "I want to implement a websocket connection in FastAPI.",
        "tag_names": ["Dev", "Web"],
        "is_completed": False
    }

    async with websockets.connect(uri) as websocket:
        print(f"Connected to WebSocket with client_id: {client_id}")
        
        # Trigger task creation
        response = requests.post("http://localhost:8000/api/tasks", json=task_data)
        print(f"API Response: {response.json()}")
        
        # Listen for updates
        print("Waiting for agent updates...")
        try:
            while True:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=30.0)
                    data = json.loads(message)
                    print(f"\nReceived Event: {data['type']}")
                    if data['type'] == 'agent_message':
                        print(f"Content: {data['content'][:100]}...")
                    elif data['type'] == 'agent_status':
                        print(f"Status: {data['status']} - {data['message']}")
                        if data['status'] == 'completed':
                            break
                except asyncio.TimeoutError:
                    print("Timeout waiting for message")
                    break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket_and_agent())

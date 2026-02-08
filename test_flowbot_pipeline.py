import asyncio
import json
import websockets
import httpx

async def test_flowbot_pipeline():
    base_url = "http://localhost:8001"
    ws_url = "ws://localhost:8001/ws"
    socket_id = "test_flowbot_socket"
    user_id = "ricardomulino@gmail.com"
    
    print(f"Connecting to WebSocket: {ws_url}/{socket_id}")
    async with websockets.connect(f"{ws_url}/{socket_id}") as websocket:
        print("Connected!")
        
        # Send chat request via HTTP
        print("Sending chat request via HTTP...")
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{base_url}/api/agent/chat",
                    json={
                        "message": "Summarize https://example.com in one sentence",
                        "user_id": user_id,
                        "socket_id": socket_id
                    }
                )
                print(f"HTTP Response Code: {response.status_code}")
                print(f"HTTP Response Body: {response.json()}")
                assert response.status_code == 200
                assert response.json()["status"] == "processing"
            except Exception as e:
                print(f"HTTP Request failed: {e}")
                raise

        # Wait for WebSocket messages
        print("Waiting for WebSocket messages...")
        status_received = False
        result_received = False
        
        while not result_received:
            try:
                message_raw = await asyncio.wait_for(websocket.recv(), timeout=20.0)
                message = json.loads(message_raw)
                print(f"Received WS Message: {message}")
                
                if message["type"] == "flowbot_status":
                    status_received = True
                    print(f"Status: {message['status']} - {message['message']}")
                
                if message["type"] == "flowbot_result":
                    result_received = True
                    print(f"Result: {message['response']}")
                    break
                    
                if message["type"] == "flowbot_error":
                    print(f"Error: {message['error']}")
                    break
            except asyncio.TimeoutError:
                print("Timed out waiting for WebSocket message")
                break
        
        assert status_received, "Never received status message"
        assert result_received, "Never received result message"
        print("\nFlowBot Pipeline Test PASSED!")

if __name__ == "__main__":
    asyncio.run(test_flowbot_pipeline())

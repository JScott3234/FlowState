import asyncio
from typing import Optional
from agent import graph
from main import manager

async def run_agent_background(client_id: str, email: str, title: str, description: Optional[str]):
    """
    Runs the LangGraph agent in the background and sends updates via WebSocket.
    """
    try:
        # Notify frontend agent is starting
        await manager.send_personal_message({
            "type": "agent_status",
            "status": "started",
            "message": f"Agent analyzing task: {title}"
        }, client_id)

        # Build initial state
        initial_state = {
            "messages": [("user", f"New task created: '{title}'. Description: {description or 'None'}")],
            "user_id": email
        }

        # Run agent (final result only)
        final_state = await graph.ainvoke(initial_state)
        
        # Extract content and context
        content = ""
        if "messages" in final_state and final_state["messages"]:
            content = final_state["messages"][-1].content
            
        context = final_state.get("context", [])

        # Send final update
        await manager.send_personal_message({
            "type": "agent_result",
            "content": content,
            "context": context
        }, client_id)

        # Notify completion
        await manager.send_personal_message({
            "type": "agent_status",
            "status": "completed",
            "message": "Agent analysis finished."
        }, client_id)

    except Exception as e:
        print(f"Error in background agent task: {e}")
        await manager.send_personal_message({
            "type": "agent_error",
            "error": str(e)
        }, client_id)

from fastapi import APIRouter, WebSocket
import asyncio
import random
from typing import List

router = APIRouter()

@router.websocket("/ws/predictions")
async def websocket_predictions(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Simulate real-time updates
            # In a real app, this would come from a Redis channel or similar
            update = {
                "type": "prediction_update",
                "data": [
                    {
                        "ticker": "RELIANCE",
                        "new_price": random.uniform(2400, 2500),
                        "timestamp": "now"
                    }
                ]
            }
            await websocket.send_json(update)
            await asyncio.sleep(5) # Update every 5 seconds
    except Exception as e:
        print(f"WebSocket error: {e}")
        pass

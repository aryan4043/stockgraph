
import asyncio
import time
from app.api.predictions import get_top_movers, get_market_insight

# Simple script to run the async functions and time them
# Note: This runs inside the container environment where app code resides

async def test_endpoints():
    print("Testing get_top_movers...")
    start = time.time()
    try:
        movers = await get_top_movers()
        print(f"Top Movers fetched: {len(movers)}")
    except Exception as e:
        print(f"Top Movers FAILED: {e}")
    end = time.time()
    print(f"Time taken: {end - start:.2f}s")

    print("\nTesting get_market_insight...")
    start = time.time()
    try:
        insight = await get_market_insight()
        print(f"Market Insight fetched: {insight}")
    except Exception as e:
        print(f"Market Insight FAILED: {e}")
    end = time.time()
    print(f"Time taken: {end - start:.2f}s")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(test_endpoints())

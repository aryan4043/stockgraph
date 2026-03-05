
import time
from app.utils.stock_fetcher import StockDataFetcher

fetcher = StockDataFetcher()
symbol = "RELIANCE.NS"

print(f"Testing performance for {symbol}...")
start = time.time()
data = fetcher.get_stock_price(symbol)
end = time.time()

print(f"Time taken: {end - start:.4f} seconds")
if data:
    print(f"Price: {data.get('current_price')}")
else:
    print("Failed to fetch data")

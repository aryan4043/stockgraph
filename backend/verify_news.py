
from app.utils.stock_fetcher import StockDataFetcher
import json

fetcher = StockDataFetcher()
symbol = "RELIANCE.NS"
print(f"Testing _get_news for {symbol}...")

# Mocking a ticker object isn't easy without yfinance, 
# so we will just instantiate the fetcher and call a method if possible, 
# OR we can just run the full get_stock_details which calls _get_news
# inside the real environment where yfinance is available.

try:
    # This will use the real yfinance inside the container
    data = fetcher.get_stock_details(symbol)
    if data and 'intelligence' in data:
        news = data['intelligence']['news']
        print(f"News items found: {len(news)}")
        print(json.dumps(news, indent=2))
        
        # Validation checks
        if len(news) > 0:
            first = news[0]
            if first['date'] == '1970-01-01':
                print("FAILURE: Date is still 1970-01-01")
            elif first['headline'] is None:
                print("FAILURE: Headline is None")
            else:
                print("SUCCESS: News data looks valid")
    else:
        print("No details found or no intelligence section")

except Exception as e:
    print(f"Error during verification: {e}")


import yfinance as yf
import json
from datetime import datetime

symbol = "RELIANCE.NS"
print(f"Fetching news for {symbol}...")
ticker = yf.Ticker(symbol)
try:
    news = ticker.news
    print(f"Raw news type: {type(news)}")
    if news:
        print(f"First item: {json.dumps(news[0], indent=2, default=str)}")
    else:
        print("No news found.")
except Exception as e:
    print(f"Error: {e}")

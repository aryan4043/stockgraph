import yfinance as yf
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import logging

logger = logging.getLogger(__name__)

class StockDataFetcher:
    """Fetches real-time stock data using yfinance"""
    
    def __init__(self):
        self.cache = {}
        self.cache_duration = timedelta(minutes=5)
    
    def get_stock_price(self, symbol: str) -> Optional[Dict]:
        """
        Fetch current stock price and basic info
        Returns: {
            'symbol': str,
            'name': str,
            'current_price': float,
            'change': float,
            'change_percent': float,
            'volume': int,
            'market_cap': float
        }
        """
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            hist = ticker.history(period="2d")
            
            if hist.empty or len(hist) < 2:
                logger.warning(f"No data available for {symbol}")
                return None
            
            current_price = hist['Close'].iloc[-1]
            prev_price = hist['Close'].iloc[-2]
            change = current_price - prev_price
            change_percent = (change / prev_price) * 100
            
            return {
                'symbol': symbol,
                'name': info.get('longName', symbol),
                'current_price': round(float(current_price), 2),
                'change': round(float(change), 2),
                'change_percent': round(float(change_percent), 2),
                'volume': int(hist['Volume'].iloc[-1]) if 'Volume' in hist else 0,
                'market_cap': info.get('marketCap', 0)
            }
        except Exception as e:
            logger.error(f"Error fetching data for {symbol}: {e}")
            return None
    
    def get_historical_data(self, symbol: str, period: str = "1mo") -> List[Dict]:
        """
        Fetch historical price data
        period: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
        """
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            
            data = []
            for index, row in hist.iterrows():
                data.append({
                    'date': index.strftime('%Y-%m-%d'),
                    'open': round(float(row['Open']), 2),
                    'high': round(float(row['High']), 2),
                    'low': round(float(row['Low']), 2),
                    'close': round(float(row['Close']), 2),
                    'volume': int(row['Volume'])
                })
            
            return data
        except Exception as e:
            logger.error(f"Error fetching historical data for {symbol}: {e}")
            return []
    
    def get_multiple_stocks(self, symbols: List[str]) -> Dict[str, Dict]:
        """Fetch data for multiple stocks at once"""
        results = {}
        for symbol in symbols:
            data = self.get_stock_price(symbol)
            if data:
                results[symbol] = data
        return results

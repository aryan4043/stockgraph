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
        Fetch current stock price and basic info using fast_info
        """
        try:
            ticker = yf.Ticker(symbol)
            
            # Use fast_info for speed and reliability
            try:
                fast_info = ticker.fast_info
                current_price = fast_info.last_price
                prev_price = fast_info.previous_close
                market_cap = fast_info.market_cap
                volume = fast_info.last_volume
            except Exception:
                 # Fallback to history if fast_info fails
                hist = ticker.history(period="2d")
                if hist.empty or len(hist) < 2:
                    return None
                current_price = hist['Close'].iloc[-1]
                prev_price = hist['Close'].iloc[-2]
                market_cap = 0
                volume = int(hist['Volume'].iloc[-1]) if 'Volume' in hist else 0

            if not current_price or not prev_price:
                 return None

            change = current_price - prev_price
            change_percent = (change / prev_price) * 100
            
            return {
                'symbol': symbol,
                'name': symbol, # Caller should provide name from static list to avoid network call
                'current_price': round(float(current_price), 2),
                'change': round(float(change), 2),
                'change_percent': round(float(change_percent), 2),
                'volume': volume,
                'market_cap': market_cap
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
    
    def get_stock_details(self, symbol: str) -> Optional[Dict]:
        """
        Fetch comprehensive stock details matching ComprehensiveStockProfile schema
        """
        try:
            logger.info(f"Fetching details for symbol: {symbol}")
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Helper to safely get value
            def get_val(key, default=None):
                return info.get(key, default)
            
            # Robust Price Fetching: Try info, then fast_info, then history
            current_price = get_val("currentPrice", get_val("regularMarketPrice"))
            if not current_price:
                try:
                    current_price = ticker.fast_info.last_price
                    logger.info(f"Fetched price from fast_info: {current_price}")
                except:
                    pass
            
            if not current_price:
                 # Fallback to history
                 try:
                     hist = ticker.history(period="1d")
                     if not hist.empty:
                         current_price = hist['Close'].iloc[-1]
                         logger.info(f"Fetched price from history: {current_price}")
                 except:
                     pass
            
            # ensure we have a valid price, else 0
            current_price = float(current_price) if current_price else 0.0

            # 1. Market Data & Fundamentals (Aggregated)
            profile = {
                "market_data": {
                    "current_price": current_price,
                    "currency": get_val("currency", "INR"),
                    "open": get_val("open", get_val("dayLow")), # Fallbacks
                    "high": get_val("dayHigh"),
                    "low": get_val("dayLow"),
                    "close": get_val("previousClose"),
                    "volume": get_val("volume"),
                    "fifty_two_week_high": get_val("fiftyTwoWeekHigh"),
                    "fifty_two_week_low": get_val("fiftyTwoWeekLow"),
                    "market_cap": get_val("marketCap"),
                    "beta": get_val("beta"),
                    "pe_ratio": get_val("trailingPE"),
                    "pb_ratio": get_val("priceToBook"),
                    "dividend_yield": get_val("dividendYield"),
                    "price_change": 0, # Calculated below
                    "price_change_percent": 0 # Calculated below
                },
                "company_fundamentals": {
                    "name": get_val("longName", symbol),
                    "symbol": symbol,
                    "sector": get_val("sector"),
                    "industry": get_val("industry"),
                    "description": get_val("longBusinessSummary", "No description available."),
                    "shareholding_pattern": self._get_shareholding(ticker)
                },
                "financials": self._get_financials(ticker, info),
                "intelligence": {
                    "news": self._get_news(ticker),
                    "corporate_actions": self._get_actions(ticker)
                }
            }
            
            # Calculate price change manually if needed
            prev_close = profile["market_data"]["close"]
            if prev_close and current_price:
                change = current_price - prev_close
                profile["market_data"]["price_change"] = change
                profile["market_data"]["price_change_percent"] = (change / prev_close) * 100
            
            return profile
            
        except Exception as e:
            logger.error(f"Error fetching details for {symbol}: {e}")
            return None

    def _get_financials(self, ticker, info) -> Dict:
        """Extract key financial metrics"""
        try:
            fin = {}
            # Try getting from info first (faster/easier)
            fin["revenue_ttm"] = info.get("totalRevenue")
            fin["profit_ttm"] = info.get("netIncomeToCommon")
            fin["eps_ttm"] = info.get("trailingEps")
            fin["book_value"] = info.get("bookValue")
            
            # Balance Sheet & Cash Flow (Mock/approx for now to ensure stability)
            # In a real heavy app, we'd parse ticker.balance_sheet
            fin["balance_sheet"] = {
                "total_assets": info.get("totalAssets"),
                "total_liabilities": info.get("totalDebt"), # Proxy
                "debt_to_equity": info.get("debtToEquity")
            }
            fin["cash_flow"] = {
                "operating_cash_flow": info.get("operatingCashflow"),
                "free_cash_flow": info.get("freeCashflow")
            }
            return fin
        except Exception:
            return {}

    def _get_shareholding(self, ticker) -> List[Dict]:
        """Get shareholding pattern"""
        try:
            # yfinance major_holders is often just text rows
            # We will try to structure it, or return basic list
            holders = ticker.major_holders
            if holders is not None and not holders.empty:
                return [{"holder_type": str(row.iloc[1]), "percentage": float(str(row.iloc[0]).replace('%', ''))} for _, row in holders.iterrows()]
            return []
        except Exception:
            return []

    def _get_news(self, ticker) -> List[Dict]:
        """Get recent news"""
        try:
            news_items = ticker.news
            if not news_items:
                return []
            
            formatted = []
            for item in news_items[:5]:
                # Handle new yfinance structure (nested in 'content')
                if 'content' in item:
                    content = item['content']
                    # Parse ISO date string
                    try:
                        pub_date = content.get('pubDate')
                        if pub_date:
                            dt = datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
                            date_str = dt.strftime('%Y-%m-%d')
                        else:
                            date_str = datetime.now().strftime('%Y-%m-%d')
                    except:
                        date_str = datetime.now().strftime('%Y-%m-%d')

                    formatted.append({
                        "headline": content.get('title'),
                        "source": content.get('provider', {}).get('displayName', 'Yahoo Finance'),
                        "date": date_str,
                        "link": content.get('clickThroughUrl', {}).get('url'),
                        "sentiment": "Neutral" # Placeholder for AI sentiment
                    })
                # Handle old yfinance structure (flat dict)
                else:
                    formatted.append({
                        "headline": item.get('title'),
                        "source": item.get('publisher'),
                        "date": datetime.fromtimestamp(item.get('providerPublishTime', 0)).strftime('%Y-%m-%d'),
                        "link": item.get('link'),
                        "sentiment": "Neutral" # Placeholder for AI sentiment
                    })
            return formatted
        except Exception as e:
            logger.error(f"Error fetching news: {e}")
            return []

    def _get_actions(self, ticker) -> List[Dict]:
        """Get corporate actions"""
        try:
            actions = ticker.actions
            if actions is not None and not actions.empty:
                # Get last 3 actions
                recent = actions.tail(3)
                return [{"date": str(idx.date()), "type": "Dividend/Split", "description": f"Div: {row.get('Dividends', 0)} Split: {row.get('Stock Splits', 0)}"} for idx, row in recent.iterrows()]
            return []
        except Exception:
            return []

    def get_multiple_stocks(self, symbols: List[str]) -> Dict[str, Dict]:
        """Fetch data for multiple stocks at once"""
        results = {}
        for symbol in symbols:
            data = self.get_stock_price(symbol)
            if data:
                results[symbol] = data
        return results

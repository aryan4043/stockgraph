import google.generativeai as genai
import os
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)

class GeminiAI:
    """Google Gemini AI integration for stock predictions and explanations"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model = None
        self._setup_done = False

    def _ensure_setup(self):
        """Lazy initialization of the model"""
        if self._setup_done:
            return

        if not self.api_key:
            logger.warning("GEMINI_API_KEY not set. AI features will be limited.")
            self.model = None
            self._setup_done = True
            return

        try:
            genai.configure(api_key=self.api_key)
            
            # Use a safe default logic instead of blocking network calls if possible,
            # but here we need to know what's supported. We'll do a quick check.
            available_models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
            logger.info(f"Available Gemini models: {available_models}")
            
            # Prefer flash, then pro, then any
            model_name = 'gemini-pro' # fallback default
            if 'models/gemini-1.5-flash' in available_models:
                model_name = 'gemini-1.5-flash'
            elif 'models/gemini-pro' in available_models:
                model_name = 'gemini-pro'
            elif available_models:
                # distinct 'models/' prefix if needed
                model_name = available_models[0].replace('models/', '')
            
            logger.info(f"Selected Gemini model: {model_name}")
            self.model = genai.GenerativeModel(model_name)
            
        except Exception as e:
            logger.error(f"Error checking available models: {e}. Defaulting to gemini-1.5-flash")
            # If listing fails, just try the most likely one
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        self._setup_done = True
    
    def generate_prediction_explanation(
        self,
        stock_name: str,
        current_price: float,
        predicted_change: float,
        sector: str
    ) -> str:
        """
        Generate AI explanation for stock prediction
        """
        self._ensure_setup()
        
        if not self.model:
            return f"Based on technical analysis and sector trends. {stock_name} shows {'bullish' if predicted_change > 0 else 'bearish'} momentum."
        
        try:
            prompt = f"""
As a financial analyst AI, provide a brief explanation (2-3 sentences) for why {stock_name} 
in the {sector} sector might see a {abs(predicted_change):.2f}% {'increase' if predicted_change > 0 else 'decrease'} 
from its current price of ₹{current_price:.2f}.

Consider:
- Sector trends
- Market sentiment
- Technical indicators

Keep it concise and professional.
"""
            
            response = self.model.generate_content(prompt)
            return response.text.strip()
        
        except Exception as e:
            logger.error(f"Error generating AI explanation: {e}")
            return f"Based on sector analysis and market trends. {stock_name} shows {'positive' if predicted_change > 0 else 'negative'} momentum in the {sector} sector."
    
    def analyze_market_sentiment(self, stocks_data: list) -> Dict:
        """
        Analyze overall market sentiment based on multiple stocks
        """
        self._ensure_setup()

        if not self.model:
            # Fallback analysis
            positive = sum(1 for s in stocks_data if s.get('change_percent', 0) > 0)
            total = len(stocks_data)
            sentiment_score = (positive / total) * 10 if total > 0 else 5
            
            return {
                'sentiment': 'Neutral',
                'score': sentiment_score,
                'summary': 'Market showing mixed signals with balanced sector performance.'
            }
        
        try:
            # Prepare market summary
            gainers = [s for s in stocks_data if s.get('change_percent', 0) > 0]
            losers = [s for s in stocks_data if s.get('change_percent', 0) < 0]
            
            prompt = f"""
Analyze the current Indian stock market sentiment based on this data:
- Total stocks tracked: {len(stocks_data)}
- Gainers: {len(gainers)}
- Losers: {len(losers)}
- Top gainer: {gainers[0]['name'] if gainers else 'N/A'} (+{gainers[0].get('change_percent', 0):.2f}%)
- Top loser: {losers[0]['name'] if losers else 'N/A'} ({losers[0].get('change_percent', 0):.2f}%)

Provide:
1. Overall sentiment (Bullish/Bearish/Neutral)
2. Sentiment score (0-10)
3. Brief 1-sentence summary

Format: SENTIMENT|SCORE|SUMMARY
"""
            
            response = self.model.generate_content(prompt)
            result_text = response.text.strip()
            # Remove any markdown formatting if present
            result_text = result_text.replace('**', '').replace('*', '')
            
            parts = result_text.split('|')
            
            score_str = parts[1].strip() if len(parts) > 1 else '5.0'
            try:
                score = float(score_str)
            except ValueError:
                score = 5.0

            return {
                'sentiment': parts[0].strip() if len(parts) > 0 else 'Neutral',
                'score': score,
                'summary': parts[2].strip() if len(parts) > 2 else 'Mixed market conditions.'
            }
        
        except Exception as e:
            logger.error(f"Error analyzing market sentiment: {e}")
            # Fallback that looks better than an error message
            return {
                'sentiment': 'Neutral',
                'score': 5.0,
                'summary': 'Market data is currently volatile. AI sentiment analysis is temporarily unavailable.'
            }

    def analyze_portfolio_health(self, holdings: list) -> Dict:
        """
        Analyze portfolio risk and diversification using Gemini
        """
        self._ensure_setup()

        if not self.model:
            return {
                "risk_score": 5.0,
                "diversification_score": 5.0,
                "recommendations": ["AI features unavailable. Diversify across sectors."]
            }
            
        try:
            holdings_summary = "\n".join([
                f"- {h['ticker']}: {h['quantity']} shares @ {h['avg_price']} (Sector: {h.get('sector', 'Unknown')})"
                for h in holdings
            ])
            
            prompt = f"""
As a financial advisor, analyze this stock portfolio:
{holdings_summary}

Provide:
1. Risk Score (1-10, where 10 is extremely risky/concentrated)
2. Diversification Score (1-10, where 10 is perfectly diversified)
3. 3 Strategic Recommendations (bullet points, no asterisks)

Format exactly as:
RISK|DIVERSIFICATION|REC1;REC2;REC3
"""
            response = self.model.generate_content(prompt)
            text = response.text.strip().replace('**', '')
            parts = text.split('|')
            
            recommendations = parts[2].strip().split(';') if len(parts) > 2 else ["Review portfolio allocation."]
            
            # Clean up recommendations
            recommendations = [r.strip().replace('- ', '') for r in recommendations if r.strip()]

            return {
                "risk_score": float(parts[0].strip()) if len(parts) > 0 else 5.0,
                "diversification_score": float(parts[1].strip()) if len(parts) > 1 else 5.0,
                "recommendations": recommendations[:3]
            }
            
        except Exception as e:
            logger.error(f"Error analyzing portfolio: {e}")
            return {
                "risk_score": 5.0,
                "diversification_score": 5.0,
                "recommendations": ["Error generating AI insights. Ensure portfolio has valid stocks."]
            }

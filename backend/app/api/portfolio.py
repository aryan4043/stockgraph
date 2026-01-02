from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict
from ..data.indian_stocks import get_stock_by_symbol
from ..utils.stock_fetcher import StockDataFetcher

from ..utils.gemini_ai import GeminiAI

router = APIRouter()
fetcher = StockDataFetcher()
gemini = GeminiAI()

class Holding(BaseModel):
    ticker: str
    quantity: int
    avg_price: float

class PortfolioAnalysisRequest(BaseModel):
    holdings: List[Holding]

class PortfolioAnalysisResponse(BaseModel):
    risk_score: float
    diversification_score: float
    recommendations: List[str]
    sector_allocation: Dict[str, float]

@router.post("/portfolio/analyze", response_model=PortfolioAnalysisResponse)
async def analyze_portfolio(request: PortfolioAnalysisRequest):
    if not request.holdings:
        raise HTTPException(status_code=400, detail="No holdings provided")
    
    # Calculate total portfolio value using real stock prices
    total_value = 0
    sector_values = {}
    enriched_holdings = []
    
    for holding in request.holdings:
        symbol = holding.ticker if ".NS" in holding.ticker else f"{holding.ticker}.NS"
        stock_info = get_stock_by_symbol(symbol)
        
        # Default values if not found using basic lookup
        sector = "Unknown"
        current_price = holding.avg_price 
        
        if stock_info:
            sector = stock_info[2]
            # Get real stock data
            stock_data = fetcher.get_stock_price(symbol)
            if stock_data:
                current_price = stock_data['current_price']
            
            holding_value = holding.quantity * current_price
            total_value += holding_value
            
            if sector not in sector_values:
                sector_values[sector] = 0
            sector_values[sector] += holding_value
            
            # Add to enriched list for AI
            enriched_holdings.append({
                "ticker": holding.ticker,
                "quantity": holding.quantity,
                "avg_price": holding.avg_price,
                "sector": sector
            })
    
    # Calculate sector allocation percentages for the chart
    sector_allocation = {
        sector: round((value / total_value) * 100, 2) 
        for sector, value in sector_values.items()
    } if total_value > 0 else {}
    
    # Get AI Analysis
    ai_analysis = gemini.analyze_portfolio_health(enriched_holdings)
    
    return PortfolioAnalysisResponse(
        risk_score=ai_analysis.get('risk_score', 5.0),
        diversification_score=ai_analysis.get('diversification_score', 5.0),
        recommendations=ai_analysis.get('recommendations', ["Diversify your portfolio across multiple sectors."]),
        sector_allocation=sector_allocation
    )

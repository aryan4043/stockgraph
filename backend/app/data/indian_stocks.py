# List of major Indian stocks (NSE)
# Format: (Symbol, Company Name, Sector)

INDIAN_STOCKS = [
    # NIFTY 50 Companies
    ("RELIANCE.NS", "Reliance Industries", "Energy"),
    ("TCS.NS", "Tata Consultancy Services", "Technology"),
    ("HDFCBANK.NS", "HDFC Bank", "Finance"),
    ("INFY.NS", "Infosys", "Technology"),
    ("ICICIBANK.NS", "ICICI Bank", "Finance"),
    ("HINDUNILVR.NS", "Hindustan Unilever", "Consumer Goods"),
    ("ITC.NS", "ITC Limited", "Consumer Goods"),
    ("SBIN.NS", "State Bank of India", "Finance"),
    ("BHARTIARTL.NS", "Bharti Airtel", "Telecom"),
    ("KOTAKBANK.NS", "Kotak Mahindra Bank", "Finance"),
    ("LT.NS", "Larsen & Toubro", "Infrastructure"),
    ("AXISBANK.NS", "Axis Bank", "Finance"),
    ("ASIANPAINT.NS", "Asian Paints", "Materials"),
    ("MARUTI.NS", "Maruti Suzuki", "Automotive"),
    ("BAJFINANCE.NS", "Bajaj Finance", "Finance"),
    ("HCLTECH.NS", "HCL Technologies", "Technology"),
    ("WIPRO.NS", "Wipro", "Technology"),
    ("ULTRACEMCO.NS", "UltraTech Cement", "Materials"),
    ("TITAN.NS", "Titan Company", "Consumer Goods"),
    ("SUNPHARMA.NS", "Sun Pharmaceutical", "Pharma"),
    ("TECHM.NS", "Tech Mahindra", "Technology"),
    ("NESTLEIND.NS", "Nestle India", "Consumer Goods"),
    ("NTPC.NS", "NTPC", "Energy"),
    ("POWERGRID.NS", "Power Grid Corporation", "Energy"),
    ("M&M.NS", "Mahindra & Mahindra", "Automotive"),
    ("TATAMOTORS.NS", "Tata Motors", "Automotive"),
    ("BAJAJFINSV.NS", "Bajaj Finserv", "Finance"),
    ("ONGC.NS", "Oil & Natural Gas Corporation", "Energy"),
    ("COALINDIA.NS", "Coal India", "Energy"),
    ("DRREDDY.NS", "Dr. Reddy's Laboratories", "Pharma"),
    ("DIVISLAB.NS", "Divi's Laboratories", "Pharma"),
    ("ADANIPORTS.NS", "Adani Ports", "Infrastructure"),
    ("CIPLA.NS", "Cipla", "Pharma"),
    ("BRITANNIA.NS", "Britannia Industries", "Consumer Goods"),
    ("INDUSINDBK.NS", "IndusInd Bank", "Finance"),
    ("JSWSTEEL.NS", "JSW Steel", "Materials"),
    ("TATASTEEL.NS", "Tata Steel", "Materials"),
    ("HINDALCO.NS", "Hindalco Industries", "Materials"),
    ("GRASIM.NS", "Grasim Industries", "Materials"),
    ("APOLLOHOSP.NS", "Apollo Hospitals", "Healthcare"),
    ("EICHERMOT.NS", "Eicher Motors", "Automotive"),
    ("HEROMOTOCO.NS", "Hero MotoCorp", "Automotive"),
    ("BAJAJ-AUTO.NS", "Bajaj Auto", "Automotive"),
    ("SHREECEM.NS", "Shree Cement", "Materials"),
    ("ADANIENT.NS", "Adani Enterprises", "Infrastructure"),
    ("BPCL.NS", "Bharat Petroleum", "Energy"),
    ("TATACONSUM.NS", "Tata Consumer Products", "Consumer Goods"),
    ("SBILIFE.NS", "SBI Life Insurance", "Finance"),
    ("HDFCLIFE.NS", "HDFC Life Insurance", "Finance"),
    ("IOC.NS", "Indian Oil Corporation", "Energy"),
]

def get_all_stocks():
    """Returns list of all tracked Indian stocks"""
    return INDIAN_STOCKS

def get_stock_by_symbol(symbol):
    """Get company details by symbol"""
    for stock in INDIAN_STOCKS:
        if stock[0] == symbol:
            return stock
    return None

def get_stocks_by_sector(sector):
    """Get all stocks in a given sector"""
    return [stock for stock in INDIAN_STOCKS if stock[2] == sector]

def get_all_sectors():
    """Get list of all unique sectors"""
    return list(set(stock[2] for stock in INDIAN_STOCKS))

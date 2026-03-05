export interface Financials {
    revenue_ttm?: number;
    profit_ttm?: number;
    eps_ttm?: number;
    book_value?: number;
    balance_sheet?: {
        total_assets?: number;
        total_liabilities?: number;
        debt_to_equity?: number;
    };
    cash_flow?: {
        operating_cash_flow?: number;
        free_cash_flow?: number;
    };
}

export interface ShareholdingItem {
    holder_type: string;
    percentage: number;
}

export interface NewsItem {
    headline: string;
    source: string;
    date: string;
    link?: string;
    sentiment?: string;
}

export interface CorporateAction {
    date: string;
    type: string;
    description: string;
}

export interface MarketData {
    current_price: number;
    currency: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    fifty_two_week_high: number;
    fifty_two_week_low: number;
    market_cap: number;
    beta: number;
    pe_ratio: number;
    pb_ratio: number;
    dividend_yield: number;
}

export interface CompanyFundamentals {
    name: string;
    symbol: string;
    sector: string;
    industry: string;
    description: string;
    shareholding_pattern: ShareholdingItem[];
}

export interface Intelligence {
    news: NewsItem[];
    corporate_actions: CorporateAction[];
}

// Full Profile from /details endpoint
export interface StockProfile {
    market_data: MarketData;
    company_fundamentals: CompanyFundamentals;
    financials: Financials;
    intelligence: Intelligence;
}

// Basic Stock object for Lists/Graph (Legacy support compatible)
export interface Stock {
    ticker: string;
    name: string;
    sector: string;
    current_price: number;
    predicted_change?: number;
    confidence?: number;
    volatility?: number;
    // Optional compatibility fields if needed
    market_cap?: number;
}

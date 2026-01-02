import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyzePortfolio, getAllStocks } from '../services/api';
import { PieChart, AlertTriangle, Search, Plus, Trash2 } from 'lucide-react';

export const PortfolioAnalyzer: React.FC = () => {
    const [holdings, setHoldings] = useState<any[]>([
        { ticker: 'RELIANCE', quantity: 10, avg_price: 2400 },
        { ticker: 'TCS', quantity: 5, avg_price: 3500 }
    ]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    // Fetch all stocks for the dropdown/search
    const { data: allStocks } = useQuery({
        queryKey: ['allStocks'],
        queryFn: getAllStocks
    });

    const { data: analysis, refetch: runAnalysis, isFetching: isAnalyzing } = useQuery({
        queryKey: ['portfolioAnalysis', holdings],
        queryFn: () => analyzePortfolio(holdings),
        enabled: holdings.length > 0 // Only run initial if we have holdings
    });

    // Filter stocks based on search
    const filteredStocks = useMemo(() => {
        if (!allStocks) return [];
        return allStocks.filter((stock: any) =>
            stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [allStocks, searchTerm]);

    const addStock = (stock: any) => {
        const symbol = stock.symbol.replace('.NS', '');
        if (holdings.find(h => h.ticker === symbol)) return; // Already added

        setHoldings([...holdings, { ticker: symbol, quantity: 1, avg_price: stock.current_price || 0 }]);
        setIsAdding(false);
        setSearchTerm('');
    };

    const removeStock = (ticker: string) => {
        setHoldings(holdings.filter(h => h.ticker !== ticker));
    };

    const updateQuantity = (ticker: string, qty: number) => {
        setHoldings(holdings.map(h => h.ticker === ticker ? { ...h, quantity: qty } : h));
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Col: Manage Holdings */}
            <div className="bg-surface/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col h-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                        <div className="p-2 bg-secondary/20 rounded-lg shrink-0">
                            <PieChart className="w-5 h-5 text-secondary" />
                        </div>
                        <span className="whitespace-normal">Manage Holdings</span>
                    </h3>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="w-full sm:w-auto px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2 text-sm font-medium whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        Add Stock
                    </button>
                </div>

                {isAdding && (
                    <div className="mb-6 bg-black/40 p-4 rounded-xl border border-white/10 shadow-lg relative z-20">
                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search all 50 stocks..."
                                className="w-full bg-surface/50 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary placeholder-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar pr-2">
                            {filteredStocks.map((stock: any) => (
                                <button
                                    key={stock.symbol}
                                    onClick={() => addStock(stock)}
                                    className="w-full text-left px-4 py-3 text-sm hover:bg-white/10 rounded-lg flex justify-between items-center group transition-colors border border-transparent hover:border-white/5"
                                >
                                    <span className="font-medium group-hover:text-primary transition-colors">{stock.name}</span>
                                    <span className="text-xs text-gray-500 font-mono bg-black/30 px-2 py-0.5 rounded">{stock.symbol.replace('.NS', '')}</span>
                                </button>
                            ))}
                            {filteredStocks.length === 0 && (
                                <div className="text-center text-xs text-gray-500 py-4">No stocks found matching "{searchTerm}"</div>
                            )}
                        </div>
                    </div>
                )}

                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[300px]">
                    {holdings.map((h) => (
                        <div key={h.ticker} className="flex flex-wrap sm:flex-nowrap items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors gap-3">
                            <div className="min-w-[120px]">
                                <div className="font-bold text-base">{h.ticker}</div>
                                <div className="text-xs text-start text-gray-400">Avg Price: ₹{h.avg_price}</div>
                            </div>
                            <div className="flex items-center gap-3 ml-auto">
                                <div className="flex items-center bg-black/30 rounded-lg border border-white/10 p-1">
                                    <input
                                        type="number"
                                        className="w-14 bg-transparent text-center text-sm focus:outline-none py-1"
                                        value={h.quantity}
                                        onChange={(e) => updateQuantity(h.ticker, Number(e.target.value))}
                                        min="1"
                                    />
                                    <span className="text-xs text-gray-500 pr-2 border-l border-white/10 pl-2">qty</span>
                                </div>
                                <button onClick={() => removeStock(h.ticker)} className="text-gray-500 hover:text-red-400 transition-colors p-2 hover:bg-white/5 rounded-lg shrink-0">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {holdings.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full border-2 border-dashed border-white/5 rounded-xl py-12 text-gray-500">
                            <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-3">
                                <Plus className="w-6 h-6 opacity-40" />
                            </div>
                            <p className="text-sm font-medium">Your portfolio is empty</p>
                            <p className="text-xs opacity-60 mt-1">Add stocks to get started</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => runAnalysis()}
                    disabled={isAnalyzing || holdings.length === 0}
                    className="w-full mt-6 py-4 bg-primary hover:bg-primary/90 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2"
                >
                    {isAnalyzing ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing Risk...</>
                    ) : (
                        'Analyze Portfolio Health'
                    )}
                </button>
            </div>

            {/* Right Col: Analysis Results */}
            <div className="bg-surface/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm h-full flex flex-col">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                    <div className="p-2 bg-accent/20 rounded-lg shrink-0">
                        <AlertTriangle className="w-5 h-5 text-accent" />
                    </div>
                    AI Analysis
                </h3>

                {analysis ? (
                    <div className="space-y-8 flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl text-center">
                                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-bold">Risk Score</div>
                                <div className={`text-5xl font-black ${analysis.risk_score > 7 ? 'text-red-400' : 'text-emerald-400'} flex justify-center items-baseline`}>
                                    {analysis.risk_score}<span className="text-lg font-medium text-gray-500 ml-1">/10</span>
                                </div>
                            </div>
                            <div className="p-6 bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-2xl text-center">
                                <div className="text-xs text-gray-400 uppercase tracking-wider mb-2 font-bold">Diversification</div>
                                <div className="text-5xl font-black text-amber-400 flex justify-center items-baseline">
                                    {analysis.diversification_score}<span className="text-lg font-medium text-gray-500 ml-1">/10</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                <div className="text-xs text-gray-400 uppercase tracking-wider font-bold">Strategic Recommendations</div>
                            </div>
                            <div className="space-y-4">
                                {analysis.recommendations.map((rec: string, i: number) => (
                                    <div key={i} className="flex gap-4 text-sm text-gray-200 bg-black/20 p-5 rounded-xl border border-white/5 hover:border-accent/30 transition-colors shadow-sm">
                                        <p className="leading-relaxed">{rec}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 text-sm opacity-60 border-2 border-dashed border-white/5 rounded-2xl p-12">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                            <PieChart className="w-10 h-10 text-gray-400" />
                        </div>
                        <p className="font-medium text-lg text-gray-300">Analysis Pending</p>
                        <p className="text-sm mt-2 text-center max-w-[200px]">Add stocks to your portfolio and click analyze to receive AI-powered insights.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

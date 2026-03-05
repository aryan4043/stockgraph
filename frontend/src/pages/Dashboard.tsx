import React, { lazy, Suspense } from 'react';
import { ScenarioSimulator } from '../components/ScenarioSimulator';
import { PortfolioAnalyzer } from '../components/PortfolioAnalyzer';
import { useQuery } from '@tanstack/react-query';
import { getTopMovers, getMarketInsight, getAllStocks } from '../services/api';
import { TrendingUp, BarChart2, MessageSquare, Zap, Target } from 'lucide-react';
import { Stock } from '../types';

// Lazy load the Graph3D component to isolate heavy 3D dependencies
const Graph3D = lazy(() => import('../components/Graph3D'));
import MciCard from '../components/MciCard';
import StockDetailModal from '../components/StockDetailModal';
import BrokerLinks from '../components/BrokerLinks';
import { EntryExitZone } from '../components/EntryExitZone';

export const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [selectedStock, setSelectedStock] = React.useState<string | null>(null);
    // Entry/Exit Zone panel state
    const [ezStock, setEzStock] = React.useState<{ symbol: string; name: string; price: number } | null>(null);

    const { data: topMovers } = useQuery<Stock[]>({
        queryKey: ['topMovers'],
        queryFn: getTopMovers,
    });

    // Fetch market insight at dashboard level to share with MCI Card
    const { data: marketInsight, isLoading: isLoadingInsight } = useQuery({
        queryKey: ['marketInsight'],
        queryFn: getMarketInsight,
        refetchInterval: 60000 // Refresh every minute
    });

    // Fetch all stocks for live price lookup in EntryExitZone
    const { data: allStocks } = useQuery({
        queryKey: ['allStocks'],
        queryFn: getAllStocks,
    });

    const renderContent = () => {
        if (activeTab === 'predictions') {
            return (
                <div className="max-w-7xl mx-auto p-6">
                    <h2 className="text-2xl font-bold mb-6">Market Predictions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {topMovers?.map((stock) => (
                            <div key={stock.ticker} onClick={() => setSelectedStock(stock.ticker)} className="bg-surface/50 border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-colors cursor-pointer">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-xl">{stock.ticker}</h3>
                                        <span className="text-gray-400 text-sm">₹{stock.current_price.toFixed(2)}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${stock.predicted_change && stock.predicted_change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {stock.predicted_change && stock.predicted_change > 0 ? '+' : ''}{stock.predicted_change ? (stock.predicted_change * 100).toFixed(2) : '-'}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm text-gray-400">
                                    <span>Confidence</span>
                                    <div className="w-24 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${stock.confidence * 100}%` }} />
                                    </div>
                                    <span>{(stock.confidence * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ScenarioSimulator />
                        <div className="bg-surface/30 border border-white/10 rounded-2xl p-6 flex items-center justify-center text-gray-400">
                            More prediction models coming soon...
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'portfolio') {
            return (
                <div className="max-w-5xl mx-auto p-6 space-y-8">
                    <h2 className="text-2xl font-bold">Portfolio Analysis</h2>

                    {/* Portfolio Analyzer (existing) */}
                    <PortfolioAnalyzer />

                    {/* Entry / Exit Zone Tool */}
                    <div className="bg-surface/50 border border-white/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <Target className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Entry / Exit Zone Calculator</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Select any stock below to see real support, resistance, and ideal trading zones.</p>
                            </div>
                        </div>

                        {/* Stock picker buttons */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            {allStocks?.slice(0, 20).map((stock: any) => {
                                const sym = stock.symbol.replace('.NS', '');
                                const isActive = ezStock?.symbol === sym;
                                return (
                                    <button
                                        key={stock.symbol}
                                        onClick={() => setEzStock({ symbol: sym, name: stock.name, price: stock.current_price ?? 0 })}
                                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all font-mono ${isActive
                                                ? 'bg-purple-500/30 border-purple-400 text-purple-300'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        {sym}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Zone panel */}
                        {ezStock ? (
                            <EntryExitZone
                                symbol={ezStock.symbol}
                                currentPrice={ezStock.price > 0 ? ezStock.price : 1000}
                                stockName={ezStock.name}
                                onClose={() => setEzStock(null)}
                            />
                        ) : (
                            <div className="text-center py-10 border-2 border-dashed border-white/5 rounded-xl text-gray-500 text-sm">
                                <Target className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                <p>Select a stock above to compute its entry &amp; exit zones</p>
                            </div>
                        )}
                    </div>

                    {/* Broker Links */}
                    <div className="bg-surface/50 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Your Holdings Breakdown</h3>
                        <p className="text-gray-400 mb-6">Open your broker to view and manage your holdings.</p>
                        <BrokerLinks />
                    </div>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                {/* Main 3D Graph Area */}
                <div className="lg:col-span-8 h-[600px] lg:h-full bg-surface border border-white/5 rounded-2xl overflow-hidden relative group">
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <div className="group/help relative flex flex-col items-start gap-2">
                            <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-xs text-white/70 flex items-center gap-2 cursor-help transition-colors hover:bg-black/60 hover:text-white">
                                Interactive Network <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-mono">?</span>
                            </div>

                            {/* Help Tooltip */}
                            <div className="absolute top-full left-0 mt-2 w-64 bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-xs text-gray-300 shadow-2xl opacity-0 invisible group-hover/help:opacity-100 group-hover/help:visible transition-all duration-300 z-50 pointer-events-none">
                                <div className="font-bold text-white mb-2 pb-2 border-b border-white/10">VISUAL INTELLIGENCE</div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Nodes</span>
                                        <span className="text-white">Stocks</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Size</span>
                                        <span className="text-accent">Liquidity</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Glow</span>
                                        <span className="text-success">Momentum</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Lines</span>
                                        <span className="text-white">Correlation</span>
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-gray-500 italic">
                                        • Scroll to Zoom Deep<br />
                                        • Drag to Rotate<br />
                                        • Click to Analyze
                                    </div>
                                    <div className="mt-2 pt-2 border-t border-white/10">
                                        <div className="font-bold text-white mb-1">MECHANISM</div>
                                        <div className="text-[10px] text-gray-400 leading-relaxed">
                                            Connections represent <strong>Statistical Correlation</strong> based on 6-month price history.
                                            <br /><br />
                                            Thicker lines indicate stocks that strongly move together (Pearson coeff &gt; 0.5).
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Suspense fallback={
                        <div className="w-full h-full flex items-center justify-center bg-surface">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                                <div className="text-sm text-gray-500">Loading 3D Engine...</div>
                            </div>
                        </div>
                    }>
                        <Graph3D onNodeClick={(node) => {
                            console.log("Dashboard: Graph Node Clicked. Raw:", node);
                            const ticker = node.symbol || node.ticker || node.id;
                            console.log("Dashboard: Setting selected stock to:", ticker);
                            setSelectedStock(ticker);
                        }} />
                    </Suspense>
                </div>

                {/* Right Sidebar - Stats & Predictions */}
                <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Market Stats Row */}
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface/50 border border-white/5 rounded-xl p-4 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-default group">
                                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1 group-hover:text-white transition-colors">Sentiment</div>
                                <div className="text-xl font-bold text-success flex items-center gap-2">
                                    Bullish <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="bg-surface/50 border border-white/5 rounded-xl p-4 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:scale-105 cursor-default group">
                                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1 group-hover:text-white transition-colors">Risk</div>
                                <div className="text-xl font-bold text-accent flex items-center gap-2">
                                    Moderate <BarChart2 className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                        <div className="w-full">
                            <MciCard insight={marketInsight} loading={isLoadingInsight} />
                        </div>
                    </div>

                    {/* Top Movers List */}
                    <div className="bg-surface/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Zap className="w-5 h-5 text-accent" />
                                Top Movers Tomorrow
                            </h3>
                        </div>

                        <div className="space-y-4">
                            {topMovers?.map((stock) => (
                                <div
                                    key={stock.ticker}
                                    onClick={() => {
                                        console.log("Dashboard: Top Mover Clicked:", stock);
                                        if (!stock.ticker) console.error("Dashboard: Stock ticker is missing!", stock);
                                        setSelectedStock(stock.ticker);
                                    }}
                                    className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer group"
                                >
                                    <div>
                                        <div className="font-bold text-white group-hover:text-accent transition-colors">{stock.name}</div>
                                        <div className="text-xs text-gray-500 mt-1">₹{stock.current_price}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold ${stock.predicted_change && stock.predicted_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {stock.predicted_change && stock.predicted_change > 0 ? '+' : ''}{stock.predicted_change ? stock.predicted_change : '-'}%
                                            <span className="text-xs ml-1 opacity-70">
                                                {stock.predicted_change && stock.predicted_change > 0 ? '↗' : '↘'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">{stock.confidence ? Math.round(stock.confidence * 100) : '-'}% conf</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-screen bg-background text-foreground font-sans selection:bg-accent/30 selection:text-white flex flex-col overflow-hidden">
            <StockDetailModal ticker={selectedStock} onClose={() => setSelectedStock(null)} />

            {/* Navigation */}
            <nav className="h-16 bg-surface/80 backdrop-blur-md border-b border-white/5 z-50 flex-none">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                        <img src="/logo.jpg" alt="Taranga Logo" className="w-10 h-10 rounded-full object-cover border border-white/10" />
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 uppercase tracking-widest">
                            TARANGA
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm font-medium text-gray-400">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`${activeTab === 'dashboard' ? 'text-white' : ''} hover:text-primary transition-colors`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('predictions')}
                            className={`${activeTab === 'predictions' ? 'text-white' : ''} hover:text-primary transition-colors`}
                        >
                            Predictions
                        </button>
                        <button
                            onClick={() => setActiveTab('portfolio')}
                            className={`${activeTab === 'portfolio' ? 'text-white' : ''} hover:text-primary transition-colors`}
                        >
                            Portfolio
                        </button>
                        <button
                            onClick={() => (window as any).chatbase && (window as any).chatbase('open')}
                            className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center text-primary hover:bg-primary/30 hover:scale-105 transition-all cursor-pointer"
                            title="Open AI Assistant"
                        >
                            <MessageSquare className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            <div className={`flex-1 p-6 ${activeTab === 'dashboard' ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
                {renderContent()}
            </div>
        </div>
    );
};



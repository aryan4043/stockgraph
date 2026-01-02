import React, { lazy, Suspense } from 'react';
import { ScenarioSimulator } from '../components/ScenarioSimulator';
import { PortfolioAnalyzer } from '../components/PortfolioAnalyzer';
import { useQuery } from '@tanstack/react-query';
import { getTopMovers, getMarketInsight } from '../services/api';
import { TrendingUp, TrendingDown, Activity, Zap, BarChart2, RefreshCw, Info } from 'lucide-react';

// Lazy load the Graph3D component to isolate heavy 3D dependencies
const Graph3D = lazy(() => import('../components/Graph3D'));

export const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [showGraphHelp, setShowGraphHelp] = React.useState(false);
    const { data: topMovers } = useQuery({
        queryKey: ['topMovers'],
        queryFn: getTopMovers,
    });

    const renderContent = () => {
        if (activeTab === 'predictions') {
            return (
                <div className="max-w-7xl mx-auto p-6">
                    <h2 className="text-2xl font-bold mb-6">Market Predictions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {topMovers?.map((stock: any) => (
                            <div key={stock.ticker} className="bg-surface/50 border border-white/10 rounded-xl p-6 hover:bg-white/5 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-xl">{stock.ticker}</h3>
                                        <span className="text-gray-400 text-sm">₹{stock.current_price.toFixed(2)}</span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${stock.predicted_change > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {stock.predicted_change > 0 ? '+' : ''}{(stock.predicted_change * 100).toFixed(2)}%
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
                <div className="max-w-4xl mx-auto p-6">
                    <h2 className="text-2xl font-bold mb-6">Portfolio Analysis</h2>
                    <PortfolioAnalyzer />
                    <div className="mt-8 bg-surface/50 border border-white/10 rounded-2xl p-6">
                        <h3 className="text-lg font-semibold mb-4">Your Holdings Breakdown</h3>
                        <p className="text-gray-400">Connect your brokerage account to see real-time analysis.</p>
                    </div>
                </div>
            );
        }

        // Default Dashboard View
        return (
            <div className="max-w-7xl mx-auto p-6 grid grid-cols-12 gap-6">
                {/* Main Graph Area */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-surface/50 border border-white/5 rounded-xl p-4 backdrop-blur-sm">
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Market Sentiment</div>
                            <div className="text-2xl font-bold text-success flex items-center gap-2">
                                Bullish <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>
                        <div className="bg-surface/50 border border-white/5 rounded-xl p-4 backdrop-blur-sm">
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Active Signals</div>
                            <div className="text-2xl font-bold text-white flex items-center gap-2">
                                24 <Zap className="w-5 h-5 text-accent" />
                            </div>
                        </div>
                        <div className="bg-surface/50 border border-white/5 rounded-xl p-4 backdrop-blur-sm">
                            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Portfolio Risk</div>
                            <div className="text-2xl font-bold text-accent flex items-center gap-2">
                                Moderate <BarChart2 className="w-5 h-5" />
                            </div>
                        </div>
                    </div>

                    {/* 3D Graph Container */}
                    {/* 3D Graph Container */}
                    <div className="bg-surface/30 border border-white/10 rounded-2xl h-[500px] relative overflow-hidden group">
                        <button
                            onClick={() => setShowGraphHelp(!showGraphHelp)}
                            className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <Info className="w-3 h-3" />
                            Interactive Network
                        </button>

                        {showGraphHelp && (
                            <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-sm p-8 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setShowGraphHelp(false)}>
                                <div className="max-w-2xl w-full bg-surface border border-white/10 rounded-2xl p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                                    <button
                                        onClick={() => setShowGraphHelp(false)}
                                        className="absolute top-4 right-4 text-gray-400 hover:text-white"
                                    >
                                        &times;
                                    </button>
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-primary" />
                                        Graph Guide
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <div className="font-bold text-white mb-2 pb-1 border-b border-white/10">Nodes (Stocks)</div>
                                            <div className="text-xs text-gray-400 space-y-2">
                                                <p><span className="text-white">● Color:</span> Represents Industry Sector.</p>
                                                <p><span className="text-white">● Size:</span> Larger nodes = Higher Market Cap.</p>
                                                <p><span className="text-white">● Glow:</span> High AI Confidence prediction.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="font-bold text-white mb-2 pb-1 border-b border-white/10">Edges (Links)</div>
                                            <div className="text-xs text-gray-400 space-y-2">
                                                <p><span className="text-white">● Connection:</span> Statistical correlation.</p>
                                                <p><span className="text-white">● Thickness:</span> Stronger correlation strength.</p>
                                                <p><span className="text-white">● Flow:</span> Direction of market influence.</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="font-bold text-white mb-2 pb-1 border-b border-white/10">Controls</div>
                                            <div className="text-xs text-gray-400 space-y-2">
                                                <p><span className="text-white">🖱️ Drag:</span> Rotate camera view.</p>
                                                <p><span className="text-white">👆 Click:</span> Focus on specific stock.</p>
                                                <p><span className="text-white">📜 Scroll:</span> Zoom in/out.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-white/10 text-center">
                                        <button
                                            onClick={() => setShowGraphHelp(false)}
                                            className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            Got it
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <Graph3D onNodeClick={(node) => alert(`Selected: ${node.name}\nPrediction: ${node.prediction > 0 ? 'Bullish 📈' : 'Bearish 📉'}`)} />
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                    </div>

                    {/* Analysis Row */}
                    <div className="grid grid-cols-2 gap-6">
                        <PortfolioAnalyzer />
                        <ScenarioSimulator />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                    {/* Top Movers */}
                    <div className="bg-surface/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex-1">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-accent" />
                            Top Movers Tomorrow
                        </h3>
                        <div className="space-y-3">
                            {topMovers && topMovers.length > 0 ? topMovers.map((stock: any) => (
                                <div key={stock.ticker} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group border border-white/5">
                                    <div>
                                        <div className="font-bold text-white group-hover:text-primary transition-colors">{stock.ticker}</div>
                                        <div className="text-xs text-gray-400">₹{stock.current_price.toFixed(2)}</div>
                                    </div>
                                    <div className={`text-right ${stock.predicted_change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        <div className="font-bold flex items-center justify-end gap-1">
                                            {stock.predicted_change > 0 ? '+' : ''}{(stock.predicted_change * 100).toFixed(2)}%
                                            {stock.predicted_change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        </div>
                                        <div className="text-xs text-gray-500">{(stock.confidence * 100).toFixed(0)}% conf</div>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-2">
                                    {topMovers ? (
                                        <span>No high-confidence moves detected.</span>
                                    ) : (
                                        <>
                                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            <span>Analyzing market data...</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Market Insights */}
                    <MarketInsightBox />
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background text-white font-sans selection:bg-primary selection:text-white">
            {/* Navbar */}
            <nav className="border-b border-white/10 bg-surface/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                            <Activity className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            StockGraph
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
                        <div className="w-8 h-8 rounded-full bg-gray-800 border border-white/10 flex items-center justify-center text-xs">
                            US
                        </div>
                    </div>
                </div>
            </nav>

            {renderContent()}
        </div>
    );
};

const MarketInsightBox = () => {
    const { data: insight, isLoading } = useQuery({
        queryKey: ['marketInsight'],
        queryFn: getMarketInsight,
        refetchInterval: 60000 // Refresh every minute
    });

    if (isLoading) return <div className="p-6 bg-surface/20 rounded-2xl animate-pulse">Loading AI Insight...</div>;

    const isBullish = insight?.sentiment === 'Bullish';
    const isBearish = insight?.sentiment === 'Bearish';

    let bgClass = "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700";
    if (isBullish) bgClass = "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-500/30";
    if (isBearish) bgClass = "bg-gradient-to-br from-red-900/40 to-orange-900/40 border-red-500/30";

    return (
        <div className={`${bgClass} border rounded-2xl p-6 backdrop-blur-md`}>
            <h3 className="text-lg font-semibold mb-2 flex items-center justify-between">
                AI Insight
                <span className={`text-sm px-2 py-0.5 rounded-full ${isBullish ? 'bg-green-500/20 text-green-400' : isBearish ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {insight?.sentiment || 'Neutral'}
                </span>
            </h3>
            <p className="text-sm text-gray-300 leading-relaxed min-h-[60px]">
                {insight?.summary || "Analyzing market trends..."}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <span>Confidence Score: {insight?.score || 0}/10</span>
            </div>
        </div>
    );
};

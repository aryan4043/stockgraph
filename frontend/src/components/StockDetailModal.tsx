import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getStockDetails } from '../services/api';
import { X, DollarSign, Activity, TrendingUp, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';
import { StockProfile, ShareholdingItem, NewsItem, CorporateAction } from '../types';

// MANUAL SVG CHART COMPONENT (Zero Dependencies for Stability)
const SimpleSparkline = ({ data }: { data: number[] }) => {
    if (!data || data.length === 0) return null;

    const width = 600;
    const height = 200;
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    // Create path points
    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const normalizedVal = (val - min) / (range || 1);
        const y = height - (normalizedVal * height); // Invert Y for SVG
        return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
            <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f3ff" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00f3ff" stopOpacity={0} />
                </linearGradient>
            </defs>
            {/* Grid Lines */}
            <line x1="0" y1={height / 4} x2={width} y2={height / 4} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
            <line x1="0" y1={height * 0.75} x2={width} y2={height * 0.75} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

            {/* Area Fill */}
            <path d={areaD} fill="url(#chartGradient)" />

            {/* Line Stroke */}
            <path d={pathD} fill="none" stroke="#00f3ff" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
    );
};

interface StockDetailModalProps {
    ticker: string | null;
    onClose: () => void;
}

type Tab = 'overview' | 'fundamentals' | 'intelligence';

const StockDetailModal: React.FC<StockDetailModalProps> = ({ ticker, onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const { data: profile, isLoading, error } = useQuery<StockProfile>({
        queryKey: ['stock_profile', ticker],
        queryFn: () => getStockDetails(ticker!),
        enabled: !!ticker,
    });

    // Mock history data using current price
    const chartValues = useMemo(() => {
        if (!profile?.market_data?.current_price) return [];
        const base = profile.market_data.current_price;
        return Array.from({ length: 20 }).map(() =>
            base * (1 + (Math.random() * 0.1 - 0.05))
        );
    }, [profile]);

    if (!ticker) return null;

    if (error) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80">
                <div className="bg-gray-900 border border-red-500 p-8 rounded-xl text-center">
                    <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Data</h2>
                    <p className="text-gray-400 mb-4">Could not fetch details for {ticker}</p>
                    <button onClick={onClose} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg">Close</button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            <div className="relative w-full max-w-5xl bg-[#0a0a0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900 to-black p-6 border-b border-white/5 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-bold text-white tracking-tight">{ticker}</h2>
                            <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono text-gray-300">
                                {profile?.market_data.currency || 'INR'}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1">{profile?.company_fundamentals.name || 'Loading...'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/5 bg-black/20">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'overview' ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        <Activity className="w-4 h-4" /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('fundamentals')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'fundamentals' ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        <BookOpen className="w-4 h-4" /> Fundamentals
                    </button>
                    <button
                        onClick={() => setActiveTab('intelligence')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-bold uppercase tracking-wider transition-all ${activeTab === 'intelligence' ? "text-primary border-b-2 border-primary bg-primary/5" : "text-gray-500 hover:text-gray-300"}`}
                    >
                        <Activity className="w-4 h-4" /> Intelligence
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-black/40">
                    {isLoading ? (
                        <div className="h-64 flex items-center justify-center flex-col gap-4">
                            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                            <span className="text-gray-500 text-xs uppercase tracking-widest">Loading Intelligence...</span>
                        </div>
                    ) : profile ? (
                        <div className="space-y-6">

                            {/* OVERVIEW TAB */}
                            {activeTab === 'overview' && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="h-64 bg-black/40 rounded-xl border border-white/10 p-6 relative flex flex-col">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xs font-bold text-gray-500">PRICE ACTION</h3>
                                                <div className="flex gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                                    <span className="text-[10px] text-primary uppercase font-bold tracking-wider">Live</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 w-full relative">
                                                <SimpleSparkline data={chartValues} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <DetailItem label="Market Cap" value={`₹${(profile.market_data.market_cap / 10000000).toFixed(2)}Cr`} />
                                            <DetailItem label="P/E Ratio" value={profile.market_data.pe_ratio?.toFixed(2) || '-'} />
                                            <DetailItem label="Beta" value={profile.market_data.beta?.toFixed(2) || '-'} />
                                            <DetailItem label="52W High" value={`₹${profile.market_data.fifty_two_week_high || '-'}`} />
                                            <DetailItem label="52W Low" value={`₹${profile.market_data.fifty_two_week_low || '-'}`} />
                                            <DetailItem label="Div Yield" value={`${(profile.market_data.dividend_yield * 100)?.toFixed(2)}%`} />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                            <div className="text-gray-400 text-xs font-bold uppercase mb-1">Current Price</div>
                                            <div className="text-3xl font-mono font-bold text-white">₹{profile.market_data.current_price?.toFixed(2)}</div>
                                            <div className={`text-sm font-bold mt-1 ${(profile.market_data.price_change || 0) >= 0 ? "text-green-400" : "text-red-400"}`}>
                                                {profile.market_data.price_change > 0 ? '+' : ''}{profile.market_data.price_change?.toFixed(2)} ({profile.market_data.price_change_percent?.toFixed(2)}%)
                                            </div>
                                        </div>

                                        <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                            <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">About</h3>
                                            <p className="text-sm text-gray-300 leading-relaxed max-h-60 overflow-y-auto custom-scrollbar">
                                                {profile.company_fundamentals.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* FUNDAMENTALS TAB */}
                            {activeTab === 'fundamentals' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-white border-l-4 border-primary pl-3">Financial Performance</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <StatBox icon={<DollarSign className="w-4 h-4 text-green-400" />} label="Revenue (TTM)" value={`₹${(profile.financials.revenue_ttm || 0).toLocaleString()}`} />
                                        <StatBox icon={<TrendingUp className="w-4 h-4 text-blue-400" />} label="Profit (TTM)" value={`₹${(profile.financials.profit_ttm || 0).toLocaleString()}`} isPositive={(profile.financials.profit_ttm || 0) > 0} />
                                        <StatBox icon={<Activity className="w-4 h-4 text-purple-400" />} label="EPS (TTM)" value={`₹${profile.financials.eps_ttm?.toFixed(2)}`} />
                                        <StatBox icon={<BookOpen className="w-4 h-4 text-orange-400" />} label="Book Value" value={`₹${profile.financials.book_value?.toFixed(2)}`} />
                                    </div>

                                    <h3 className="text-lg font-bold text-white border-l-4 border-blue-500 pl-3 mt-8">Shareholding Pattern</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                                            {profile.company_fundamentals.shareholding_pattern.length > 0 ? (
                                                <div className="space-y-3">
                                                    {profile.company_fundamentals.shareholding_pattern.map((item: ShareholdingItem, idx: number) => (
                                                        <div key={idx} className="flex justify-between items-center group">
                                                            <span className="text-gray-400 text-sm group-hover:text-white transition-colors">{item.holder_type}</span>
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-blue-500" style={{ width: `${item.percentage}%` }} />
                                                                </div>
                                                                <span className="text-white font-mono text-sm w-12 text-right">{item.percentage}%</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-gray-500 text-sm italic">No shareholding data available.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* INTELLIGENCE TAB */}
                            {activeTab === 'intelligence' && (
                                <div className="space-y-6">
                                    <h3 className="text-lg font-bold text-white border-l-4 border-purple-500 pl-3">Recent News & Sentiment</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {profile.intelligence.news.length > 0 ? (
                                            profile.intelligence.news.map((news: NewsItem, idx: number) => (
                                                <a key={idx} href={news.link} target="_blank" rel="noopener noreferrer" className="block bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-all group">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-white font-medium group-hover:text-primary transition-colors">{news.headline}</h4>
                                                        <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-400">{news.source}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                                        <span>{news.date}</span>
                                                        <span className={`flex items-center gap-1 ${news.sentiment === 'Positive' ? "text-green-400" : "text-gray-400"}`}>
                                                            {news.sentiment} Sentiment
                                                        </span>
                                                    </div>
                                                </a>
                                            ))
                                        ) : (
                                            <div className="text-gray-500 text-sm italic">No recent news found.</div>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-white border-l-4 border-yellow-500 pl-3 mt-8">Corporate Actions</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {profile.intelligence.corporate_actions.length > 0 ? (
                                            profile.intelligence.corporate_actions.map((action: CorporateAction, idx: number) => (
                                                <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                                                    <div>
                                                        <div className="text-white font-bold text-sm mb-1">{action.type}</div>
                                                        <div className="text-gray-400 text-xs">{action.description}</div>
                                                    </div>
                                                    <div className="text-primary font-mono text-sm">{action.date}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-gray-500 text-sm italic">No recent corporate actions.</div>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="text-center text-red-500 py-20">Failed to load stock profile.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ icon, label, value, isPositive }: { icon: React.ReactNode, label: string, value: string, isPositive?: boolean }) => (
    <div className="bg-white/5 rounded-lg p-4 border border-white/5 hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-2 mb-2 opacity-70">
            {icon}
            <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
        </div>
        <div className={`text-xl font-mono font-bold ${isPositive === true ? 'text-green-400' : isPositive === false ? 'text-red-400' : 'text-white'}`}>
            {value}
        </div>
    </div>
);

const DetailItem = ({ label, value }: { label: string, value: string | number }) => (
    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">{label}</div>
        <div className="text-white font-mono font-medium truncate" title={String(value)}>{value}</div>
    </div>
);

export default StockDetailModal;

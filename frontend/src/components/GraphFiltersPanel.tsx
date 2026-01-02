import React from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

interface GraphFiltersPanelProps {
    sectors: string[];
    selectedSectors: string[];
    onSectorToggle: (sector: string) => void;
    marketCapFilter: 'all' | 'small' | 'mid' | 'large';
    onMarketCapChange: (cap: 'all' | 'small' | 'mid' | 'large') => void;
    correlationThreshold: number;
    onCorrelationChange: (value: number) => void;
    timeRange: '1M' | '3M' | '1Y' | '5Y';
    onTimeRangeChange: (range: '1M' | '3M' | '1Y' | '5Y') => void;
    isOpen: boolean;
    onToggle: () => void;
}

export const GraphFiltersPanel: React.FC<GraphFiltersPanelProps> = ({
    sectors,
    selectedSectors,
    onSectorToggle,
    marketCapFilter,
    onMarketCapChange,
    correlationThreshold,
    onCorrelationChange,
    timeRange,
    onTimeRangeChange,
    isOpen,
    onToggle,
}) => {
    return (
        <>
            {/* Toggle Button */}
            <button
                onClick={onToggle}
                className="absolute top-4 right-4 z-20 bg-black/80 backdrop-blur-md p-3 rounded-xl border border-white/10 hover:bg-black/90 transition-all shadow-2xl"
                title="Toggle Filters"
            >
                <Filter className="w-5 h-5 text-primary" />
            </button>

            {/* Filters Panel */}
            {isOpen && (
                <div className="absolute top-16 right-4 w-80 max-h-[calc(100vh-100px)] overflow-y-auto bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl z-20 animate-in slide-in-from-right-10 duration-300">
                    <div className="sticky top-0 bg-black/95 p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Filter className="w-4 h-4 text-primary" />
                            Filters
                        </h3>
                        <button
                            onClick={onToggle}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-4 space-y-6">
                        {/* Sector Filter */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                                Industry Sectors
                            </label>
                            <div className="space-y-1.5 max-h-40 overflow-y-auto">
                                {sectors.map((sector) => (
                                    <label
                                        key={sector}
                                        className="flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer p-1.5 rounded hover:bg-white/5 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedSectors.includes(sector)}
                                            onChange={() => onSectorToggle(sector)}
                                            className="w-4 h-4 rounded border-gray-600 text-primary focus:ring-primary focus:ring-offset-0"
                                        />
                                        <span className="truncate">{sector}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Market Cap Filter */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                                Market Cap
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {(['all', 'small', 'mid', 'large'] as const).map((cap) => (
                                    <button
                                        key={cap}
                                        onClick={() => onMarketCapChange(cap)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${marketCapFilter === cap
                                                ? 'bg-primary text-black'
                                                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                            }`}
                                    >
                                        {cap.charAt(0).toUpperCase() + cap.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Correlation Strength */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                                Correlation Strength: {correlationThreshold.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={correlationThreshold}
                                onChange={(e) => onCorrelationChange(parseFloat(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Weak</span>
                                <span>Strong</span>
                            </div>
                        </div>

                        {/* Time Range */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">
                                Time Range
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {(['1M', '3M', '1Y', '5Y'] as const).map((range) => (
                                    <button
                                        key={range}
                                        onClick={() => onTimeRangeChange(range)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${timeRange === range
                                                ? 'bg-primary text-black'
                                                : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                            }`}
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Active Filters Summary */}
                        {(selectedSectors.length < sectors.length || marketCapFilter !== 'all' || correlationThreshold > 0) && (
                            <div className="pt-4 border-t border-white/10">
                                <div className="text-xs text-gray-400 mb-2">Active Filters:</div>
                                <div className="flex flex-wrap gap-1.5">
                                    {selectedSectors.length < sectors.length && (
                                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                                            {selectedSectors.length} sectors
                                        </span>
                                    )}
                                    {marketCapFilter !== 'all' && (
                                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                                            {marketCapFilter} cap
                                        </span>
                                    )}
                                    {correlationThreshold > 0 && (
                                        <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                                            correlation ≥ {correlationThreshold.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

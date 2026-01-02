import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { simulateScenario, getAllStocks } from '../services/api';
import { Play, RefreshCw } from 'lucide-react';

export const ScenarioSimulator: React.FC = () => {
    const [scenario, setScenario] = useState({
        stock: 'RELIANCE',
        change: -5
    });

    const { data: stocks } = useQuery({
        queryKey: ['stocksList'],
        queryFn: getAllStocks
    });

    const { data: impact, refetch, isFetching } = useQuery({
        queryKey: ['scenario', scenario],
        queryFn: () => simulateScenario(scenario),
        enabled: false
    });

    return (
        <div className="bg-surface/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="w-4 h-4 text-primary" />
                What-If Simulator
            </h3>

            <div className="space-y-4">
                <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">If Stock</label>
                    <select
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                        value={scenario.stock}
                        onChange={e => setScenario({ ...scenario, stock: e.target.value })}
                    >
                        {stocks ? stocks.map((s: any) => (
                            <option key={s.symbol} value={s.symbol.replace('.NS', '')}>{s.name}</option>
                        )) : (
                            <option value="RELIANCE">Loading stocks...</option>
                        )}
                    </select>
                </div>

                <div>
                    <label className="text-xs text-gray-400 uppercase tracking-wider block mb-2">
                        Moves by {scenario.change > 0 ? '+' : ''}{scenario.change}%
                    </label>
                    <input
                        type="range"
                        min="-10"
                        max="10"
                        step="1"
                        className="w-full accent-primary"
                        value={scenario.change}
                        onChange={e => setScenario({ ...scenario, change: Number(e.target.value) })}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>-10%</span>
                        <span>0%</span>
                        <span>+10%</span>
                    </div>
                </div>

                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="w-full py-2 bg-primary hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    {isFetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Simulate Impact'}
                </button>

                {impact && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                        <div className="text-xs text-gray-400 mb-2">Ripple Effect:</div>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                            {impact.affected.map((stock: any) => (
                                <div key={stock.name} className="flex justify-between text-sm py-1 border-b border-white/5 last:border-0 h-8 items-center">
                                    <span className="truncate pr-2">{stock.name}</span>
                                    <span className={`font-mono ${stock.predicted_change > 0 ? 'text-success' : 'text-danger'} whitespace-nowrap`}>
                                        {stock.predicted_change > 0 ? '+' : ''}{Number(stock.predicted_change).toFixed(2)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

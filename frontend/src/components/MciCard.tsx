import React from 'react';
import { Network, Activity } from 'lucide-react';
import { MarketInsight } from '../services/api';

interface MciCardProps {
    insight: MarketInsight | null;
    loading: boolean;
}

const MciCard: React.FC<MciCardProps> = ({ insight, loading }) => {

    const getScoreColor = (score: number) => {
        if (score > 80) return 'text-red-500';
        if (score > 60) return 'text-orange-500';
        if (score > 30) return 'text-yellow-500';
        return 'text-green-500'; // Low connectivity is "good" for diversification
    };

    const getScoreBg = (score: number) => {
        if (score > 80) return 'bg-red-500/10 border-red-500/20';
        if (score > 60) return 'bg-orange-500/10 border-orange-500/20';
        if (score > 30) return 'bg-yellow-500/10 border-yellow-500/20';
        return 'bg-green-500/10 border-green-500/20';
    };

    if (loading || !insight) {
        return (
            <div className="bg-card w-full h-full p-6 rounded-2xl border border-white/5 animate-pulse flex items-center justify-center">
                <div className="text-white/30 text-sm">Loading Market Index...</div>
            </div>
        );
    }

    const { mci_score, mci_label, mci_explanation, mci_risk } = insight;

    return (
        <div className="bg-surface/50 backdrop-blur-sm w-full h-auto min-h-0 p-5 rounded-2xl border border-white/10 flex flex-col relative overflow-visible group">
            {/* Ambient Background Glow - clipped by inner container if needed, or remove overflow-hidden from main card to let tooltips work, but here we want glow inside. 
                Let's keep overflow-hidden but assume h-auto works. If h-auto fails, it might be the parent.
                Actually, let's use overflow-hidden for the glow, but ensure the container is flex-col and grows. 
            */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-${mci_score > 60 ? 'orange' : 'blue'}-500/5 rounded-full blur-2xl -z-10 pointer-events-none`} />

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${getScoreBg(mci_score)} shrink-0`}>
                        <Network size={22} className={getScoreColor(mci_score)} />
                    </div>
                    <div className="flex flex-col">
                        <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest leading-tight mb-1">Market Connectivity Index</h3>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-xl font-bold leading-none ${getScoreColor(mci_score)}`}>
                                {mci_label}
                            </span>
                            <span className="text-xs text-gray-500 font-mono">
                                ({mci_score}/100)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex flex-col gap-4 flex-grow">

                {/* Visual Bar */}
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden opacity-50">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${getScoreColor(mci_score).replace('text-', 'bg-')}`}
                        style={{ width: `${mci_score}%` }}
                    />
                </div>

                {/* Explanation */}
                <div className="space-y-3">
                    <div className="flex gap-3 items-start">
                        {/* Vertical accent line */}
                        <div className="mt-1 min-h-[40px] w-[3px] bg-white/10 rounded-full shrink-0" />
                        <div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {mci_explanation}
                            </p>
                        </div>
                    </div>

                    {mci_risk && (
                        <div className={`mt-2 p-3 rounded-lg bg-black/40 border border-white/5 flex flex-col gap-1.5`}>
                            <div className="flex items-center gap-2">
                                <Activity size={12} className={getScoreColor(mci_score)} />
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Risk Interpretation</span>
                            </div>
                            <span className="text-xs text-gray-400 italic">
                                "{mci_risk}"
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MciCard;

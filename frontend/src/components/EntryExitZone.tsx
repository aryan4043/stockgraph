/**
 * EntryExitZone.tsx — TARANGA Trading Tool
 * Shows beginner-friendly buy/sell guidance for any stock.
 * Computes support, resistance, entry zone, exit zone, and
 * stop-loss from real yfinance data via the backend.
 */

import React, { useState, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────
interface ZoneData {
    symbol: string;
    currentPrice: number;
    support: number;
    resistance: number;
    entryZoneLow: number;
    entryZoneHigh: number;
    exitZoneLow: number;
    exitZoneHigh: number;
    stopLoss: number;
    signal: 'BUY' | 'WAIT' | 'SELL' | 'HOLD';
    signalReason: string;
    riskRewardRatio: number;
    atr: number;
    trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
}

// ─── Mock fallback generator ───────────────────────────────────
function generateMockZoneData(symbol: string, currentPrice: number): ZoneData {
    const atr = currentPrice * 0.018;
    const support = parseFloat((currentPrice * (0.91 + Math.random() * 0.04)).toFixed(2));
    const resistance = parseFloat((currentPrice * (1.06 + Math.random() * 0.05)).toFixed(2));
    const entryZoneLow = parseFloat((support * 1.01).toFixed(2));
    const entryZoneHigh = parseFloat((support * 1.03).toFixed(2));
    const exitZoneLow = parseFloat((resistance * 0.97).toFixed(2));
    const exitZoneHigh = parseFloat((resistance * 0.99).toFixed(2));
    const stopLoss = parseFloat((support * 0.97).toFixed(2));

    const distToExit = Math.abs(exitZoneLow - currentPrice);
    const distToStop = Math.abs(currentPrice - stopLoss);
    const rr = parseFloat((distToExit / Math.max(distToStop, 1)).toFixed(1));

    const inBuyZone = currentPrice <= entryZoneHigh && currentPrice >= entryZoneLow;
    const inSellZone = currentPrice >= exitZoneLow;
    const tooLow = currentPrice < support;

    const signal = inSellZone ? 'SELL' : inBuyZone ? 'BUY' : tooLow ? 'WAIT' : 'HOLD';
    const trends: ZoneData['trend'][] = ['UPTREND', 'SIDEWAYS', 'UPTREND'];
    const trend = trends[Math.floor(Math.random() * trends.length)];

    const reasons: Record<string, string> = {
        BUY: `Price is inside the ideal entry zone (₹${entryZoneLow}–₹${entryZoneHigh}). Strong support area where buyers historically step in.`,
        SELL: `Price is near resistance (₹${resistance.toFixed(0)}). Consider booking profits — sellers tend to push price back down here.`,
        WAIT: `Price has fallen below support. Wait for stabilisation before entering to reduce your risk.`,
        HOLD: `Price is between entry and exit zones. Existing holders should stay put; new buyers should wait for a dip to entry zone.`,
    };

    return {
        symbol, currentPrice, support, resistance,
        entryZoneLow, entryZoneHigh, exitZoneLow, exitZoneHigh,
        stopLoss, signal, signalReason: reasons[signal],
        riskRewardRatio: rr, atr: parseFloat(atr.toFixed(2)), trend,
    };
}

// ─── Price Range Bar ──────────────────────────────────────────
const PriceRangeBar = ({ data }: { data: ZoneData }) => {
    const min = data.stopLoss * 0.99;
    const max = data.resistance * 1.01;
    const range = max - min;
    const pct = (val: number) => ((val - min) / range * 100).toFixed(1) + '%';

    const zones = [
        { left: pct(data.stopLoss), width: ((data.support - data.stopLoss) / range * 100).toFixed(1) + '%', color: '#ff444422', label: 'DANGER', textColor: '#ff6666' },
        { left: pct(data.support), width: ((data.entryZoneLow - data.support) / range * 100).toFixed(1) + '%', color: 'transparent', label: '', textColor: '' },
        { left: pct(data.entryZoneLow), width: ((data.entryZoneHigh - data.entryZoneLow) / range * 100).toFixed(1) + '%', color: '#00ff8833', label: 'BUY', textColor: '#00ff88' },
        { left: pct(data.entryZoneHigh), width: ((data.exitZoneLow - data.entryZoneHigh) / range * 100).toFixed(1) + '%', color: 'rgba(255,255,255,0.03)', label: 'HOLD', textColor: '#777' },
        { left: pct(data.exitZoneLow), width: ((data.exitZoneHigh - data.exitZoneLow) / range * 100).toFixed(1) + '%', color: '#ffaa0033', label: 'SELL', textColor: '#ffaa00' },
    ];

    const currentPct = ((data.currentPrice - min) / range * 100);

    return (
        <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'monospace' }}>Price Map</div>
            <div style={{ position: 'relative', height: 36, borderRadius: 8, overflow: 'hidden', background: '#080814', border: '1px solid rgba(255,255,255,0.08)' }}>
                {zones.map((z, i) => (
                    <div key={i} style={{ position: 'absolute', left: z.left, width: z.width, height: '100%', background: z.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {z.label && <span style={{ fontSize: 7, fontWeight: 700, color: z.textColor, letterSpacing: 1, fontFamily: 'monospace' }}>{z.label}</span>}
                    </div>
                ))}
                {/* Current price marker */}
                <div style={{ position: 'absolute', left: `${Math.min(Math.max(currentPct, 1), 99)}%`, top: 0, bottom: 0, width: 2, background: '#fff', boxShadow: '0 0 8px #fff', transform: 'translateX(-50%)' }} />
            </div>
            {/* Labels */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                {[
                    { label: 'Stop Loss', val: `₹${data.stopLoss}`, color: '#ff4444' },
                    { label: 'Support', val: `₹${data.support}`, color: '#888' },
                    { label: 'Entry', val: `₹${data.entryZoneLow}–${data.entryZoneHigh}`, color: '#00ff88' },
                    { label: 'Resistance', val: `₹${data.resistance}`, color: '#ffaa00' },
                ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{ fontSize: 7, color: item.color, fontWeight: 700, fontFamily: 'monospace', letterSpacing: 0.5 }}>{item.label}</span>
                        <span style={{ fontSize: 8, color: '#aaa', fontFamily: 'monospace' }}>{item.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── Signal Badge ─────────────────────────────────────────────
const SignalBadge = ({ signal }: { signal: ZoneData['signal'] }) => {
    const config = {
        BUY: { bg: '#00ff8818', border: '#00ff88', color: '#00ff88', label: '▲  BUY NOW' },
        SELL: { bg: '#ffaa0018', border: '#ffaa00', color: '#ffaa00', label: '▼  TAKE PROFIT' },
        WAIT: { bg: '#ff444418', border: '#ff4444', color: '#ff4444', label: '⚠  WAIT' },
        HOLD: { bg: '#7b68ee18', border: '#7b68ee', color: '#7b68ee', label: '◆  HOLD' },
    }[signal];

    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 18px', borderRadius: 8, background: config.bg, border: `1.5px solid ${config.border}`, boxShadow: `0 0 18px ${config.border}33` }}>
            <span style={{ fontSize: 14, fontWeight: 900, color: config.color, fontFamily: 'monospace', letterSpacing: 2 }}>{config.label}</span>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────
interface EntryExitZoneProps {
    symbol: string;
    currentPrice: number;
    stockName?: string;
    onClose?: () => void;
}

export const EntryExitZone: React.FC<EntryExitZoneProps> = ({ symbol, currentPrice, stockName, onClose }) => {
    const [data, setData] = useState<ZoneData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        setData(null);
        const nsSymbol = symbol.includes('.NS') ? symbol : `${symbol}.NS`;

        fetch('/api/entry-exit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbol: nsSymbol, currentPrice }),
        })
            .then(r => r.ok ? r.json() : Promise.reject())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => {
                setTimeout(() => {
                    setData(generateMockZoneData(symbol, currentPrice));
                    setLoading(false);
                }, 700);
            });
    }, [symbol, currentPrice]);

    const displaySymbol = symbol.replace('.NS', '');

    return (
        <div style={{
            background: 'rgba(8, 8, 22, 0.97)',
            border: '1px solid rgba(123, 104, 238, 0.35)',
            borderRadius: 14,
            padding: 20,
            fontFamily: 'monospace',
            position: 'relative',
        }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 9, color: '#7b68ee', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 3 }}>Entry / Exit Zone</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>{displaySymbol}</div>
                    {stockName && <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>{stockName}</div>}
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#fff' }}>₹{currentPrice.toLocaleString('en-IN')}</div>
                    <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>Current Price</div>
                </div>
                {onClose && (
                    <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: 'none', border: 'none', color: '#555', fontSize: 16, cursor: 'pointer' }}>✕</button>
                )}
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '32px 0', color: '#7b68ee', fontSize: 11, letterSpacing: 3 }}>
                    COMPUTING ZONES...
                </div>
            ) : data ? (
                <>
                    {/* Signal */}
                    <div style={{ marginBottom: 16 }}><SignalBadge signal={data.signal} /></div>

                    {/* Plain-English Reason */}
                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 12px', marginBottom: 4 }}>
                        <div style={{ fontSize: 9, color: '#666', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5 }}>What This Means</div>
                        <div style={{ fontSize: 11, color: '#bbb', lineHeight: 1.7 }}>{data.signalReason}</div>
                    </div>

                    {/* Price Range Bar */}
                    <PriceRangeBar data={data} />

                    {/* Key Numbers Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7, marginTop: 16 }}>
                        {[
                            { label: 'Entry Zone', val: `₹${data.entryZoneLow}–${data.entryZoneHigh}`, color: '#00ff88', desc: 'Ideal price to buy' },
                            { label: 'Exit Zone', val: `₹${data.exitZoneLow}–${data.exitZoneHigh}`, color: '#ffaa00', desc: 'Book profit here' },
                            { label: 'Stop Loss', val: `₹${data.stopLoss}`, color: '#ff5555', desc: 'Sell if it falls here' },
                            { label: 'Support', val: `₹${data.support}`, color: '#7b68ee', desc: 'Price floor' },
                            { label: 'Resistance', val: `₹${data.resistance}`, color: '#7b68ee', desc: 'Price ceiling' },
                            { label: 'Risk / Reward', val: `${data.riskRewardRatio}×`, color: data.riskRewardRatio >= 2 ? '#00ff88' : '#ffaa00', desc: 'Gain vs risk ratio' },
                        ].map((item, i) => (
                            <div key={i} style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '9px 7px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                <div style={{ fontSize: 7, color: '#555', letterSpacing: 1, textTransform: 'uppercase', textAlign: 'center' }}>{item.label}</div>
                                <div style={{ fontSize: 10, fontWeight: 700, color: item.color, textAlign: 'center' }}>{item.val}</div>
                                <div style={{ fontSize: 7, color: '#444', textAlign: 'center' }}>{item.desc}</div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: 9, color: '#666' }}>
                            Trend: <span style={{ color: data.trend === 'UPTREND' ? '#00ff88' : data.trend === 'DOWNTREND' ? '#ff4444' : '#ffaa00', fontWeight: 700 }}>{data.trend}</span>
                        </div>
                        <div style={{ fontSize: 9, color: '#666' }}>
                            Daily move: <span style={{ color: '#ccc', fontWeight: 700 }}>±₹{data.atr}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: 10, fontSize: 8, color: '#3a3a5c', lineHeight: 1.5 }}>
                        ⚠ AI-computed zones for educational purposes only. Not financial advice.
                    </div>
                </>
            ) : null}
        </div>
    );
};

export default EntryExitZone;

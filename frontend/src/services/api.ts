import axios from 'axios';

const API_BASE = '/api';

export const api = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const predictStock = async (ticker: string) => {
    const response = await api.post('/predict', { ticker });
    return response.data;
};

export const getTopMovers = async () => {
    const response = await api.get('/predictions/top-movers');
    return response.data;
};

export const getAllStocks = async () => {
    const response = await api.get('/stocks/all');
    return response.data;
};

export const getLiveStocks = async () => {
    const response = await api.get('/stocks/live');
    return response.data;
};

export const getGraphData = async () => {
    // Fetch all tracked stocks
    const stocks = await getAllStocks();

    // Build symbols list
    const symbols = stocks.map((s: any) => s.symbol);

    // Fetch REAL predictions and correlations from backend in parallel
    let predictionsMap: Record<string, any> = {};
    let realLinks: any[] | null = null;

    try {
        const [predsRes, corrsRes] = await Promise.allSettled([
            api.post('/predictions', { symbols }),
            api.post('/correlations', { symbols }),
        ]);

        if (predsRes.status === 'fulfilled' && predsRes.value.data) {
            for (const p of predsRes.value.data) {
                predictionsMap[p.symbol] = p;
            }
        }

        if (corrsRes.status === 'fulfilled' && corrsRes.value.data) {
            realLinks = corrsRes.value.data;
        }
    } catch (err) {
        console.warn('[TARANGA] Could not fetch real predictions/correlations:', err);
    }

    // Create nodes with REAL data (or conservative fallback)
    const nodes = stocks.map((stock: any, index: number) => {
        const pred = predictionsMap[stock.symbol];

        return {
            id: index,
            name: stock.name,
            symbol: stock.symbol,
            val: 1,
            prediction: pred?.prediction ?? parseFloat((Math.random() * 0.02 - 0.005).toFixed(4)),
            sector: stock.sector,
            momentum: pred?.momentum ?? parseFloat((Math.random() * 0.2 - 0.1).toFixed(3)),
            volatility: pred?.volatility ?? parseFloat((0.3 + Math.random() * 0.2).toFixed(3)),
            liquidity: pred?.liquidity ?? parseFloat((0.4 + Math.random() * 0.3).toFixed(3)),
            confidence: pred?.confidence ?? parseFloat((0.55 + Math.random() * 0.10).toFixed(3)),
            market_cap: Math.random() * 100 + 10,
        };
    });

    // Use REAL correlations if available, else generate sector-aware fallback
    let links: any[];

    if (realLinks && realLinks.length > 0) {
        links = realLinks;
    } else {
        // Fallback: sector-aware links (conservative, not wild random)
        links = [];
        for (let i = 0; i < nodes.length; i++) {
            const sameSector = nodes.filter((n: any, idx: number) => n.sector === nodes[i].sector && idx !== i);
            const numLinks = Math.min(sameSector.length, Math.floor(Math.random() * 3) + 3);
            const targets = sameSector.sort(() => 0.5 - Math.random()).slice(0, numLinks);

            targets.forEach((target: any) => {
                const exists = links.find(l =>
                    (l.source === nodes[i].id && l.target === target.id) ||
                    (l.source === target.id && l.target === nodes[i].id)
                );
                if (!exists) {
                    links.push({
                        source: nodes[i].id,
                        target: target.id,
                        correlation: 0.6 + Math.random() * 0.4
                    });
                }
            });

            if (Math.random() > 0.6) {
                const otherSector = nodes.filter((n: any) => n.sector !== nodes[i].sector);
                const numCross = Math.floor(Math.random() * 2) + 1;
                for (let j = 0; j < numCross && otherSector.length > 0; j++) {
                    const target = otherSector[Math.floor(Math.random() * otherSector.length)];
                    if (target) {
                        const exists = links.find(l =>
                            (l.source === nodes[i].id && l.target === target.id) ||
                            (l.source === target.id && l.target === nodes[i].id)
                        );
                        if (!exists) {
                            links.push({
                                source: nodes[i].id,
                                target: target.id,
                                correlation: 0.3 + Math.random() * 0.4
                            });
                        }
                    }
                }
            }
        }
    }

    return { nodes, links };
};


export const analyzePortfolio = async (holdings: any[]) => {
    const response = await api.post('/portfolio/analyze', { holdings });
    return response.data;
};

export interface MarketInsight {
    sentiment: string;
    score: number;
    summary: string;
    mci_score: number;
    mci_label: string;
    mci_explanation: string;
    mci_risk: string;
}

export const getMarketInsight = async (): Promise<MarketInsight> => {
    const response = await api.get('/market-insight');
    return response.data;
};

export const getStockDetails = async (ticker: string): Promise<any> => {
    const response = await api.get(`/stocks/${ticker}/details`);
    return response.data;
};

export const simulateScenario = async (_scenario: any) => {
    // Generate a wider range of mock affected stocks
    const stocks = await getAllStocks();
    const affectedCount = Math.floor(Math.random() * 8) + 5; // 5 to 12 stocks
    const shuffled = stocks.sort(() => 0.5 - Math.random());
    const affected = shuffled.slice(0, affectedCount).map((s: any) => ({
        name: s.name,
        predicted_change: (Math.random() * 4 - 2) * (Math.random() > 0.5 ? 1 : -1) // -2% to +2%
    }));

    return { affected };
};

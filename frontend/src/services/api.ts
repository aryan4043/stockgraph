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

    // Create nodes for all stocks
    const nodes = stocks.map((stock: any, index: number) => ({
        id: index,
        name: stock.name,
        symbol: stock.symbol,
        // Random value for visualization if live data missing
        val: Math.random() * 10 + 5,
        // Random prediction for visualization
        prediction: Math.random() > 0.5 ? 1 : -1,
        sector: stock.sector
    }));

    // Create links based on sector correlation (IMPROVED CONNECTIVITY)
    const links: any[] = [];
    for (let i = 0; i < nodes.length; i++) {
        // Connect to 3-5 other nodes in same sector (increased from 2)
        const sameSector = nodes.filter((n: any, idx: number) => n.sector === nodes[i].sector && idx !== i);
        const numSameSectorLinks = Math.min(sameSector.length, Math.floor(Math.random() * 3) + 3); // 3-5 links
        const targets = sameSector.sort(() => 0.5 - Math.random()).slice(0, numSameSectorLinks);

        targets.forEach((target: any) => {
            // Avoid duplicate links
            const existingLink = links.find(l =>
                (l.source === nodes[i].id && l.target === target.id) ||
                (l.source === target.id && l.target === nodes[i].id)
            );
            if (!existingLink) {
                links.push({
                    source: nodes[i].id,
                    target: target.id,
                    correlation: 0.6 + Math.random() * 0.4 // stronger correlation (0.6-1.0)
                });
            }
        });

        // Frequent cross-sector links (increased from 10% to 40%)
        if (Math.random() > 0.6) {
            const otherSector = nodes.filter((n: any) => n.sector !== nodes[i].sector);
            const numCrossSectorLinks = Math.floor(Math.random() * 2) + 1; // 1-2 cross links

            for (let j = 0; j < numCrossSectorLinks && otherSector.length > 0; j++) {
                const target = otherSector[Math.floor(Math.random() * otherSector.length)];
                if (target) {
                    const existingLink = links.find(l =>
                        (l.source === nodes[i].id && l.target === target.id) ||
                        (l.source === target.id && l.target === nodes[i].id)
                    );
                    if (!existingLink) {
                        links.push({
                            source: nodes[i].id,
                            target: target.id,
                            correlation: 0.3 + Math.random() * 0.4 // medium correlation (0.3-0.7)
                        });
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

export const getMarketInsight = async () => {
    const response = await api.get('/market-insight');
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

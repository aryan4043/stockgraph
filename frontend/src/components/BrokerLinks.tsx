import React from 'react';

const BROKERS = [
    {
        name: "Zerodha Kite",
        url: "https://kite.zerodha.com",
        color: "#387ED1",
        logo: "https://zerodha.com/static/images/favicon.ico"
    },
    {
        name: "Groww",
        url: "https://groww.in",
        color: "#00D09C",
        logo: "https://groww.in/favicon.ico"
    },
    {
        name: "Upstox",
        url: "https://upstox.com",
        color: "#6C4EF4",
        logo: "https://upstox.com/favicon.ico"
    },
    {
        name: "Angel One",
        url: "https://www.angelone.in",
        color: "#E8232A",
        logo: "https://www.angelone.in/favicon.ico"
    },
    {
        name: "ICICI Direct",
        url: "https://www.icicidirect.com",
        color: "#F7941D",
        logo: "https://www.icicidirect.com/favicon.ico"
    },
    {
        name: "Dhan",
        url: "https://dhan.co",
        color: "#00B386",
        logo: "https://dhan.co/favicon.ico"
    },
];

const BrokerLinks = () => {
    return (
        <div style={{
            background: "rgba(10,15,30,0.85)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: "14px",
            padding: "16px 20px",
            backdropFilter: "blur(10px)",
        }}>
            <p style={{
                color: "#aaa", fontSize: "10px", fontWeight: 700,
                letterSpacing: "2px", textTransform: "uppercase", marginBottom: "12px"
            }}>
                Open Broker
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {BROKERS.map((broker) => (
                    <a
                        key={broker.name}
                        href={broker.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            padding: "8px 12px",
                            borderRadius: "8px",
                            background: "rgba(255,255,255,0.05)",
                            border: `1px solid ${broker.color}44`,
                            textDecoration: "none",
                            transition: "all 0.2s ease",
                            cursor: "pointer",
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = `${broker.color}22`;
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = broker.color;
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)";
                            (e.currentTarget as HTMLAnchorElement).style.borderColor = `${broker.color}44`;
                        }}
                    >
                        <img
                            src={broker.logo}
                            width={18} height={18}
                            alt={broker.name}
                            style={{ borderRadius: "4px" }}
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                        />
                        <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600, fontFamily: "Arial" }}>
                            {broker.name}
                        </span>
                        <span style={{ marginLeft: "auto", color: broker.color, fontSize: "11px" }}>↗</span>
                    </a>
                ))}
            </div>
        </div>
    );
};

export default BrokerLinks;

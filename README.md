# 📈 StockGraph - AI-Powered 3D Stock Market Analysis Platform

> **A next-generation financial analytics platform featuring real-time Indian stock data, Google Gemini AI predictions, and an immersive 3D network visualization.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)
![AI](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)

---

## 🌟 Overview

**StockGraph** is a cutting-edge stock market analysis platform that combines:
- 📊 **Real-time data** from 50+ NIFTY stocks (NSE India)
- 🤖 **AI-powered predictions** using Google Gemini
- 🌐 **Interactive 3D network graph** showing stock correlations
- 💼 **Portfolio analysis** with risk metrics
- 🎯 **Market scenario simulation**

---

## ✨ Key Features

### 1. **Immersive 3D Stock Network**
- **Cinematic Rendering**: Bloom effects, dynamic lighting, starfield background
- **Smart Node Visualization**: 
  - Color-coded by sector
  - Size based on market cap
  - Glow intensity by AI confidence
  - Wireframe style for bearish stocks
- **Interactive Controls**:
  - Spotlight hover effect (dims non-neighbors)
  - Rich HTML tooltips with sector badges, prices, and AI signals
  - Director Mode: Smooth camera zoom to focused stocks
  - Auto-rotation with pause control
- **Graph Help Overlay**: Click "Interactive Network" for guided tour

### 2. **AI-Powered Predictions**
- **Google Gemini Integration**: Context-aware stock analysis
- **Prediction Confidence**: Visual AI confidence indicators (1-5 bars)
- **Sentiment Analysis**: Bullish/Bearish signals with explanations
- **Top Movers**: Ranked by prediction strength

### 3. **Portfolio Analyzer**
- **Risk Score Calculation**: Real-time portfolio health metrics
- **Sector Concentration**: Automatic diversification analysis
- **Gain/Loss Tracking**: Live performance monitoring
- **Multi-stock Support**: Analyze up to 10 stocks simultaneously

### 4. **Market Scenario Simulator**
- **Economic Events**: Simulate recession, inflation, boom scenarios
- **Sector-Specific Shocks**: Test impact of regulatory changes
- **What-If Analysis**: Predict portfolio behavior under different conditions

### 5. **Advanced Filters & Modes**
- **Sector Filter**: Focus on specific industries
- **Market Cap Filter**: Filter by company size
- **Correlation Threshold**: Adjust edge visibility
- **Visual Modes**: AI Sentiment, Sector, and Shock Simulator views

---

## 🛠️ Technology Stack

### **Frontend**
- ⚛️ **React 18** with TypeScript
- 🎨 **Tailwind CSS** for styling
- 🌐 **@react-three/fiber** for 3D rendering
- ✨ **@react-three/postprocessing** for visual effects
- 🔄 **React Query** for data fetching
- 📦 **Vite** for blazing-fast builds

### **Backend**
- ⚡ **FastAPI** (Python 3.10)
- 🤖 **Google Generative AI** (Gemini)
- 📊 **yfinance** for real-time stock data
- 🧠 **NetworkX** for graph algorithms
- 🐘 **PostgreSQL** for data persistence
- 🔴 **Redis** for caching
- 🌿 **Celery** for background AI tasks

### **Infrastructure**
- 🐳 **Docker & Docker Compose**
- 🌐 **Nginx** for serving frontend
- 🔄 **WebSockets** for real-time updates

---

## 🎯 What We Built (Session Summary)

### **Phase 1: Foundation** ✅
- Set up full-stack architecture (React + FastAPI + Docker)
- Integrated 50+ real Indian stocks from NSE
- Connected Google Gemini AI for predictions
- Built responsive dashboard layout

### **Phase 2: Core Features** ✅
- Portfolio analyzer with risk scoring
- Top movers ranking system
- Market scenario simulator
- Real-time data fetching pipeline

### **Phase 3: 3D Visualization Overhaul** ✅
- Migrated from `react-force-graph-3d` to custom `@react-three/fiber`
- Implemented post-processing (Bloom, Vignette, Noise)
- Custom shader materials with Fresnel rim lighting
- Dynamic starfield environment
- Pulsing animations for "hot" stocks

### **Phase 4: Advanced Interactions** ✅
- **Spotlight Mode**: Hover to dim non-neighbors
- **Rich HTML Tooltips**: Sector badges, live prices, AI confidence
- **Director Mode**: Smooth camera transitions on click
- **Graph Help Overlay**: Interactive onboarding guide

### **Phase 5: Deployment** ✅
- Created comprehensive deployment guides
- Initialized Git repository
- Pushed to GitHub
- Production-ready Docker configuration

---

## 📸 Screenshots

> **3D Network Graph with Bloom Effects**  
> Nodes glow based on AI confidence, edges show correlation strength

> **Rich Tooltip with Sector Badge**  
> Displays stock symbol, price, prediction %, sector, and AI confidence

> **Market Scenario Simulator**  
> Test portfolio resilience against economic shocks

---

## 🚀 Quick Start

### **Prerequisites**
- Docker Desktop installed
- Google Gemini API Key ([Get one free](https://makersuite.google.com/app/apikey))

### **1. Clone the Repository**
```bash
git clone https://github.com/aryan4043/stockgraph.git
cd stockgraph
```

### **2. Configure Environment**
```bash
cd backend
cp .env.example .env
nano .env
```

Add your Gemini API key:
```ini
GEMINI_API_KEY=your_actual_key_here
DATABASE_URL=postgresql://user:pass@db:5432/stockgraph
REDIS_URL=redis://redis:6379
```

### **3. Launch the Application**
```bash
cd ..
docker-compose up -d --build
```

### **4. Access the Dashboard**
Open your browser to:
- **Frontend**: http://localhost:8080
- **API Docs**: http://localhost:8000/docs

---

## 📖 User Guide

### **Exploring the 3D Graph**
1. **Hover** over nodes to see rich tooltips
2. **Click** a node to activate Director Mode (camera zoom)
3. **Drag** to rotate the view
4. **Scroll** to zoom in/out
5. Click **"Interactive Network"** button for the help overlay

### **Analyzing a Portfolio**
1. Navigate to the Portfolio Analyzer panel
2. Enter stock symbols (e.g., `RELIANCE`, `TCS`, `INFY`)
3. Click "Analyze"
4. Review risk score and sector breakdown

### **Running Market Scenarios**
1. Open the Scenario Simulator
2. Select an event (Recession, Boom, Inflation)
3. Click "Simulate"
4. View predicted impact on your portfolio

---

## 🏗️ Architecture

```
┌─────────────────┐      ┌──────────────────┐
│   Frontend      │◄────►│   Backend API    │
│  (React + 3D)   │      │   (FastAPI)      │
└────────┬────────┘      └────────┬─────────┘
         │                        │
         │                  ┌─────▼─────┐
         │                  │  Gemini   │
         │                  │    AI     │
         │                  └───────────┘
         │                        │
    ┌────▼────────────────────────▼────┐
    │       PostgreSQL + Redis          │
    └───────────────────────────────────┘
```

---

## 🔒 Security Notes

- ✅ `.env` files are gitignored (secrets never committed)
- ✅ API keys stored securely in environment variables
- ✅ CORS configured for local development
- ⚠️ **For production**: Change `SECRET_KEY` and enable HTTPS

---

## 🤝 Contributing

This project was built through an iterative AI-assisted development process. Key milestones:
- Resolved Docker conflicts and dependency issues
- Migrated from problematic 3rd-party graph libs to custom solution
- Implemented cutting-edge 3D rendering techniques
- Created user-friendly onboarding experience

---

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

---

## 🎉 Acknowledgments

- **Google Gemini AI** for intelligent predictions
- **Yahoo Finance** for real-time stock data
- **Three.js Community** for 3D rendering inspiration
- **React Three Fiber** for the amazing 3D ecosystem

---

**Made with ❤️ by Aryan** | [GitHub](https://github.com/aryan4043/stockgraph)

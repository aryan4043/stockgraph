from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import predictions, websocket, portfolio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="StockGraph API")

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for Docker/Localhost access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predictions.router, prefix="/api")
app.include_router(portfolio.router, prefix="/api")
app.include_router(websocket.router)

@app.get("/")
def read_root():
    return {"message": "StockGraph API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

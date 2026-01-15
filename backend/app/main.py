from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from backend.app.core.config import settings
from backend.app.api.endpoints import auth, analyze, transactions, users
from backend.ml_engine.predictor import FraudPredictor

# Lifecycle event to load models
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML Models
    print("Startup: Initializing ML Engine...")
    model_path = os.path.join(os.path.dirname(__file__), "..", "..", "backend", "ml_engine", "saved_models")
    
    # Initialize the global predictor in the analyze module
    # Note: A better pattern is app.state.predictor, but for the dependency injection in analyze.py we can set it there.
    try:
        analyze.predictor = FraudPredictor(model_dir=model_path)
        analyze.predictor.load_models()
        print("Startup: ML Models Loaded Successfully.")
    except Exception as e:
        print(f"Startup Error: Failed to load models: {e}")
        # We don't crash the app, but /analyze will fail
        
    yield
    # Shutdown events if any

app = FastAPI(
    title="Fraud Detection API",
    description="Real-time AI-powered fraud detection system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware (Allow Frontend to connect)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:8080"],  # Vite Frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1", tags=["auth"])
app.include_router(analyze.router, prefix="/api/v1/analyze", tags=["analysis"])
app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])

@app.get("/")
async def root():
    return {
        "system": "Fraud Detection Platform",
        "status": "online",
        "version": "1.0.0",
        "ml_engine": "active" if analyze.predictor and analyze.predictor.xgb_model else "offline"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

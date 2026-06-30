"""
AI Banking Intelligence Engine — FastAPI Application
======================================================
Endpoints:
  POST /api/ai/predict-loan         — Loan risk prediction
  POST /api/ai/detect-fraud         — Fraud detection
  POST /api/ai/predict-savings      — Financial health scoring
  POST /api/ai/spending-analysis    — Spending pattern analysis
  POST /api/ai/recommendations      — AI financial recommendations
  POST /api/ai/retrain              — Retrain all ML models
  GET  /api/ai/model-status         — Check trained models
  
  Legacy:
  POST /predict-risk
  GET  /economic-forecast

Swagger UI: http://localhost:8000/docs
"""
import os
import time
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("ai-engine")

from .schemas import (
    SavingsPredictRequest, SavingsPredictResponse,
    LoanData, RiskPrediction, EconomicForecast,
    RetrainResponse
)
from .services.risk_scoring import calculate_risk
from .services.economic_forecast import get_forecast

from .routes.loan_routes import router as loan_router
from .routes.fraud_routes import router as fraud_router
from .routes.spending_routes import router as spending_router
from .routes.recommendation_routes import router as recommendation_router
from .routes.market_routes import router as market_router
from .routes.market_intelligence_routes import router as market_intel_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("AI Engine starting up — loading models ...")
    try:
        from .services.predict_loan          import _load_model as load_loan
        from .services.predict_fraud         import _load_model as load_fraud
        from .services.predict_savings       import _load_model as load_savings
        from .services.predict_market        import _load_model as load_market
        from .services.predict_spending      import _load_model as load_spending
        from .services.market_intelligence  import _load_model as load_market_intel

        loaders = [("loan", load_loan), ("fraud", load_fraud), ("savings", load_savings),
                   ("market", load_market), ("spending", load_spending), ("market_intel", load_market_intel)]
        for name, loader in loaders:
            try:
                loader()
                logger.info(f"   + {name} model loaded")
            except FileNotFoundError:
                logger.warning(f"   - {name} model not found — run training first")
    except Exception as e:
        logger.error(f"   Model warm-up error: {e}")
    yield
    logger.info("AI Engine shutting down.")


# ─── API Key Auth ──────────────────────────────────────────────────────────────
API_KEY = os.getenv("AI_ENGINE_API_KEY", "dev-key-change-in-production")

# ─── Simple in-memory rate limiter ─────────────────────────────────────────────
_rate_limit_store: dict = {}
RATE_LIMIT = int(os.getenv("RATE_LIMIT", "60"))
RATE_WINDOW = int(os.getenv("RATE_WINDOW", "60"))

async def check_rate_limit(request):
    ip = request.client.host if request.client else "unknown"
    now = time.time()
    window_start = now - RATE_WINDOW
    _rate_limit_store[ip] = [t for t in _rate_limit_store.get(ip, []) if t > window_start]
    if len(_rate_limit_store[ip]) >= RATE_LIMIT:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=429, content={"detail": "Too many requests"})
    _rate_limit_store[ip].append(now)
    return None

app = FastAPI(
    title="AI Smart Banking — Intelligence Engine",
    description=(
        "AI-powered APIs for loan checks, fraud detection, "
        "money health scoring, spending analysis, and AI tips. "
        "Built for the AI Smart Banking Platform (Rwanda)."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    contact={"name": "AI Banking Team", "email": "ai@smartbanking.rw"}
)

@app.middleware("http")
async def security_middleware(request, call_next):
    if request.url.path in ("/", "/docs", "/redoc", "/openapi.json"):
        return await call_next(request)

    rate_resp = await check_rate_limit(request)
    if rate_resp:
        return rate_resp

    # In development mode (default key), skip API key check so the frontend
    # and SwaggerUI can call endpoints directly. In production, a custom
    # AI_ENGINE_API_KEY env var is required and must match.
    if API_KEY == "dev-key-change-in-production":
        return await call_next(request)

    key = request.headers.get("X-API-Key")
    if key != API_KEY:
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=403, content={"detail": "Invalid or missing API key"})

    return await call_next(request)

# CORS — restrict in production
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5000",
    "http://localhost:5001",
    "http://127.0.0.1:3000",
]
if os.getenv("ALLOWED_ORIGINS"):
    ALLOWED_ORIGINS.extend(os.getenv("ALLOWED_ORIGINS").split(","))

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["X-API-Key", "Content-Type", "Authorization"],
)

app.include_router(loan_router)
app.include_router(fraud_router)
app.include_router(spending_router)
app.include_router(recommendation_router)
app.include_router(market_router)
app.include_router(market_intel_router)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "AI Banking Intelligence Engine",
        "version": "2.0.0",
        "status": "operational",
        "docs": "/docs",
        "endpoints": {
            "loan_prediction": "/api/ai/predict-loan",
            "fraud_detection": "/api/ai/detect-fraud",
            "savings_intelligence": "/api/ai/predict-savings",
            "spending_analysis": "/api/ai/spending-analysis",
            "market_forecast": "/api/ai/market-forecast",
            "market_intelligence": "/api/ai/market-intelligence",
            "ai_dashboard": "/api/ai/ai-dashboard",
            "recommendations": "/api/ai/recommendations",
            "model_status": "/api/ai/model-status",
            "retrain": "/api/ai/retrain"
        }
    }


@app.get("/api/ai/model-status", tags=["AI Models"],
         summary="Check which trained models are available")
def model_status():
    BASE = os.path.join(os.path.dirname(__file__), 'models')
    models = {
        'loan_model':     os.path.join(BASE, 'loan_model.pkl'),
        'fraud_model':    os.path.join(BASE, 'fraud_model.pkl'),
        'savings_model':  os.path.join(BASE, 'savings_model.pkl'),
        'market_model':   os.path.join(BASE, 'market_model.pkl'),
        'spending_model': os.path.join(BASE, 'spending_model.pkl'),
    }
    status = {}
    for name, path in models.items():
        if os.path.exists(path):
            size_kb = round(os.path.getsize(path) / 1024, 1)
            status[name] = {'available': True, 'size_kb': size_kb}
        else:
            status[name] = {'available': False, 'size_kb': 0}
    return {"success": True, "models": status}


@app.post("/api/ai/predict-savings", response_model=SavingsPredictResponse,
          tags=["Financial Health"],
          summary="Predict financial health score and savings recommendations")
def predict_savings_endpoint(request: SavingsPredictRequest):
    from .services.predict_savings import predict_savings
    try:
        return predict_savings(request.model_dump())
    except FileNotFoundError as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@app.post("/api/ai/retrain", response_model=RetrainResponse,
          tags=["AI Models"],
          summary="Trigger full model retraining in background")
def retrain_models(background_tasks: BackgroundTasks):
    def do_retrain():
        try:
            from .training.retrain_all import retrain_all
            retrain_all()
        except Exception as e:
            print(f"Retraining error: {e}")

    background_tasks.add_task(do_retrain)
    return {
        "success": True,
        "message": "Model retraining started in background. Check /api/ai/model-status for progress.",
        "results": {}
    }


@app.post("/predict-risk", response_model=RiskPrediction, tags=["Legacy"])
def predict_loan_risk_legacy(data: LoanData):
    return calculate_risk(data)


@app.get("/economic-forecast", response_model=EconomicForecast, tags=["Legacy"])
def fetch_economic_forecast():
    return get_forecast()


# Backend proxy calls POST /api/ai/economic-forecast — add both GET and POST
@app.get("/api/ai/economic-forecast", response_model=EconomicForecast,
         tags=["Economic Forecast"],
         summary="Get current economic forecast and market recommendations")
def fetch_economic_forecast_get():
    return get_forecast()


@app.post("/api/ai/economic-forecast", response_model=EconomicForecast,
          tags=["Economic Forecast"],
          summary="Get current economic forecast (POST variant)")
def fetch_economic_forecast_post():
    return get_forecast()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

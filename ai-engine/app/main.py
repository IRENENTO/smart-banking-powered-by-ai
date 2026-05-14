"""
AI Banking Intelligence Engine — FastAPI Application
======================================================
Endpoints:
  POST /api/ai/predict-loan
  POST /api/ai/detect-fraud
  POST /api/ai/predict-savings
  POST /api/ai/retrain
  GET  /api/ai/model-status
  
  Legacy:
  POST /predict-risk
  GET  /economic-forecast

Swagger UI: http://localhost:8000/docs
"""
import os
import sys
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

from .schemas import (
    LoanPredictRequest, LoanPredictResponse,
    FraudDetectRequest, FraudDetectResponse,
    SavingsPredictRequest, SavingsPredictResponse,
    LoanData, RiskPrediction, EconomicForecast,
    RetrainResponse
)
from .services.risk_scoring import calculate_risk
from .services.economic_forecast import get_forecast

# ─── LIFESPAN ─────────────────────────────────────────────────────────────────
# Pre-load models at startup so first request is fast

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warm up models on startup."""
    print("🚀 AI Engine starting up — loading models ...")
    try:
        from .services.predict_loan    import _load_model as load_loan
        from .services.predict_fraud   import _load_model as load_fraud
        from .services.predict_savings import _load_model as load_savings

        for name, loader in [("loan", load_loan), ("fraud", load_fraud), ("savings", load_savings)]:
            try:
                loader()
                print(f"   ✅  {name} model loaded")
            except FileNotFoundError:
                print(f"   ⚠️   {name} model not found — run training first")
    except Exception as e:
        print(f"   ⚠️  Model warm-up error: {e}")

    yield  # app runs

    print("🛑 AI Engine shutting down.")


# ─── APP ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AI Smart Banking — Intelligence Engine",
    description=(
        "Machine-learning powered APIs for loan approval prediction, "
        "real-time fraud detection, and financial health scoring. "
        "Built for the AI Smart Banking Platform (Rwanda)."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    contact={
        "name": "AI Banking Team",
        "email": "ai@smartbanking.rw"
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── ROOT ─────────────────────────────────────────────────────────────────────
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
            "model_status": "/api/ai/model-status",
            "retrain": "/api/ai/retrain"
        }
    }


# ─── MODEL STATUS ─────────────────────────────────────────────────────────────
@app.get(
    "/api/ai/model-status",
    tags=["AI Models"],
    summary="Check which trained models are available"
)
def model_status():
    BASE = os.path.join(os.path.dirname(__file__), 'models')
    models = {
        'loan_model':    os.path.join(BASE, 'loan_model.pkl'),
        'fraud_model':   os.path.join(BASE, 'fraud_model.pkl'),
        'savings_model': os.path.join(BASE, 'savings_model.pkl'),
    }
    status = {}
    for name, path in models.items():
        if os.path.exists(path):
            size_kb = round(os.path.getsize(path) / 1024, 1)
            status[name] = {'available': True, 'size_kb': size_kb}
        else:
            status[name] = {'available': False, 'size_kb': 0}
    return {"success": True, "models": status}


# ─── LOAN PREDICTION ──────────────────────────────────────────────────────────
@app.post(
    "/api/ai/predict-loan",
    response_model=LoanPredictResponse,
    tags=["AI Models"],
    summary="Predict loan approval probability using trained ML model",
    response_description="Loan risk score, approval decision and default probability"
)
def predict_loan_endpoint(request: LoanPredictRequest):
    """
    Predict whether a loan application should be approved.

    Uses an ensemble of **RandomForestClassifier** and **XGBoostClassifier** 
    trained on historical loan data.

    Returns:
    - `risk_score` — 0-100, higher = lower risk
    - `loan_approval` — True/False
    - `default_probability` — likelihood of default (0-1)
    """
    from .services.predict_loan import predict_loan
    try:
        result = predict_loan(request.model_dump())
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


# ─── FRAUD DETECTION ──────────────────────────────────────────────────────────
@app.post(
    "/api/ai/detect-fraud",
    response_model=FraudDetectResponse,
    tags=["AI Models"],
    summary="Real-time transaction fraud risk detection",
    response_description="Fraud risk level, percentage and risk flags"
)
def detect_fraud_endpoint(request: FraudDetectRequest):
    """
    Analyze a transaction for fraud signals.

    Uses a dual-model approach:
    - **IsolationForest** for unsupervised anomaly detection
    - **RandomForestClassifier** for supervised fraud probability

    Returns combined risk: `LOW | MEDIUM | HIGH | CRITICAL`
    """
    from .services.predict_fraud import detect_fraud
    try:
        result = detect_fraud(request.model_dump())
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection error: {str(e)}")


# ─── SAVINGS / FINANCIAL HEALTH ───────────────────────────────────────────────
@app.post(
    "/api/ai/predict-savings",
    response_model=SavingsPredictResponse,
    tags=["AI Models"],
    summary="Predict financial health score and savings recommendations",
    response_description="Financial health score and personalized saving advice"
)
def predict_savings_endpoint(request: SavingsPredictRequest):
    """
    Compute financial health score and recommended monthly savings.

    Uses:
    - **GradientBoostingRegressor** for health score (0-100)
    - **RandomForestRegressor** for savings amount recommendation

    Returns:
    - `financial_health_score` — 0 to 100
    - `recommended_monthly_saving` — amount in RWF
    - `recommendations` — personalized tips
    """
    from .services.predict_savings import predict_savings
    try:
        result = predict_savings(request.model_dump())
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


# ─── RETRAIN ENDPOINT ─────────────────────────────────────────────────────────
@app.post(
    "/api/ai/retrain",
    response_model=RetrainResponse,
    tags=["AI Models"],
    summary="Trigger full model retraining in background"
)
def retrain_models(background_tasks: BackgroundTasks):
    """
    Schedule a full retraining of all three ML models.
    Retraining runs in the background — check `/api/ai/model-status` afterwards.
    """
    def do_retrain():
        try:
            from .training.retrain_all import retrain_all
            retrain_all()
        except Exception as e:
            print(f"❌ Retraining error: {e}")

    background_tasks.add_task(do_retrain)
    return {
        "success": True,
        "message": "Model retraining started in background. Check /api/ai/model-status for progress.",
        "results": {}
    }


# ─── LEGACY ENDPOINTS (backward compat) ───────────────────────────────────────
@app.post("/predict-risk", response_model=RiskPrediction, tags=["Legacy"])
def predict_loan_risk_legacy(data: LoanData):
    """Legacy endpoint — use /api/ai/predict-loan instead."""
    result = calculate_risk(data)
    return result


@app.get("/economic-forecast", response_model=EconomicForecast, tags=["Legacy"])
def fetch_economic_forecast():
    """Legacy endpoint — returns economic forecast data."""
    return get_forecast()


# ─── ENTRY POINT ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

"""
Fraud Detection Routes
========================
POST /api/ai/detect-fraud — Real-time fraud risk detection
"""
from fastapi import APIRouter, HTTPException
from ..schemas import FraudDetectRequest, FraudDetectResponse
from ..services.predict_fraud import detect_fraud

router = APIRouter(tags=["Fraud Detection"], prefix="/api/ai")


@router.post(
    "/detect-fraud",
    response_model=FraudDetectResponse,
    summary="Real-time transaction fraud detection",
    description="Combines IsolationForest + RandomForest for anomaly and fraud probability scoring."
)
def detect_fraud_endpoint(request: FraudDetectRequest):
    try:
        result = detect_fraud(request.model_dump())
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Detection error: {str(e)}")

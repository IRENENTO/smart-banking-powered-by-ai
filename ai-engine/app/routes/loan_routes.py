"""
Loan Risk Prediction Routes
=============================
POST /api/ai/predict-loan — Predict loan approval and risk score
"""
from fastapi import APIRouter, HTTPException
from ..schemas import LoanPredictRequest, LoanPredictResponse
from ..services.predict_loan import predict_loan

router = APIRouter(tags=["Loan Risk"], prefix="/api/ai")


@router.post(
    "/predict-loan",
    response_model=LoanPredictResponse,
    summary="Predict loan approval probability",
    description="Uses RandomForest + XGBoost ensemble to predict loan risk and default probability."
)
def predict_loan_endpoint(request: LoanPredictRequest):
    try:
        result = predict_loan(request.model_dump())
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

"""
Spending Analytics Routes
==========================
POST /api/ai/spending-analysis — Analyze spending patterns and trends (ML-powered)
"""
from fastapi import APIRouter, HTTPException
from ..schemas import SpendingAnalysisRequest, MLSpendingAnalysisResponse

router = APIRouter(tags=["Spending Analytics"], prefix="/api/ai")


@router.post(
    "/spending-analysis",
    response_model=MLSpendingAnalysisResponse,
    summary="Analyze spending patterns (ML-powered)",
    description="ML-powered spending analysis with category breakdowns, anomaly detection, and financial insights."
)
def spending_analysis_endpoint(request: SpendingAnalysisRequest):
    try:
        from ..services.predict_spending import analyze_spending_ml
        result = analyze_spending_ml(
            transactions=request.transactions,
            monthly_income=request.monthly_income
        )
        return result
    except FileNotFoundError:
        from ..services.analytics_service import analyze_spending
        result = analyze_spending(
            transactions=request.transactions,
            monthly_income=request.monthly_income
        )
        result['ai_powered'] = False
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

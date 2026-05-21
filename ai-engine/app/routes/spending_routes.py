"""
Spending Analytics Routes
==========================
POST /api/ai/spending-analysis — Analyze spending patterns and trends
"""
from fastapi import APIRouter, HTTPException
from ..schemas import SpendingAnalysisRequest, SpendingAnalysisResponse
from ..services.analytics_service import analyze_spending

router = APIRouter(tags=["Spending Analytics"], prefix="/api/ai")


@router.post(
    "/spending-analysis",
    response_model=SpendingAnalysisResponse,
    summary="Analyze spending patterns",
    description="Analyzes transaction data to provide category breakdowns, spending insights, and recommendations."
)
def spending_analysis_endpoint(request: SpendingAnalysisRequest):
    try:
        result = analyze_spending(
            transactions=request.transactions,
            monthly_income=request.monthly_income
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

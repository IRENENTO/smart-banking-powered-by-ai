"""
Rwanda Market Intelligence Routes
===================================
POST /api/ai/market-intelligence — Predict sector trends and returns
GET  /api/ai/ai-dashboard       — AI model metrics for admin dashboard
"""
from fastapi import APIRouter, HTTPException
from ..schemas import MarketIntelligenceResponse, AIDashboardResponse

router = APIRouter(tags=["Market Intelligence"], prefix="/api/ai")


@router.post(
    "/market-intelligence",
    response_model=MarketIntelligenceResponse,
    summary="Rwanda market sector predictions",
    description="ML-powered sector-by-sector predictions for Agriculture, Technology, Real Estate, and more."
)
def market_intelligence_endpoint():
    try:
        from ..services.market_intelligence import predict_sectors
        result = predict_sectors()
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market intelligence error: {str(e)}")


@router.get(
    "/ai-dashboard",
    response_model=AIDashboardResponse,
    summary="AI model metrics for admin dashboard",
    description="Returns all model metrics including accuracy, precision, recall, F1 score."
)
def ai_dashboard_endpoint():
    try:
        from ..services.ai_dashboard import get_dashboard_data
        return get_dashboard_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")

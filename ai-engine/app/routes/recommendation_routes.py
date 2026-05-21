"""
AI Recommendation Routes
=========================
POST /api/ai/recommendations — Generate personalized financial recommendations
"""
from fastapi import APIRouter, HTTPException
from ..schemas import RecommendationRequest, RecommendationResponse
from ..services.recommendation_service import generate_recommendations

router = APIRouter(tags=["Recommendations"], prefix="/api/ai")


@router.post(
    "/recommendations",
    response_model=RecommendationResponse,
    summary="Generate AI financial recommendations",
    description="Provides personalized savings, investment, budgeting advice and sector allocations."
)
def recommendations_endpoint(request: RecommendationRequest):
    try:
        result = generate_recommendations(request.model_dump())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

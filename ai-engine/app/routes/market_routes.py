"""
Market & Economic Forecast Routes
===================================
POST /api/ai/market-forecast — Predict economic indicators and market sentiment
"""
from fastapi import APIRouter, HTTPException
from ..schemas import MarketForecastRequest, MarketForecastResponse

router = APIRouter(tags=["Market Forecast"], prefix="/api/ai")


@router.post(
    "/market-forecast",
    response_model=MarketForecastResponse,
    summary="Predict economic and market forecast",
    description="Predicts inflation rate, GDP growth, and market sentiment based on economic indicators."
)
def market_forecast_endpoint(request: MarketForecastRequest):
    try:
        from ..services.predict_market import predict_market
        result = predict_market(request.model_dump())
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market forecast error: {str(e)}")

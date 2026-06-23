"""
Market & Economic Forecast Prediction Service
===============================================
Loads the trained market model and returns economic forecasts.
"""
import os
import numpy as np
import joblib

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'models', 'market_model.pkl'
)

_artifact = None

SENTIMENT_MAP = {0: 'very_negative', 1: 'negative', 2: 'positive', 3: 'very_positive'}


def _load_model():
    global _artifact
    if _artifact is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Market model not found at {MODEL_PATH}. "
                "Please run: python -m app.training.train_market"
            )
        _artifact = joblib.load(MODEL_PATH)
    return _artifact


def predict_market(data: dict) -> dict:
    """
    Input keys:
      year, month, interest_rate, rwf_usd_exchange, consumer_price_index,
      unemployment_rate, money_supply_bn_rwf, trade_balance_mn_rwf,
      market_volatility, sector_agriculture, sector_manufacturing,
      sector_services, sector_technology, sector_energy, sector_financial,
      sector_real_estate, sector_healthcare

    Returns inflation forecast, GDP growth forecast, and market sentiment.
    """
    artifact = _load_model()
    inflation_model = artifact['inflation_model']
    gdp_model = artifact['gdp_model']
    sentiment_model = artifact['sentiment_model']
    feature_cols = artifact['feature_columns']

    defaults = {
        'year': 2026, 'month': 6,
        'interest_rate': 6.5, 'rwf_usd_exchange': 1150,
        'consumer_price_index': 130, 'unemployment_rate': 16.0,
        'money_supply_bn_rwf': 2000, 'trade_balance_mn_rwf': -150,
        'market_volatility': 25,
        'sector_agriculture': 110, 'sector_manufacturing': 115,
        'sector_services': 125, 'sector_technology': 140,
        'sector_energy': 108, 'sector_financial': 120,
        'sector_real_estate': 112, 'sector_healthcare': 118,
    }
    row = {k: float(data.get(k, defaults.get(k, 0))) for k in feature_cols}
    X = np.array([[row[c] for c in feature_cols]])

    inflation_pred = float(np.clip(inflation_model.predict(X)[0], 0, 20))
    gdp_pred = float(np.clip(gdp_model.predict(X)[0], -5, 10))
    sentiment_class = int(sentiment_model.predict(X)[0])
    sentiment_label = SENTIMENT_MAP.get(sentiment_class, 'neutral')

    # Generate recommendations based on predictions
    recs = []
    if inflation_pred > 6:
        recs.append("High inflation detected — consider fixed-rate savings products and inflation-hedged investments.")
    elif inflation_pred > 4:
        recs.append("Moderate inflation — diversify across asset classes to protect purchasing power.")
    else:
        recs.append("Stable inflation environment — favorable for long-term financial planning.")

    if gdp_pred < 1:
        recs.append("Slow growth environment — prioritize liquidity and emergency funds.")
    elif gdp_pred > 3:
        recs.append("Strong growth period — good time to consider investment products and business expansion.")
    else:
        recs.append("Steady economic growth — maintain balanced savings and investment portfolio.")

    if sentiment_class >= 2:
        recs.append("Positive market sentiment — favorable conditions for loan applications.")
    else:
        recs.append("Cautious market outlook — focus on debt reduction and savings.")

    if row.get('rwf_usd_exchange', 1000) > 1200:
        recs.append("RWF depreciation pressure — consider USD-denominated savings for forex exposure.")

    return {
        'success': True,
        'inflation_rate': round(inflation_pred, 2),
        'gdp_growth': round(gdp_pred, 2),
        'market_sentiment': sentiment_label,
        'sentiment_score': sentiment_class,
        'recommendations': recs,
        'model_metrics': artifact.get('metrics', {}),
    }

"""
Rwanda Market Intelligence Service
===================================
Provides sector-by-sector predictions for the Rwanda market
using trained ML models (RandomForest + XGBoost).
"""
import os
import numpy as np
import joblib

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'models', 'market_model.pkl'
)

_artifact = None

SECTOR_RISK = {
    'Agriculture': 'Low',
    'Technology': 'Low',
    'Real_Estate': 'Medium',
    'Manufacturing': 'Medium',
    'Retail': 'Medium',
    'Tourism': 'High',
    'Transport': 'Medium',
    'Energy': 'Low',
}

SECTOR_GROWTH = {
    'Agriculture': 'Medium',
    'Technology': 'High',
    'Real_Estate': 'Medium',
    'Manufacturing': 'Medium',
    'Retail': 'Medium',
    'Tourism': 'High',
    'Transport': 'Medium',
    'Energy': 'High',
}

def _load_model():
    global _artifact
    if _artifact is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Market model not found at {MODEL_PATH}. "
                "Please run training scripts first."
            )
        _artifact = joblib.load(MODEL_PATH)
    return _artifact

def _sector_name_display(name):
    return name.replace('_', ' ')

def predict_sectors(economic_data: dict = None) -> dict:
    artifact = _load_model()
    models = artifact['models']
    sectors = artifact['sectors']
    feature_cols = artifact['feature_columns']
    sentiment_map = artifact['sentiment_map']
    metrics = artifact.get('metrics', {})

    defaults = {
        'year': 2026, 'month': 6,
        'inflation_rate': 5.2, 'gdp_growth': 6.8,
        'interest_rate': 6.5, 'rwf_usd_exchange': 1150,
    }

    if economic_data:
        for k, v in defaults.items():
            economic_data.setdefault(k, v)
    else:
        economic_data = defaults.copy()

    row = np.array([[float(economic_data.get(c, defaults.get(c, 0)))
                     for c in feature_cols]])

    predictions = []
    for sector in sectors:
        sector_models = models[sector]
        trend_model = sector_models['trend_model']
        return_model = sector_models['return_model']

        trend_class = int(trend_model.predict(row)[0])
        trend = sentiment_map.get(trend_class, 'Stable')
        expected_return = float(return_model.predict(row)[0])
        risk = SECTOR_RISK.get(sector, 'Medium')
        growth = SECTOR_GROWTH.get(sector, 'Medium')

        if trend == 'Growing' and risk == 'Low':
            rec = 'Recommended'
        elif trend == 'Growing' and risk == 'Medium':
            rec = 'Consider'
        elif trend == 'Declining':
            rec = 'Avoid'
        else:
            rec = 'Hold'

        predictions.append({
            'sector': _sector_name_display(sector),
            'trend': trend,
            'expected_return': round(expected_return, 2),
            'risk_level': risk,
            'growth_potential': growth,
            'recommendation': rec,
        })

    growing_sectors = [p['sector'] for p in predictions if p['trend'] == 'Growing']
    declining_sectors = [p['sector'] for p in predictions if p['trend'] == 'Declining']

    if growing_sectors:
        summary = f"Growing sectors: {', '.join(growing_sectors)}. "
    else:
        summary = "Most sectors show stable trends. "
    if declining_sectors:
        summary += f"Sectors to watch: {', '.join(declining_sectors)}."

    advice = []
    top_recs = [p for p in predictions if p['recommendation'] == 'Recommended']
    if top_recs:
        advice.append(f"Consider investing in {', '.join(p['sector'] for p in top_recs[:3])} for growth.")
    advice.append("Diversify across multiple sectors to manage risk.")
    if any(p['trend'] == 'Declining' for p in predictions):
        advice.append("Reduce exposure to declining sectors. Focus on stable/growing ones.")

    return {
        'success': True,
        'sector_predictions': predictions,
        'market_summary': summary,
        'investment_advice': advice,
        'model_metrics': metrics,
    }

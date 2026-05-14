"""
Fraud Detection Prediction Service
=====================================
Combines IsolationForest anomaly score + supervised classifier probability.
"""
import os
import numpy as np
import joblib

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'models', 'fraud_model.pkl'
)

_artifact = None


def _load_model():
    global _artifact
    if _artifact is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Fraud model not found at {MODEL_PATH}. "
                "Please run: python -m app.training.train_fraud"
            )
        _artifact = joblib.load(MODEL_PATH)
    return _artifact


def detect_fraud(data: dict) -> dict:
    """
    Input keys:
      amount, hour_of_day, day_of_week, transaction_count_24h,
      distance_from_home, is_international, account_age_days,
      avg_tx_amount, device_change

    Returns structured fraud risk prediction.
    """
    artifact = _load_model()
    iso       = artifact['isolation_forest']
    clf       = artifact['classifier']
    scaler    = artifact['scaler']
    feat_cols = artifact['feature_columns']

    # Build row
    row = {
        'amount':                  float(data.get('amount', 50000)),
        'hour_of_day':             int(data.get('hour_of_day', 12)),
        'day_of_week':             int(data.get('day_of_week', 1)),
        'transaction_count_24h':   int(data.get('transaction_count_24h', 3)),
        'distance_from_home':      float(data.get('distance_from_home', 5.0)),
        'is_international':        int(data.get('is_international', 0)),
        'account_age_days':        int(data.get('account_age_days', 365)),
        'avg_tx_amount':           float(data.get('avg_tx_amount', 40000)),
        'device_change':           int(data.get('device_change', 0)),
    }

    X_raw = np.array([[row.get(c, 0) for c in feat_cols]])
    X_scaled = scaler.transform(X_raw)

    # IsolationForest anomaly score (lower = more anomalous)
    iso_score = float(iso.score_samples(X_scaled)[0])  # negative; closer to 0 = riskier
    iso_flag  = int(iso.predict(X_scaled)[0] == -1)    # 1 = anomaly

    # Supervised classifier probability
    clf_prob  = float(clf.predict_proba(X_scaled)[0][1])

    # Combine: weighted average
    # iso_score is in [-0.5, 0.5] roughly; map to [0,1] risk
    iso_risk = float(np.clip(-iso_score * 2, 0, 1))
    combined  = 0.40 * iso_risk + 0.60 * clf_prob
    risk_pct  = int(round(combined * 100))

    if risk_pct < 25:
        fraud_risk = "LOW"
    elif risk_pct < 55:
        fraud_risk = "MEDIUM"
    elif risk_pct < 80:
        fraud_risk = "HIGH"
    else:
        fraud_risk = "CRITICAL"

    flags = []
    if row['hour_of_day'] < 4:                              flags.append("Unusual transaction hour")
    if row['transaction_count_24h'] > 15:                   flags.append("High transaction frequency")
    if row['is_international']:                             flags.append("International transaction")
    if row['account_age_days'] < 30:                        flags.append("New account")
    if row['device_change']:                                flags.append("New device used")
    if row['amount'] > row['avg_tx_amount'] * 5:            flags.append("Amount far above average")

    return {
        'success': True,
        'fraud_risk': fraud_risk,
        'risk_percentage': risk_pct,
        'is_anomaly': bool(iso_flag),
        'classifier_fraud_probability': round(clf_prob, 4),
        'risk_flags': flags,
        'action_required': fraud_risk in ('HIGH', 'CRITICAL'),
        'model_metrics': artifact.get('metrics', {})
    }

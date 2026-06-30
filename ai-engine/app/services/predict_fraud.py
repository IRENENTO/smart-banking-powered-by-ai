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
    artifact = _load_model()
    iso = artifact['isolation_forest']
    clf = artifact['classifier']
    scaler = artifact['scaler']
    feat_cols = artifact['feature_columns']
    encoders = artifact.get('encoders', {})
    metrics = artifact.get('metrics', {})

    defaults = {
        'transaction_amount': 50000, 'amount': 50000,
        'location': 'Kigali', 'device': 'mobile',
        'time': 12, 'hour_of_day': 12,
        'frequency': 3, 'transaction_count_24h': 3,
    }

    # Map input fields to feature columns
    def _get(key, alt, default):
        return float(data.get(key, data.get(alt, default)))

    row = {}
    if 'transaction_amount' in feat_cols:
        row['transaction_amount'] = _get('transaction_amount', 'amount', 50000)
        location = str(data.get('location', data.get('location', 'Kigali')))
        device = str(data.get('device', data.get('device', 'mobile')))
        row['time'] = int(_get('time', 'hour_of_day', 12))
        row['frequency'] = int(_get('frequency', 'transaction_count_24h', 3))
        for col in ['location', 'device']:
            val = location if col == 'location' else device
            if col in encoders:
                le = encoders[col]
                val = str(val).lower()
                if val in le.classes_:
                    row[col] = int(le.transform([val])[0])
                else:
                    row[col] = int(le.transform([le.classes_[0]])[0])
            else:
                row[col] = 0
    else:
        row = {
            'amount': _get('amount', 'transaction_amount', 50000),
            'hour_of_day': int(_get('hour_of_day', 'time', 12)),
            'day_of_week': int(data.get('day_of_week', 1)),
            'transaction_count_24h': int(_get('transaction_count_24h', 'frequency', 3)),
            'distance_from_home': float(data.get('distance_from_home', 5.0)),
            'is_international': int(data.get('is_international', 0)),
            'account_age_days': int(data.get('account_age_days', 365)),
            'avg_tx_amount': float(data.get('avg_tx_amount', 40000)),
            'device_change': int(data.get('device_change', 0)),
        }

    X_raw = np.array([[row.get(c, 0) for c in feat_cols]])
    X_scaled = scaler.transform(X_raw)

    iso_score = float(iso.score_samples(X_scaled)[0])
    iso_flag = int(iso.predict(X_scaled)[0] == -1)
    clf_prob = float(clf.predict_proba(X_scaled)[0][1])

    iso_risk = float(np.clip(-iso_score * 2, 0, 1))
    combined = 0.40 * iso_risk + 0.60 * clf_prob
    risk_pct = int(round(combined * 100))

    if risk_pct < 25:
        fraud_risk = "LOW"
        color = "Green"
    elif risk_pct < 55:
        fraud_risk = "MEDIUM"
        color = "Yellow"
    elif risk_pct < 80:
        fraud_risk = "HIGH"
        color = "Red"
    else:
        fraud_risk = "CRITICAL"
        color = "Red"

    flags = []
    tx_amount = row.get('transaction_amount', row.get('amount', 0))
    tx_hour = row.get('time', row.get('hour_of_day', 12))
    tx_freq = row.get('frequency', row.get('transaction_count_24h', 0))
    if tx_hour < 4:
        flags.append("Unusual transaction hour")
    if tx_freq > 15:
        flags.append("High transaction frequency")
    if row.get('is_international', 0) or str(data.get('location', '')).lower() == 'international':
        flags.append("International transaction")
    if row.get('account_age_days', 365) < 30:
        flags.append("New account")
    if row.get('device_change', 0) or str(data.get('device', '')).lower() == 'unknown':
        flags.append("New or unknown device")
    avg_tx = row.get('avg_tx_amount', 40000)
    if tx_amount > avg_tx * 5:
        flags.append("Amount far above average")

    return {
        'success': True,
        'fraud_risk': fraud_risk,
        'risk_percentage': risk_pct,
        'fraud_score': risk_pct,
        'risk_level': fraud_risk,
        'confidence': risk_pct,
        'color': color,
        'is_anomaly': bool(iso_flag),
        'classifier_fraud_probability': round(clf_prob, 4),
        'risk_flags': flags,
        'action_required': fraud_risk in ('HIGH', 'CRITICAL'),
        'suggested_action': 'Block transaction and review' if fraud_risk in ('HIGH', 'CRITICAL') else 'Flag for review' if fraud_risk == 'MEDIUM' else 'No action needed',
        'model_metrics': metrics,
    }

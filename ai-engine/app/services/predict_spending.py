"""
Spending Analytics Prediction Service
========================================
Loads the trained spending model and returns category breakdowns,
spending predictions, anomaly detection, and financial insights.
"""
import os
import numpy as np
import joblib
from collections import defaultdict

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'models', 'spending_model.pkl'
)

_artifact = None

CATEGORIES = [
    'food_dining', 'transport_fuel', 'housing_rent', 'utilities_bills',
    'healthcare', 'education', 'entertainment_leisure', 'shopping_retail',
    'mobile_communication', 'insurance', 'savings_investments', 'other'
]


def _load_model():
    global _artifact
    if _artifact is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Spending model not found at {MODEL_PATH}. "
                "Please run: python -m app.training.train_spending"
            )
        _artifact = joblib.load(MODEL_PATH)
    return _artifact


def analyze_spending_ml(transactions: list, monthly_income: float) -> dict:
    """
    ML-powered spending analysis with category breakdown, prediction, anomaly detection.

    Input: list of transactions with amount, category, date
    Returns: spending insights with ML predictions
    """
    artifact = _load_model()
    spending_model = artifact['spending_model']
    anomaly_model = artifact['anomaly_model']
    scaler = artifact['scaler']
    feature_cols = artifact['feature_columns']
    cat_amount_cols = artifact['cat_amount_cols']
    encoders = artifact.get('encoders', {})

    if not transactions:
        return {
            'success': True,
            'total_spent': 0,
            'monthly_income': monthly_income,
            'savings_rate': 1.0,
            'top_category': 'none',
            'category_breakdown': [],
            'spending_insight': 'No transaction data available.',
            'recommendations': ['Start tracking your expenses to get spending insights.'],
            'ai_powered': True,
            'anomalies': [],
        }

    # Aggregate transactions by category
    category_totals = defaultdict(float)
    category_counts = defaultdict(int)
    category_amounts = defaultdict(list)

    for tx in transactions:
        cat = tx.get('category', 'other').lower().replace(' ', '_')
        amt = float(tx.get('amount', 0))
        category_totals[cat] += amt
        category_counts[cat] += 1
        category_amounts[cat].append(amt)

    total_spent = sum(category_totals.values())

    # Build feature vector for ML prediction
    row = {'year': 2026, 'month': 6, 'monthly_income': monthly_income}
    for col in cat_amount_cols:
        cat = col.replace('total_amount_', '')
        row[col] = category_totals.get(cat, 0)
    for c in CATEGORIES:
        row[f'tx_count_{c}'] = category_counts.get(c, 0)
        vals = category_amounts.get(c, [0])
        row[f'avg_amount_{c}'] = np.mean(vals) if vals else 0

    # Encode spend_type
    spend_type_raw = 'variable'
    recurring_count = sum(1 for c in CATEGORIES if c in ('housing_rent', 'utilities_bills', 'insurance') and category_totals.get(c, 0) > 0)
    if recurring_count >= 2:
        spend_type_raw = 'recurring'

    if 'spend_type' in encoders:
        le = encoders['spend_type']
        val = spend_type_raw
        if val in le.classes_:
            row['spend_type'] = int(le.transform([val])[0])
        else:
            row['spend_type'] = int(le.transform([le.classes_[0]])[0])
    else:
        row['spend_type'] = 0

    X = np.array([[row.get(c, 0) for c in feature_cols]])

    # Predict expected total spending
    predicted_spending = float(spending_model.predict(X)[0])

    # Anomaly detection
    X_scaled = scaler.transform(X)
    is_anomaly = int(anomaly_model.predict(X_scaled)[0])
    anomaly_score = float(anomaly_model.score_samples(X_scaled)[0])

    # Category breakdown
    breakdown = []
    for cat, amt in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
        pct = (amt / total_spent * 100) if total_spent > 0 else 0
        breakdown.append({
            'category': cat,
            'amount': round(amt, 2),
            'percentage': round(pct, 1),
            'transaction_count': category_counts[cat],
        })

    top_category = breakdown[0]['category'] if breakdown else 'none'
    savings_rate = max(0, (monthly_income - total_spent) / monthly_income) if monthly_income > 0 else 0

    # Spending insight (ML-enhanced)
    if is_anomaly == -1:
        insights = f"Unusual spending pattern detected (anomaly score: {anomaly_score:.2f}). Your total spending of {total_spent:,.0f} RWF differs significantly from the predicted {predicted_spending:,.0f} RWF."
    elif savings_rate < 0.10:
        insights = f"Your spending ({total_spent:,.0f} RWF) nearly matches your income ({monthly_income:,.0f} RWF). ML predicts typical spending of {predicted_spending:,.0f} RWF — you're above the norm."
    elif savings_rate < 0.20:
        insights = f"Savings rate is {savings_rate*100:.0f}%. Top category: '{top_category}'. ML-predicted spending is {predicted_spending:,.0f} RWF."
    else:
        insights = f"Good savings rate ({savings_rate*100:.0f}%). '{top_category}' is your top category. ML-predicted spending: {predicted_spending:,.0f} RWF."

    # Recommendations (ML-aware)
    recs = []
    if total_spent > predicted_spending * 1.3:
        recs.append(f"Your spending exceeds ML predictions by {((total_spent/predicted_spending)-1)*100:.0f}%. Review your top categories for savings opportunities.")
    if savings_rate < 0.10:
        recs.append("Target a 20% savings rate. Review subscriptions and recurring charges.")
    if is_anomaly == -1:
        recs.append("Unusual spending detected — review recent transactions for errors or fraud.")
    if breakdown and breakdown[0].get('percentage', 0) > 40:
        recs.append(f"'{top_category}' represents {breakdown[0]['percentage']:.0f}% of spending. Consider diversifying your expense categories.")
    if savings_rate >= 0.20:
        recs.append("Great savings rate! Consider investing surplus in diversified instruments.")
    if not recs:
        recs.append("Your spending habits appear balanced. Continue monitoring monthly trends.")

    return {
        'success': True,
        'total_spent': round(total_spent, 2),
        'monthly_income': monthly_income,
        'savings_rate': round(savings_rate, 2),
        'top_category': top_category,
        'category_breakdown': breakdown,
        'spending_insight': insights,
        'recommendations': recs,
        'ai_powered': True,
        'predicted_spending': round(predicted_spending, 2),
        'is_anomaly': is_anomaly == -1,
        'anomaly_score': round(anomaly_score, 4),
        'model_metrics': artifact.get('metrics', {}),
    }

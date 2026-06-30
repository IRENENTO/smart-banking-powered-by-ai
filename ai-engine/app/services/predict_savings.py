"""
Savings & Financial Health Prediction Service
===============================================
Loads the trained savings model and returns health score + saving recommendations.
"""
import os
import numpy as np
import joblib

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'models', 'savings_model.pkl'
)

_artifact = None


def _load_model():
    global _artifact
    if _artifact is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Savings model not found at {MODEL_PATH}. "
                "Please run: python -m app.training.train_savings"
            )
        _artifact = joblib.load(MODEL_PATH)
    return _artifact


def predict_savings(data: dict) -> dict:
    """
    Input keys:
      age, monthly_income, monthly_expenses, num_dependents,
      existing_savings, debt_payments, investment_amount,
      employment_type, has_insurance

    Returns financial health score and savings recommendations.
    """
    artifact = _load_model()
    health_model  = artifact['health_model']
    savings_model = artifact['savings_model']
    encoders      = artifact['encoders']
    feature_cols  = artifact['feature_columns']

    # Employment type encoding
    emp_map = {
        'employed': 'employed',
        'self_employed': 'self_employed',
        'self-employed': 'self_employed',
        'unemployed': 'unemployed',
        'student': 'student'
    }
    emp_raw = emp_map.get(str(data.get('employment_type', 'employed')).lower(), 'employed')

    row = {
        'age':                int(data.get('age', 30)),
        'monthly_income':     float(data.get('monthly_income', 300000)),
        'monthly_expenses':   float(data.get('monthly_expenses', 150000)),
        'num_dependents':     int(data.get('num_dependents', 0)),
        'existing_savings':   float(data.get('existing_savings', 0)),
        'debt_payments':      float(data.get('debt_payments', 0)),
        'investment_amount':  float(data.get('investment_amount', 0)),
        'employment_type':    emp_raw,
        'has_insurance':      int(data.get('has_insurance', 0)),
    }

    # Encode employment type
    if 'employment_type' in encoders:
        le = encoders['employment_type']
        val = row['employment_type']
        if val in le.classes_:
            row['employment_type'] = int(le.transform([val])[0])
        else:
            row['employment_type'] = int(le.transform([le.classes_[0]])[0])

    X = np.array([[row.get(c, 0) for c in feature_cols]])

    # Predict
    health_score       = float(np.clip(health_model.predict(X)[0], 0, 100))
    recommended_saving = float(np.clip(savings_model.predict(X)[0], 0, row['monthly_income'] * 0.60))

    # Derived metrics
    disposable  = row['monthly_income'] - row['monthly_expenses'] - row['debt_payments']
    savings_rate = disposable / (row['monthly_income'] + 1)
    dti          = row['debt_payments'] / (row['monthly_income'] + 1)

    # Recommendations
    tips = []
    if savings_rate < 0.10:
        tips.append("Your savings rate is below 10%. Try to reduce discretionary spending.")
    if dti > 0.40:
        tips.append("Your debt payments are high relative to income. Consider debt consolidation.")
    if not row['has_insurance']:
        tips.append("No insurance detected. Consider health or life insurance for protection.")
    if row['investment_amount'] == 0:
        tips.append("Start investing even small amounts to grow your money over time.")
    if row['existing_savings'] < row['monthly_income'] * 3:
        tips.append("Build an emergency fund of at least 3 months of income.")
    if not tips:
        tips.append("Your financial health is strong. Keep maintaining good saving habits!")

    # Rating label
    if health_score >= 80:
        rating = "Excellent"
    elif health_score >= 65:
        rating = "Good"
    elif health_score >= 45:
        rating = "Fair"
    else:
        rating = "Poor"

    return {
        'success': True,
        'financial_health_score': int(round(health_score)),
        'financial_health_rating': rating,
        'recommended_monthly_saving': int(round(recommended_saving)),
        'disposable_income': int(round(disposable)),
        'savings_rate_pct': int(round(savings_rate * 100)),
        'debt_to_income_pct': int(round(dti * 100)),
        'recommendations': tips,
        'model_metrics': artifact.get('metrics', {})
    }

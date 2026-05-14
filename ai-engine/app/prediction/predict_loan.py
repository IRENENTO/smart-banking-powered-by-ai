"""
Loan Prediction Service
========================
Loads the trained loan model and produces structured predictions.
"""
import os
import numpy as np
import joblib

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    'models', 'loan_model.pkl'
)

_artifact = None


def _load_model():
    global _artifact
    if _artifact is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Loan model not found at {MODEL_PATH}. "
                "Please run: python -m app.training.train_loan"
            )
        _artifact = joblib.load(MODEL_PATH)
    return _artifact


def predict_loan(data: dict) -> dict:
    artifact = _load_model()
    model = artifact['model']
    encoders = artifact['encoders']
    feature_cols = artifact['feature_columns']

    row = {}

    emp_map = {
        'employed': 'employed',
        'self_employed': 'self_employed',
        'self-employed': 'self_employed',
        'unemployed': 'unemployed',
        'student': 'student'
    }
    row['employment_type'] = emp_map.get(
        str(data.get('employment_type', 'employed')).lower(), 'employed'
    )

    edu_map = {
        'primary': 'primary',
        'secondary': 'secondary',
        'tertiary': 'tertiary',
        'none': 'none'
    }
    row['education'] = edu_map.get(
        str(data.get('education', 'secondary')).lower(), 'secondary'
    )

    for col in ['employment_type', 'education']:
        if col in encoders:
            le = encoders[col]
            val = row[col]
            if val in le.classes_:
                row[col] = int(le.transform([val])[0])
            else:
                row[col] = int(le.transform([le.classes_[0]])[0])

    row['age']              = int(data.get('age', 30))
    row['monthly_income']   = float(data.get('monthly_income', 200000))
    row['loan_amount']      = float(data.get('loan_amount', 500000))
    row['duration_months']  = int(data.get('duration_months', 12))
    row['existing_debt']    = float(data.get('existing_debt', 0))
    row['num_dependents']   = int(data.get('num_dependents', 0))
    row['credit_history']   = int(data.get('credit_history', 1))
    row['collateral']       = int(data.get('collateral', 0))

    X = np.array([[row.get(c, 0) for c in feature_cols]])

    prob_approved = float(model.predict_proba(X)[0][1])
    approved = bool(prob_approved >= 0.5)
    default_prob = round(1.0 - prob_approved, 4)
    risk_score = int(round(prob_approved * 100))

    dti = row['existing_debt'] / (row['monthly_income'] + 1)
    if risk_score >= 75:
        reason = "Strong financial profile with good income and low debt."
    elif risk_score >= 55:
        reason = "Moderate risk. Approved with standard conditions."
    elif risk_score >= 35:
        reason = "Elevated risk. Manual review recommended."
    else:
        reason = "High risk profile. Income or debt levels are a concern."

    return {
        'success': True,
        'loan_approval': approved,
        'risk_score': risk_score,
        'default_probability': round(default_prob, 4),
        'approval_probability': round(prob_approved, 4),
        'debt_to_income_ratio': round(dti, 4),
        'reason': reason,
        'model_metrics': artifact.get('metrics', {})
    }

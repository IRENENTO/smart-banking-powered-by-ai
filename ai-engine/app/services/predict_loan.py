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
    feature_cols = artifact['feature_columns']
    metrics = artifact.get('metrics', {})

    row = {}
    income = float(data.get('income', data.get('monthly_income', 200000)))
    expenses = float(data.get('expenses', data.get('monthly_expenses', 0)))
    savings = float(data.get('savings', data.get('existing_savings', 0)))
    loan_amount = float(data.get('loan_amount', data.get('amount', 500000)))
    credit_score = int(data.get('credit_score', 650))

    if 'income' in feature_cols:
        row['income'] = income
        row['expenses'] = expenses
        row['savings'] = savings
        row['loan_amount'] = loan_amount
        row['credit_score'] = credit_score
    else:
        row['age'] = int(data.get('age', 30))
        row['monthly_income'] = income
        row['loan_amount'] = loan_amount
        row['duration_months'] = int(data.get('duration_months', 12))
        row['existing_debt'] = float(data.get('existing_debt', data.get('existingDebt', 0)))
        row['num_dependents'] = int(data.get('num_dependents', 0))
        emp_type = str(data.get('employment_type', 'employed')).lower()
        emp_map = {'employed': 'employed', 'self_employed': 'self_employed', 'self-employed': 'self_employed', 'unemployed': 'unemployed', 'student': 'student'}
        row['employment_type'] = emp_map.get(emp_type, 'employed')
        edu = str(data.get('education', 'secondary')).lower()
        edu_map = {'primary': 'primary', 'secondary': 'secondary', 'tertiary': 'tertiary', 'none': 'none'}
        row['education'] = edu_map.get(edu, 'secondary')
        row['credit_history'] = int(data.get('credit_history', 1))
        row['collateral'] = int(data.get('collateral', 0))
        encoders = artifact.get('encoders', {})
        for col in ['employment_type', 'education']:
            if col in encoders:
                le = encoders[col]
                val = row[col]
                if val in le.classes_:
                    row[col] = int(le.transform([val])[0])
                else:
                    row[col] = int(le.transform([le.classes_[0]])[0])

    X = np.array([[row.get(c, 0) for c in feature_cols]])
    prob_approved = float(model.predict_proba(X)[0][1])
    approved = bool(prob_approved >= 0.5)
    confidence = int(round(prob_approved * 100))
    risk_score = int(round((1 - prob_approved) * 100))
    default_prob = round(1.0 - prob_approved, 4)

    if risk_score <= 30:
        risk_level = "Low"
    elif risk_score <= 60:
        risk_level = "Medium"
    else:
        risk_level = "High"

    ltv = loan_amount / (income * 0.3 * 12 + savings + 1) if income > 0 else 1
    dti = expenses / (income + 1) if income > 0 else 0

    reasons = []
    if credit_score >= 750:
        reasons.append("Excellent credit score")
    elif credit_score >= 650:
        reasons.append("Good credit score")
    else:
        reasons.append("Low credit score")

    if dti < 0.3:
        reasons.append("Low debt-to-income ratio")
    elif dti < 0.5:
        reasons.append("Moderate debt levels")
    else:
        reasons.append("High debt-to-income ratio")

    if savings >= income * 3:
        reasons.append("Strong savings buffer")
    elif savings >= income:
        reasons.append("Adequate savings")
    else:
        reasons.append("Limited savings")

    if ltv < 0.5:
        reasons.append("Low loan-to-value ratio")

    action = "Loan Approved" if approved else "Loan Rejected"
    if approved and risk_level == "Medium":
        action = "Approved with conditions"

    return {
        'success': True,
        'loan_approval': approved,
        'risk_score': risk_score,
        'prediction': "Approved" if approved else "Rejected",
        'confidence': confidence,
        'risk': risk_level,
        'default_probability': default_prob,
        'approval_probability': round(prob_approved, 4),
        'debt_to_income_ratio': round(dti, 4),
        'reason': "; ".join(reasons),
        'suggested_action': action,
        'model_metrics': metrics,
    }

from ..models.loan_risk_model import model

def calculate_risk(loan_data):
    """
    Calculate loan risk and return a dict matching RiskPrediction schema:
      risk_score: int
      approval_status: str
      explanation: str
    """
    try:
        data = {
            'amount':       loan_data.amount,
            'duration':     loan_data.duration,
            'monthlyIncome': loan_data.monthlyIncome,
            'existingDebt': loan_data.existingDebt
        }
        result = model.predict(data)
        return {
            'risk_score':      int(round(result['risk_score'])),   # must be int
            'approval_status': str(result['approval_status']),
            'explanation':     str(result['explanation'])
        }
    except Exception as e:
        return {
            'risk_score':      50,
            'approval_status': 'REVIEW',
            'explanation':     f'Risk calculation error: {str(e)}'
        }


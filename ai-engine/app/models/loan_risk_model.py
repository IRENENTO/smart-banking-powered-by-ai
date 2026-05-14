import numpy as np

class LoanRiskModel:
    def predict(self, data):
        # Simulation of ML logic
        # High debt-to-income ratio increases risk
        dti = data['existingDebt'] / (data['monthlyIncome'] + 1)
        loan_to_income = data['amount'] / ((data['monthlyIncome'] * data['duration']) + 1)
        
        # Base score
        score = 100 - (dti * 50) - (loan_to_income * 30)
        
        # Clip score
        score = max(0, min(100, score))
        
        if score > 70:
            status = "APPROVED"
            explanation = "Low risk based on income and debt profile."
        elif score > 40:
            status = "REVIEW"
            explanation = "Moderate risk. Manual verification of collateral recommended."
        else:
            status = "REJECTED"
            explanation = "High risk. Debt-to-income ratio exceeds safety thresholds."
            
        return {
            "risk_score": round(float(score), 2),
            "approval_status": status,
            "explanation": explanation
        }

model = LoanRiskModel()

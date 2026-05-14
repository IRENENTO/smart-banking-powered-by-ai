"""
Pydantic schemas for AI engine request / response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List


# ─── LOAN ─────────────────────────────────────────────────────────────────────
class LoanPredictRequest(BaseModel):
    age: int = Field(default=30, ge=18, le=80, description="Applicant age")
    monthly_income: float = Field(default=200000, ge=0, description="Monthly income in RWF")
    loan_amount: float = Field(default=500000, ge=1000, description="Requested loan amount in RWF")
    duration_months: int = Field(default=12, ge=1, le=120, description="Loan duration in months")
    existing_debt: float = Field(default=0.0, ge=0, description="Existing debt in RWF")
    num_dependents: int = Field(default=0, ge=0, le=15)
    employment_type: str = Field(default="employed", description="employed | self_employed | unemployed | student")
    education: str = Field(default="secondary", description="primary | secondary | tertiary | none")
    credit_history: int = Field(default=1, ge=0, le=1, description="1=good, 0=bad")
    collateral: int = Field(default=0, ge=0, le=1, description="1=has collateral, 0=none")

    class Config:
        json_schema_extra = {
            "example": {
                "age": 35,
                "monthly_income": 450000,
                "loan_amount": 1000000,
                "duration_months": 24,
                "existing_debt": 100000,
                "num_dependents": 2,
                "employment_type": "employed",
                "education": "tertiary",
                "credit_history": 1,
                "collateral": 1
            }
        }


class LoanPredictResponse(BaseModel):
    success: bool
    loan_approval: bool
    risk_score: int
    default_probability: float
    approval_probability: float
    debt_to_income_ratio: float
    reason: str
    model_metrics: dict = {}


# ─── FRAUD ────────────────────────────────────────────────────────────────────
class FraudDetectRequest(BaseModel):
    amount: float = Field(default=50000, ge=0)
    hour_of_day: int = Field(default=12, ge=0, le=23)
    day_of_week: int = Field(default=1, ge=0, le=6)
    transaction_count_24h: int = Field(default=3, ge=0)
    distance_from_home: float = Field(default=5.0, ge=0)
    is_international: int = Field(default=0, ge=0, le=1)
    account_age_days: int = Field(default=365, ge=0)
    avg_tx_amount: float = Field(default=40000, ge=0)
    device_change: int = Field(default=0, ge=0, le=1)

    class Config:
        json_schema_extra = {
            "example": {
                "amount": 500000,
                "hour_of_day": 2,
                "day_of_week": 6,
                "transaction_count_24h": 18,
                "distance_from_home": 150.0,
                "is_international": 1,
                "account_age_days": 15,
                "avg_tx_amount": 40000,
                "device_change": 1
            }
        }


class FraudDetectResponse(BaseModel):
    success: bool
    fraud_risk: str          # LOW | MEDIUM | HIGH | CRITICAL
    risk_percentage: int
    is_anomaly: bool
    classifier_fraud_probability: float
    risk_flags: List[str]
    action_required: bool
    model_metrics: dict = {}


# ─── SAVINGS ──────────────────────────────────────────────────────────────────
class SavingsPredictRequest(BaseModel):
    age: int = Field(default=30, ge=18, le=80)
    monthly_income: float = Field(default=300000, ge=0)
    monthly_expenses: float = Field(default=150000, ge=0)
    num_dependents: int = Field(default=0, ge=0, le=15)
    existing_savings: float = Field(default=0, ge=0)
    debt_payments: float = Field(default=0, ge=0)
    investment_amount: float = Field(default=0, ge=0)
    employment_type: str = Field(default="employed")
    has_insurance: int = Field(default=0, ge=0, le=1)

    class Config:
        json_schema_extra = {
            "example": {
                "age": 28,
                "monthly_income": 500000,
                "monthly_expenses": 280000,
                "num_dependents": 1,
                "existing_savings": 200000,
                "debt_payments": 50000,
                "investment_amount": 30000,
                "employment_type": "employed",
                "has_insurance": 1
            }
        }


class SavingsPredictResponse(BaseModel):
    success: bool
    financial_health_score: int
    financial_health_rating: str
    recommended_monthly_saving: int
    disposable_income: int
    savings_rate_pct: int
    debt_to_income_pct: int
    recommendations: List[str]
    model_metrics: dict = {}


# ─── LEGACY ───────────────────────────────────────────────────────────────────
class LoanData(BaseModel):
    monthlyIncome: float = 200000
    amount: float = 500000
    duration: int = 12
    existingDebt: float = 0
    purpose: str = "personal"


class RiskPrediction(BaseModel):
    risk_score: int
    approval_status: str
    explanation: str


class EconomicForecast(BaseModel):
    inflation_rate: float
    gdp_growth: float
    market_sentiment: str
    recommendations: list


# ─── RETRAIN ──────────────────────────────────────────────────────────────────
class RetrainResponse(BaseModel):
    success: bool
    message: str
    results: dict = {}

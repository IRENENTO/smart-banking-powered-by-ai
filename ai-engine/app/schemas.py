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


# ─── SPENDING ANALYTICS ───────────────────────────────────────────────────────
class SpendingAnalysisRequest(BaseModel):
    transactions: List[dict] = Field(default=[], description="List of transaction objects with amount, category, date")
    monthly_income: float = Field(default=300000, ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "transactions": [
                    {"amount": 50000, "category": "food", "date": "2026-01-15"},
                    {"amount": 200000, "category": "rent", "date": "2026-01-01"},
                    {"amount": 30000, "category": "transport", "date": "2026-01-10"},
                    {"amount": 150000, "category": "shopping", "date": "2026-01-20"},
                    {"amount": 25000, "category": "entertainment", "date": "2026-01-25"}
                ],
                "monthly_income": 500000
            }
        }


class CategoryBreakdown(BaseModel):
    category: str
    amount: float
    percentage: float
    transaction_count: int


class SpendingAnalysisResponse(BaseModel):
    success: bool
    total_spent: float
    monthly_income: float
    savings_rate: float
    top_category: str
    category_breakdown: List[CategoryBreakdown]
    spending_insight: str
    recommendations: List[str]


# ─── MARKET FORECAST ───────────────────────────────────────────────────────────
class MarketForecastRequest(BaseModel):
    year: int = Field(default=2026, ge=2020, le=2030)
    month: int = Field(default=6, ge=1, le=12)
    interest_rate: float = Field(default=6.5, ge=0, description="Central bank interest rate (%)")
    rwf_usd_exchange: float = Field(default=1150, ge=500, description="RWF per 1 USD")
    consumer_price_index: float = Field(default=130, ge=50)
    unemployment_rate: float = Field(default=16.0, ge=0, le=50)
    money_supply_bn_rwf: float = Field(default=2000, ge=0)
    trade_balance_mn_rwf: float = Field(default=-150, description="Negative = deficit")
    market_volatility: float = Field(default=25, ge=0, le=100)
    sector_agriculture: float = Field(default=110, ge=0)
    sector_manufacturing: float = Field(default=115, ge=0)
    sector_services: float = Field(default=125, ge=0)
    sector_technology: float = Field(default=140, ge=0)
    sector_energy: float = Field(default=108, ge=0)
    sector_financial: float = Field(default=120, ge=0)
    sector_real_estate: float = Field(default=112, ge=0)
    sector_healthcare: float = Field(default=118, ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "year": 2026, "month": 6,
                "interest_rate": 6.5, "rwf_usd_exchange": 1145,
                "consumer_price_index": 132.5, "unemployment_rate": 15.8,
                "money_supply_bn_rwf": 2100, "trade_balance_mn_rwf": -180,
                "market_volatility": 28,
                "sector_agriculture": 112, "sector_manufacturing": 118,
                "sector_services": 128, "sector_technology": 145,
                "sector_energy": 110, "sector_financial": 122,
                "sector_real_estate": 114, "sector_healthcare": 120
            }
        }


class MarketForecastResponse(BaseModel):
    success: bool
    inflation_rate: float
    gdp_growth: float
    market_sentiment: str
    sentiment_score: int
    recommendations: List[str]
    model_metrics: dict = {}


# ─── SPENDING ANALYTICS (ML-enhanced) ──────────────────────────────────────────
class MLSpendingAnalysisResponse(SpendingAnalysisResponse):
    ai_powered: bool = True
    predicted_spending: float = 0
    is_anomaly: bool = False
    anomaly_score: float = 0
    model_metrics: dict = {}


# ─── RECOMMENDATIONS ──────────────────────────────────────────────────────────
class RecommendationRequest(BaseModel):
    age: int = Field(default=30, ge=18, le=80)
    monthly_income: float = Field(default=300000, ge=0)
    monthly_expenses: float = Field(default=150000, ge=0)
    existing_savings: float = Field(default=0, ge=0)
    debt_payments: float = Field(default=0, ge=0)
    investment_amount: float = Field(default=0, ge=0)
    employment_type: str = Field(default="employed")
    risk_tolerance: str = Field(default="moderate", description="low | moderate | high")
    financial_goals: List[str] = Field(default=["savings"], description="e.g. savings, investment, debt, home, education")

    class Config:
        json_schema_extra = {
            "example": {
                "age": 28,
                "monthly_income": 500000,
                "monthly_expenses": 280000,
                "existing_savings": 200000,
                "debt_payments": 50000,
                "investment_amount": 30000,
                "employment_type": "employed",
                "risk_tolerance": "moderate",
                "financial_goals": ["savings", "investment", "home"]
            }
        }


class RecommendationResponse(BaseModel):
    success: bool
    financial_health_summary: str
    savings_recommendation: dict
    investment_recommendation: dict
    budgeting_recommendation: dict
    sector_recommendations: List[dict]
    priority_actions: List[str]


# ─── RETRAIN ──────────────────────────────────────────────────────────────────
class RetrainResponse(BaseModel):
    success: bool
    message: str
    results: dict = {}

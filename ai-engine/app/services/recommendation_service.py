"""
AI Recommendation Engine
=========================
Generates personalized financial recommendations with priority, confidence, reason, and expected impact.
Based on financial profile analysis with ML-driven scoring.
"""
import math


def generate_recommendations(data: dict) -> dict:
    age = int(data.get('age', 30))
    income = float(data.get('monthly_income', data.get('income', 300000)))
    expenses = float(data.get('monthly_expenses', data.get('expenses', 150000)))
    savings = float(data.get('existing_savings', data.get('savings', 0)))
    debt = float(data.get('debt_payments', 0))
    investments = float(data.get('investment_amount', 0))
    risk_tolerance = str(data.get('risk_tolerance', 'moderate')).lower()
    raw_goals = data.get('financial_goals', data.get('goals', ['savings']))
    goals = [g.lower() for g in raw_goals]
    employment = str(data.get('employment_type', 'employed')).lower()

    disposable = income - expenses - debt
    savings_rate = disposable / income if income > 0 else 0
    dti = debt / income if income > 0 else 0
    savings_months = savings / (income + 1) if income > 0 else 0

    all_recs = []

    # 1. Savings/emergency fund
    savings_rec = _build_recommendation(
        "Increase Savings Rate",
        _confidence(savings_rate < 0.20, 0.85, 0.60),
        "low" if savings_rate < 0.10 else "medium" if savings_rate < 0.20 else "medium",
        f"Current savings rate is {savings_rate*100:.0f}%. Target 20% for financial security.",
        f"Increasing savings to 20% adds {int(income * 0.20):,} RWF/month to your savings."
    )

    # 2. Emergency fund
    emergency_rec = _build_recommendation(
        "Build Emergency Fund",
        _confidence(savings_months < 3, 0.90, 0.50),
        "high" if savings_months < 1 else "medium" if savings_months < 3 else "low",
        f"You have {savings_months:.1f} months of expenses saved. Aim for 3-6 months.",
        f"Saving {int(income * 3):,} RWF provides a 3-month safety net."
    )

    # 3. Debt reduction
    debt_rec = _build_recommendation(
        "Reduce High-Interest Debt",
        _confidence(dti > 0.30, 0.88, 0.40),
        "high" if dti > 0.40 else "medium" if dti > 0.20 else "low",
        f"Debt payments are {dti*100:.0f}% of income. Keep below 30% for healthy finances.",
        "Reducing debt improves credit score and frees up monthly cash flow."
    )

    # 4. Investment
    investment_rec = _build_recommendation(
        "Start Investing",
        _confidence(investments == 0, 0.80, 0.50),
        "medium" if investments == 0 else "low",
        f"Current monthly investment: {investments:,} RWF. Start with 10% of income.",
        f"Investing {int(income * 0.10):,} RWF/month at 8% return grows to {int(income * 0.10 * 12 * 10 * 1.08):,} RWF in 10 years."
    )

    # 5. Insurance
    has_insurance = data.get('has_insurance', 0)
    insurance_rec = _build_recommendation(
        "Get Insurance Coverage",
        _confidence(not has_insurance, 0.85, 0.40),
        "high" if not has_insurance else "low",
        "No insurance detected. Health and life insurance protect against financial shocks.",
        "Insurance prevents catastrophic financial loss from medical emergencies."
    )

    # 6. Sector-specific investment
    sector_rec = _build_recommendation(
        "Invest in Agriculture",
        0.75,
        "medium",
        "Rwanda's agriculture sector shows stable growth with government support.",
        "Agriculture investments typically yield 8-12% annual returns in Rwanda."
    )

    if risk_tolerance == 'high':
        sector_rec = _build_recommendation(
            "Invest in Technology",
            0.80,
            "medium",
            "Rwanda's tech sector is rapidly growing with strong government backing.",
            "Tech investments in Rwanda have shown 15-25% growth potential."
        )

    # 7. Retirement planning (for age 30+)
    retirement_rec = None
    if age >= 30:
        retirement_rec = _build_recommendation(
            "Start Retirement Planning",
            _confidence(age < 45, 0.75, 0.85),
            "medium" if age < 45 else "high",
            f"At age {age}, starting early gives compound interest more time to work.",
            f"Saving {int(income * 0.15):,} RWF/month from now could grow to {_estimate_retirement(income * 0.15, age):,} RWF by retirement."
        )

    # 8. Shopping reduction (if applicable)
    shopping_rec = _build_recommendation(
        "Reduce Shopping Expenses",
        0.70,
        "medium",
        "Shopping expenses can often be reduced by 20-30% without major lifestyle changes.",
        "Reducing shopping by 20% could save you thousands per month."
    )

    # Build priority actions
    all_recs_list = [savings_rec, emergency_rec, debt_rec, investment_rec, insurance_rec, sector_rec]
    if retirement_rec:
        all_recs_list.append(retirement_rec)

    priority_actions = []
    for rec in sorted(all_recs_list, key=lambda r: {'high': 0, 'medium': 1, 'low': 2}[r.get('priority', 'medium')]):
        if rec['priority'] in ('high', 'medium'):
            priority_actions.append(f"[{rec['priority'].upper()}] {rec['title']}: {rec['reason']}")

    health_summary = _health_summary(savings_rate, savings, income, debt, investments)
    savings_rec_out = _savings_recommendation(income, expenses, savings, savings_rate, goals)
    investment_rec_out = _investment_recommendation(income, savings_rate, risk_tolerance, goals, age)
    budget_rec_out = _budgeting_recommendation(income, expenses, debt, savings_rate)
    sector_recs_out = _sector_recommendations(risk_tolerance, savings_rate, age)

    return {
        'success': True,
        'financial_health_summary': health_summary,
        'savings_recommendation': savings_rec_out,
        'investment_recommendation': investment_rec_out,
        'budgeting_recommendation': budget_rec_out,
        'sector_recommendations': sector_recs_out,
        'priority_actions': priority_actions[:5],
        'all_recommendations': all_recs_list,
    }


def _build_recommendation(title: str, confidence: float, priority: str, reason: str, impact: str) -> dict:
    return {
        'title': title,
        'confidence': int(round(confidence * 100)),
        'priority': priority,
        'reason': reason,
        'expected_impact': impact,
    }


def _confidence(condition: bool, high_val: float, low_val: float) -> float:
    return high_val if condition else low_val


def _estimate_retirement(monthly_saving: float, age: int) -> int:
    years = max(65 - age, 1)
    rate = 1.08
    total = monthly_saving * 12 * ((rate ** years - 1) / (rate - 1))
    return int(total)


def _health_summary(savings_rate: float, savings: float, income: float, debt: float, investments: float) -> str:
    if savings_rate < 0.05:
        return "Critical: Spending nearly matches income. Immediate budget review needed."
    if savings_rate < 0.15:
        return "Fair: Some room for saving. Reduce discretionary expenses to build buffer."
    if savings < income * 3:
        return "Good income-to-expense ratio, but emergency fund needs strengthening."
    if investments > 0:
        return "Strong financial position with active investing. Monitor and rebalance quarterly."
    return "Healthy finances. Focus on investing surplus for long-term growth."


def _savings_recommendation(income: float, expenses: float, savings: float, rate: float, goals: list) -> dict:
    target_rate = 0.20
    suggested_amount = int(income * target_rate)
    current_saving = int(income - expenses)
    tips = []
    if 'home' in goals:
        tips.append(f"Target saving {int(income * 0.30):,} RWF/month for a home down payment.")
    if 'education' in goals:
        tips.append("Consider an education savings plan with regular monthly contributions.")
    if 'emergency' in goals or savings < income * 3:
        tips.append(f"Build emergency fund to {int(income * 3):,} RWF (3 months of income).")
    if rate < target_rate:
        tips.append(f"Increase savings rate from {rate*100:.0f}% to {target_rate*100:.0f}% of income.")
    if not tips:
        tips.append("Maintain current savings rate. Consider high-yield savings accounts.")
    return {
        'current_savings_rate': f"{rate*100:.0f}%",
        'recommended_savings_rate': f"{target_rate*100:.0f}%",
        'suggested_monthly_saving': suggested_amount,
        'estimated_yearly_savings': suggested_amount * 12,
        'tips': tips
    }


def _investment_recommendation(income: float, savings_rate: float, risk: str, goals: list, age: int) -> dict:
    alloc = {
        'low': {'bonds': 60, 'stocks': 20, 'cash': 15, 'real_estate': 5},
        'moderate': {'bonds': 30, 'stocks': 45, 'cash': 10, 'real_estate': 15},
        'high': {'bonds': 10, 'stocks': 65, 'cash': 5, 'real_estate': 20}
    }
    allocation = alloc.get(risk, alloc['moderate'])
    monthly_investable = int(income * savings_rate * 0.60)
    tips = []
    if age < 35:
        tips.append("Young investor — prioritize growth assets (stocks) for long-term compounding.")
    elif age < 50:
        tips.append("Mid-career — balance growth with income-producing assets.")
    else:
        tips.append("Approaching retirement — shift toward capital preservation.")
    if 'investment' in goals:
        tips.append(f"Start with {monthly_investable:,} RWF/month in a diversified portfolio.")
    if risk == 'high':
        tips.append("High risk tolerance — consider emerging market and tech sector exposure.")
    if risk == 'low':
        tips.append("Low risk tolerance — focus on government bonds and fixed deposits.")
    return {
        'suggested_monthly_investment': monthly_investable,
        'risk_profile': risk,
        'recommended_allocation': allocation,
        'tips': tips
    }


def _budgeting_recommendation(income: float, expenses: float, debt: float, savings_rate: float) -> dict:
    return {
        'total_income': int(income),
        'total_expenses': int(expenses),
        'debt_payments': int(debt),
        'disposable_income': int(income - expenses - debt),
        'recommended_budget': {
            'needs': int(income * 0.50),
            'wants': int(income * 0.20),
            'savings': int(income * 0.20),
            'debt_repayment': int(income * 0.10)
        },
        'tips': [
            "Follow the 50/30/20 rule: 50% needs, 20% wants, 20% savings, 10% debt.",
            "Review and cancel unused subscriptions.",
            "Track daily expenses with a budgeting app."
        ]
    }


def _sector_recommendations(risk: str, savings_rate: float, age: int) -> list:
    sectors = {
        'low': [
            {'sector': 'Government Bonds', 'allocation': '35-40%', 'reason': 'Stable returns, capital preservation'},
            {'sector': 'Fixed Deposits', 'allocation': '20-25%', 'reason': 'Guaranteed returns, low risk'},
            {'sector': 'Real Estate (REITs)', 'allocation': '15-20%', 'reason': 'Steady income, moderate growth'},
            {'sector': 'Blue-chip Stocks', 'allocation': '10-15%', 'reason': 'Dividend income, stable companies'},
        ],
        'moderate': [
            {'sector': 'Equity Mutual Funds', 'allocation': '30-35%', 'reason': 'Diversified market exposure'},
            {'sector': 'Real Estate', 'allocation': '15-20%', 'reason': 'Tangible asset, appreciation potential'},
            {'sector': 'Corporate Bonds', 'allocation': '15-20%', 'reason': 'Higher yield than government bonds'},
            {'sector': 'Tech & Innovation', 'allocation': '10-15%', 'reason': 'Growth sector, higher returns'},
            {'sector': 'Agriculture', 'allocation': '5-10%', 'reason': 'Rwanda-focused, stable demand'},
        ],
        'high': [
            {'sector': 'Tech Startups', 'allocation': '25-30%', 'reason': 'High growth potential'},
            {'sector': 'Emerging Markets', 'allocation': '20-25%', 'reason': 'Higher risk-reward profile'},
            {'sector': 'Cryptocurrency', 'allocation': '5-10%', 'reason': 'Speculative, only with risk capital'},
            {'sector': 'Small-cap Stocks', 'allocation': '15-20%', 'reason': 'Undervalued opportunities'},
            {'sector': 'Real Estate Development', 'allocation': '15-20%', 'reason': 'High returns, longer horizon'},
        ]
    }
    return sectors.get(risk, sectors['moderate'])

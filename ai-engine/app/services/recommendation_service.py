"""
AI Recommendation Engine
========================
Generates personalized financial recommendations for savings, investments,
sector allocations, and budgeting based on user financial profile.
"""


def generate_recommendations(data: dict) -> dict:
    age = int(data.get('age', 30))
    income = float(data.get('monthly_income', 300000))
    expenses = float(data.get('monthly_expenses', 150000))
    savings = float(data.get('existing_savings', 0))
    debt = float(data.get('debt_payments', 0))
    investments = float(data.get('investment_amount', 0))
    risk_tolerance = str(data.get('risk_tolerance', 'moderate')).lower()
    goals = [g.lower() for g in data.get('financial_goals', ['savings'])]

    disposable = income - expenses - debt
    savings_rate = disposable / income if income > 0 else 0

    health_summary = _health_summary(savings_rate, savings, income, debt, investments)

    savings_rec = _savings_recommendation(income, expenses, savings, savings_rate, goals)
    investment_rec = _investment_recommendation(income, savings_rate, risk_tolerance, goals, age)
    budget_rec = _budgeting_recommendation(income, expenses, debt, savings_rate)
    sector_recs = _sector_recommendations(risk_tolerance, savings_rate, age)
    priority_actions = _priority_actions(savings_rate, savings, income, debt, investments, goals)

    return {
        'success': True,
        'financial_health_summary': health_summary,
        'savings_recommendation': savings_rec,
        'investment_recommendation': investment_rec,
        'budgeting_recommendation': budget_rec,
        'sector_recommendations': sector_recs,
        'priority_actions': priority_actions
    }


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
            "Follow the 50/30/20 rule: 50% needs, 30% wants, 20% savings.",
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


def _priority_actions(savings_rate: float, savings: float, income: float, debt: float, investments: float, goals: list) -> list:
    actions = []
    if savings < income:
        actions.append("Build an emergency fund of 3-6 months of expenses.")
    if debt > income * 0.3:
        actions.append("Prioritize high-interest debt repayment before increasing investments.")
    if savings_rate < 0.10:
        actions.append("Reduce non-essential spending to reach 20% savings rate.")
    if investments == 0:
        actions.append("Start investing at least 10% of your income.")
    if 'home' in goals:
        actions.append("Open a dedicated home savings account with automatic monthly transfers.")
    if 'investment' in goals:
        actions.append("Schedule a quarterly portfolio review to rebalance allocations.")
    actions.append("Review financial goals quarterly and adjust strategy as needed.")
    return actions[:5]

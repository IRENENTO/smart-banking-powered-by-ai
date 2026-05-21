"""
Spending Analytics Service
===========================
Analyzes spending patterns, category trends, and generates financial insights.
"""
from collections import defaultdict
from typing import List


def analyze_spending(transactions: List[dict], monthly_income: float) -> dict:
    if not transactions:
        return {
            'success': True,
            'total_spent': 0,
            'monthly_income': monthly_income,
            'savings_rate': 1.0,
            'top_category': 'none',
            'category_breakdown': [],
            'spending_insight': 'No transaction data available.',
            'recommendations': ['Start tracking your expenses to get spending insights.']
        }

    category_totals = defaultdict(float)
    category_counts = defaultdict(int)

    for tx in transactions:
        cat = tx.get('category', 'other').lower()
        amt = float(tx.get('amount', 0))
        category_totals[cat] += amt
        category_counts[cat] += 1

    total_spent = sum(category_totals.values())

    breakdown = []
    for cat, amt in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
        pct = (amt / total_spent * 100) if total_spent > 0 else 0
        breakdown.append({
            'category': cat,
            'amount': round(amt, 2),
            'percentage': round(pct, 1),
            'transaction_count': category_counts[cat]
        })

    top_category = breakdown[0]['category'] if breakdown else 'none'
    savings_rate = max(0, (monthly_income - total_spent) / monthly_income) if monthly_income > 0 else 0

    insights = _generate_insight(top_category, savings_rate, breakdown, monthly_income)
    recommendations = _generate_recommendations(breakdown, savings_rate, monthly_income)

    return {
        'success': True,
        'total_spent': round(total_spent, 2),
        'monthly_income': monthly_income,
        'savings_rate': round(savings_rate, 2),
        'top_category': top_category,
        'category_breakdown': breakdown,
        'spending_insight': insights,
        'recommendations': recommendations
    }


def _generate_insight(top_category: str, savings_rate: float, breakdown: list, income: float) -> str:
    if savings_rate < 0.10:
        return "Your spending is nearly equal to your income. Consider reducing non-essential expenses."
    if savings_rate < 0.20:
        return f"Your savings rate is {savings_rate*100:.0f}%. Your top spending category is '{top_category}'."
    if top_category in ('rent', 'housing'):
        return "Housing is your largest expense. That's normal — keep other categories in check."
    return f"You're saving {savings_rate*100:.0f}% of income. '{top_category}' is your top spending category."


def _generate_recommendations(breakdown: list, savings_rate: float, income: float) -> list:
    recs = []
    cat_map = {b['category']: b['amount'] for b in breakdown}

    if cat_map.get('entertainment', 0) > income * 0.10:
        recs.append("Entertainment spending is high (>10% of income). Consider reducing to 5%.")
    if cat_map.get('food', 0) > income * 0.20:
        recs.append("Food expenses exceed 20% of income. Meal planning can help reduce costs.")
    if cat_map.get('shopping', 0) > income * 0.15:
        recs.append("Shopping expenses are elevated. Try a 48-hour rule before non-essential purchases.")
    if savings_rate < 0.10:
        recs.append("Target a 20% savings rate. Review subscriptions and recurring charges.")
    if savings_rate >= 0.20:
        recs.append("Great savings rate! Consider investing surplus in diversified instruments.")
    if len(breakdown) <= 2:
        recs.append("Categorize your transactions better for more detailed spending insights.")
    if not recs:
        recs.append("Your spending habits appear balanced. Continue monitoring monthly trends.")
    return recs

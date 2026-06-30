"""
Spending Analytics Service
===========================
Analyzes spending patterns, category trends, and generates AI-powered financial insights.
Falls back to rule-based logic when ML model unavailable.
"""
from collections import defaultdict
from typing import List
import numpy as np


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
            'recommendations': ['Start tracking your expenses to get spending insights.'],
            'ai_powered': False,
        }

    category_totals = defaultdict(float)
    category_counts = defaultdict(int)
    monthly_spending = defaultdict(float)
    monthly_category = defaultdict(lambda: defaultdict(float))

    for tx in transactions:
        cat = tx.get('category', 'other').lower().replace(' ', '_')
        amt = float(tx.get('amount', 0))
        date = str(tx.get('date', ''))
        month = date[:7] if date else 'unknown'

        category_totals[cat] += amt
        category_counts[cat] += 1
        monthly_spending[month] += amt
        monthly_category[month][cat] += amt

    total_spent = sum(category_totals.values())
    num_months = max(len(monthly_spending), 1)
    avg_monthly_spending = total_spent / num_months if num_months > 0 else 0

    breakdown = []
    for cat, amt in sorted(category_totals.items(), key=lambda x: x[1], reverse=True):
        pct = (amt / total_spent * 100) if total_spent > 0 else 0
        breakdown.append({
            'category': cat,
            'amount': round(amt, 2),
            'percentage': round(pct, 1),
            'transaction_count': category_counts[cat],
        })

    top_category = breakdown[0]['category'] if breakdown else 'none'
    savings_rate = max(0, (monthly_income - total_spent) / monthly_income) if monthly_income > 0 else 0
    highest_category_pct = breakdown[0]['percentage'] if breakdown else 0

    insights = _generate_insight(top_category, savings_rate, breakdown, monthly_income, avg_monthly_spending, monthly_category)
    recommendations = _generate_recommendations(breakdown, savings_rate, monthly_income, total_spent, avg_monthly_spending)

    return {
        'success': True,
        'total_spent': round(total_spent, 2),
        'monthly_income': monthly_income,
        'savings_rate': round(savings_rate, 2),
        'top_category': top_category,
        'category_breakdown': breakdown,
        'spending_insight': insights,
        'recommendations': recommendations,
        'ai_powered': False,
        'avg_monthly_spending': round(avg_monthly_spending, 2),
    }


def _generate_insight(top_category: str, savings_rate: float, breakdown: list,
                      income: float, avg_monthly: float,
                      monthly_category: dict) -> str:
    parts = []

    if savings_rate < 0.10:
        parts.append(f"You spend {((1 - savings_rate) * 100):.0f}% of your income on expenses.")
        parts.append("Your spending nearly matches your income — consider reducing non-essential expenses.")
    elif savings_rate < 0.20:
        parts.append(f"You save {savings_rate * 100:.0f}% of your income.")
        parts.append(f"Your top category is '{top_category}' at {breakdown[0]['percentage']:.0f}% of spending.")
    else:
        parts.append(f"Good savings rate of {savings_rate * 100:.0f}%.")
        parts.append(f"'{top_category}' is your highest spending category.")

    # Month-over-month comparison
    sorted_months = sorted(monthly_category.keys())
    if len(sorted_months) >= 2:
        last_month = sorted_months[-1]
        prev_month = sorted_months[-2]
        last_total = sum(monthly_category[last_month].values())
        prev_total = sum(monthly_category[prev_month].values())
        if prev_total > 0:
            change = ((last_total - prev_total) / prev_total) * 100
            if abs(change) > 5:
                direction = "increased" if change > 0 else "decreased"
                parts.append(f"Monthly spending {direction} by {abs(change):.0f}% compared to previous month.")

    # Category-specific insights
    for b in breakdown:
        if b['percentage'] > 35:
            parts.append(f"You spend {b['percentage']:.0f}% of your income on {b['category']}.")
            if b['category'] in ('food', 'food_dining'):
                parts.append("Consider meal planning to reduce food costs.")
            elif b['category'] in ('entertainment', 'entertainment_leisure'):
                parts.append("Look for free or low-cost entertainment alternatives.")
            elif b['category'] in ('transport', 'transport_fuel'):
                parts.append("Consider public transport or carpooling to save on transport.")
        elif b['percentage'] > 20 and b['category'] == 'shopping':
            parts.append("Shopping expenses are elevated. Try a 48-hour wait before non-essential purchases.")

    if breakdown and breakdown[0]['percentage'] > 50:
        parts.append(f"'{top_category}' dominates your spending at {breakdown[0]['percentage']:.0f}%.")

    return ' '.join(parts) if parts else "Your spending patterns appear balanced."


def _generate_recommendations(breakdown: list, savings_rate: float, income: float,
                             total_spent: float, avg_monthly: float) -> list:
    recs = []
    cat_map = {b['category']: b['percentage'] for b in breakdown}

    if cat_map.get('entertainment', 0) > 10:
        recs.append("Entertainment spending is high. Consider reducing to save more.")
    if cat_map.get('food', 0) > 20:
        recs.append("Food expenses exceed 20% of spending. Meal planning can help reduce costs.")
    if cat_map.get('shopping', 0) > 15:
        recs.append("Shopping expenses are elevated. Try a 48-hour rule before non-essential purchases.")
    if cat_map.get('transport', 0) > 15:
        recs.append("Transportation costs are above average. Consider public transport options.")

    if savings_rate < 0.10:
        recs.append("Target a 20% savings rate. Review subscriptions and recurring charges.")
    elif savings_rate >= 0.20:
        recs.append("Great savings rate! Consider investing surplus in diversified instruments.")

    if total_spent > avg_monthly * 1.3:
        recs.append(f"Your spending is above your monthly average. Review recent large transactions.")

    if len(breakdown) <= 2:
        recs.append("Categorize your transactions better for more detailed spending insights.")

    if not recs:
        recs.append("Your spending habits appear balanced. Continue monitoring monthly trends.")

    return recs

# -*- coding: utf-8 -*-
"""
Generate synthetic datasets for AI model training.
Run this once to create the CSV files needed for training.
"""
import numpy as np
import pandas as pd
import os

np.random.seed(42)
N = 5000  # samples per dataset

DATASETS_DIR = os.path.dirname(os.path.abspath(__file__))


# ─── LOAN DATASET ────────────────────────────────────────────────────────────
def generate_loan_dataset():
    ages = np.random.randint(20, 65, N)
    monthly_income = np.random.randint(50000, 2000000, N)          # RWF
    loan_amount = np.random.randint(50000, 5000000, N)             # RWF
    duration_months = np.random.choice([6, 12, 18, 24, 36, 48, 60], N)
    existing_debt = np.random.randint(0, 1000000, N)               # RWF
    num_dependents = np.random.randint(0, 6, N)
    employment_type = np.random.choice(
        ['employed', 'self_employed', 'unemployed', 'student'], N,
        p=[0.55, 0.25, 0.10, 0.10]
    )
    education = np.random.choice(
        ['primary', 'secondary', 'tertiary', 'none'], N,
        p=[0.20, 0.30, 0.40, 0.10]
    )
    credit_history = np.random.choice([0, 1], N, p=[0.30, 0.70])  # 1=good
    collateral = np.random.choice([0, 1], N, p=[0.50, 0.50])

    # Approval logic (realistic rules)
    dti = existing_debt / (monthly_income + 1)
    lti = loan_amount / (monthly_income * duration_months + 1)
    approved = (
        (dti < 0.45) &
        (lti < 2.0) &
        (credit_history == 1) &
        (employment_type != 'unemployed') &
        (monthly_income > 100000)
    ).astype(int)

    # Add noise
    flip = np.random.rand(N) < 0.05
    approved[flip] = 1 - approved[flip]

    df = pd.DataFrame({
        'age': ages,
        'monthly_income': monthly_income,
        'loan_amount': loan_amount,
        'duration_months': duration_months,
        'existing_debt': existing_debt,
        'num_dependents': num_dependents,
        'employment_type': employment_type,
        'education': education,
        'credit_history': credit_history,
        'collateral': collateral,
        'approved': approved
    })
    path = os.path.join(DATASETS_DIR, 'loan_dataset.csv')
    df.to_csv(path, index=False)
    print("[OK] loan_dataset.csv saved -- {} rows, {:.1%} approval rate".format(len(df), df['approved'].mean()))


# ─── FRAUD DATASET ───────────────────────────────────────────────────────────
def generate_fraud_dataset():
    amounts = np.random.exponential(scale=100000, size=N)
    hour_of_day = np.random.randint(0, 24, N)
    day_of_week = np.random.randint(0, 7, N)
    transaction_count_24h = np.random.randint(1, 30, N)
    distance_from_home = np.random.exponential(scale=20, size=N)
    is_international = np.random.choice([0, 1], N, p=[0.85, 0.15])
    account_age_days = np.random.randint(1, 3650, N)
    avg_tx_amount = np.random.exponential(scale=80000, size=N)
    device_change = np.random.choice([0, 1], N, p=[0.90, 0.10])

    # Fraud labels (~3% fraud — realistic imbalance)
    is_fraud = np.zeros(N, dtype=int)
    fraud_prob = (
        0.01 +
        0.05 * (amounts > avg_tx_amount * 5) +
        0.10 * (hour_of_day < 4) +
        0.08 * (transaction_count_24h > 15) +
        0.12 * (is_international == 1) +
        0.07 * (account_age_days < 30) +
        0.06 * device_change
    )
    is_fraud = (np.random.rand(N) < fraud_prob).astype(int)

    df = pd.DataFrame({
        'amount': amounts,
        'hour_of_day': hour_of_day,
        'day_of_week': day_of_week,
        'transaction_count_24h': transaction_count_24h,
        'distance_from_home': distance_from_home,
        'is_international': is_international,
        'account_age_days': account_age_days,
        'avg_tx_amount': avg_tx_amount,
        'device_change': device_change,
        'is_fraud': is_fraud
    })
    path = os.path.join(DATASETS_DIR, 'fraud_dataset.csv')
    df.to_csv(path, index=False)
    print("[OK] fraud_dataset.csv saved -- {} rows, {:.1%} fraud rate".format(len(df), df['is_fraud'].mean()))


# ─── SAVINGS DATASET ─────────────────────────────────────────────────────────
def generate_savings_dataset():
    ages = np.random.randint(18, 65, N)
    monthly_income = np.random.randint(50000, 2000000, N)
    monthly_expenses = monthly_income * np.random.uniform(0.3, 0.95, N)
    num_dependents = np.random.randint(0, 6, N)
    existing_savings = np.random.randint(0, 5000000, N)
    debt_payments = np.random.randint(0, 500000, N)
    investment_amount = np.random.randint(0, 300000, N)
    employment_type = np.random.choice(
        ['employed', 'self_employed', 'unemployed', 'student'], N,
        p=[0.55, 0.25, 0.10, 0.10]
    )
    has_insurance = np.random.choice([0, 1], N, p=[0.60, 0.40])

    # Financial health score (0–100)
    disposable = monthly_income - monthly_expenses - debt_payments
    savings_rate = np.clip(disposable / (monthly_income + 1), 0, 1)
    debt_ratio = np.clip(debt_payments / (monthly_income + 1), 0, 1)

    health_score = (
        40 * savings_rate +
        20 * (1 - debt_ratio) +
        10 * (existing_savings / (monthly_income * 6 + 1)).clip(0, 1) +
        10 * has_insurance +
        10 * (investment_amount > 0).astype(float) +
        10 * ((age := ages) > 25).astype(float) / (num_dependents + 1)
    )
    health_score = np.clip(health_score * 100, 0, 100).astype(int)

    # Recommended monthly saving
    recommended_saving = np.clip(disposable * 0.20, 0, monthly_income * 0.50).astype(int)

    df = pd.DataFrame({
        'age': ages,
        'monthly_income': monthly_income,
        'monthly_expenses': monthly_expenses.astype(int),
        'num_dependents': num_dependents,
        'existing_savings': existing_savings,
        'debt_payments': debt_payments,
        'investment_amount': investment_amount,
        'employment_type': employment_type,
        'has_insurance': has_insurance,
        'financial_health_score': health_score,
        'recommended_monthly_saving': recommended_saving
    })
    path = os.path.join(DATASETS_DIR, 'savings_dataset.csv')
    df.to_csv(path, index=False)
    print("[OK] savings_dataset.csv saved -- {} rows, avg health score: {:.1f}".format(len(df), df['financial_health_score'].mean()))


# ─── SPENDING ANALYSIS DATASET ────────────────────────────────────────────────
def generate_spending_dataset():
    """
    Generates a synthetic spending transaction dataset with clearly defined
    categories suitable for dissertation-level spending analysis and charts.
    Categories: Food & Dining, Transport & Fuel, Housing & Rent, Utilities & Bills,
    Healthcare, Education, Entertainment & Leisure, Shopping & Retail,
    Mobile & Communication, Insurance, Savings & Investments, Other.
    """
    n = 10000
    categories = [
        'food_dining', 'transport_fuel', 'housing_rent', 'utilities_bills',
        'healthcare', 'education', 'entertainment_leisure', 'shopping_retail',
        'mobile_communication', 'insurance', 'savings_investments', 'other'
    ]
    cat_weights = [0.18, 0.12, 0.20, 0.10, 0.06, 0.05, 0.07, 0.09, 0.04, 0.03, 0.03, 0.03]
    cat_labels = np.random.choice(categories, n, p=cat_weights)

    # Map each category to a realistic amount range (RWF)
    amount_ranges = {
        'food_dining': (2000, 80000),
        'transport_fuel': (1000, 60000),
        'housing_rent': (50000, 350000),
        'utilities_bills': (5000, 120000),
        'healthcare': (5000, 200000),
        'education': (10000, 300000),
        'entertainment_leisure': (3000, 100000),
        'shopping_retail': (2000, 150000),
        'mobile_communication': (1000, 40000),
        'insurance': (10000, 80000),
        'savings_investments': (5000, 200000),
        'other': (500, 50000)
    }

    amounts = np.array([
        np.random.randint(low, high+1)
        for low, high in [amount_ranges[c] for c in cat_labels]
    ])

    months = np.random.choice(range(1, 13), n)
    days = np.random.choice(range(1, 29), n)
    years = np.random.choice([2025, 2026], n, p=[0.3, 0.7])
    dates = [f"{y}-{m:02d}-{d:02d}" for y, m, d in zip(years, months, days)]

    # Income per user (for savings rate calculation)
    monthly_income = np.random.randint(150000, 1500000, n)

    # Payment methods
    payment_methods = np.random.choice(
        ['mobile_money', 'card', 'cash', 'bank_transfer'],
        n, p=[0.35, 0.25, 0.25, 0.15]
    )

    # Merchant / description hints per category
    merchants_map = {
        'food_dining': ['Nakumatt', 'Shoprite', 'Local Market', 'Restaurant', 'Cafe', 'Food Delivery'],
        'transport_fuel': ['Shell Station', 'TotalEnergies', 'Bus Terminal', 'Taxi', 'Ride Share', 'Fuel Depot'],
        'housing_rent': ['Landlord Payment', 'Rent Monthly', 'Property Manager', 'Lease Payment'],
        'utilities_bills': ['RECO Rwanda', 'EWSA Water', 'Internet Provider', 'Electricity Board', 'Waste Management'],
        'healthcare': ['Pharmacy', 'Clinic Visit', 'Hospital Payment', 'Health Insurance', 'Lab Test'],
        'education': ['School Fees', 'Tuition Payment', 'Bookstore', 'Online Course', 'Training Center'],
        'entertainment_leisure': ['Cinema', 'Concert', 'Sports Club', 'Streaming Service', 'Weekend Getaway'],
        'shopping_retail': ['Clothing Store', 'Electronics Shop', 'Department Store', 'Online Shopping', 'Supermarket'],
        'mobile_communication': ['Airtime Top-Up', 'Data Bundle', 'Mobile Money Fee', 'Phone Bill'],
        'insurance': ['Life Insurance Premium', 'Auto Insurance', 'Health Insurance', 'Property Insurance'],
        'savings_investments': ['Savings Deposit', 'Stock Purchase', 'Mutual Fund', 'Treasury Bond', 'Retirement Fund'],
        'other': ['ATM Fee', 'Service Charge', 'Donation', 'Gift', 'Miscellaneous']
    }

    descriptions = []
    for cat in cat_labels:
        merchants = merchants_map[cat]
        descriptions.append(np.random.choice(merchants))

    # Spend category (daily/sporadic)
    spend_category = np.where(
        np.isin(cat_labels, ['housing_rent', 'utilities_bills', 'insurance']),
        'recurring', 'variable'
    )

    df = pd.DataFrame({
        'transaction_id': [f'TX{i:06d}' for i in range(1, n+1)],
        'date': dates,
        'year': years,
        'month': months,
        'day': days,
        'category': cat_labels,
        'category_label': [c.replace('_', ' ').title() for c in cat_labels],
        'amount_rwf': amounts,
        'description': descriptions,
        'payment_method': payment_methods,
        'monthly_income': monthly_income,
        'spend_type': spend_category,
        'is_expense': 1,
    })

    path = os.path.join(DATASETS_DIR, 'spending_dataset.csv')
    df.to_csv(path, index=False)
    print("[OK] spending_dataset.csv saved -- {} rows, {} categories".format(
        len(df), df['category_label'].nunique()))
    print("    Categories: {}".format(', '.join(sorted(df['category_label'].unique()))))


# ─── MARKET DATASET ────────────────────────────────────────────────────────────
def generate_market_dataset():
    """
    Generates a synthetic monthly economic/financial market dataset for Rwanda/East Africa.
    Features: inflation, GDP growth, interest rate, exchange rate, CPI, unemployment,
    sector performance, and derived market indicators.
    """
    n = 72  # 6 years of monthly data (2020–2025)
    months = []
    for year in range(2020, 2026):
        for month in range(1, 13):
            months.append(f"{year}-{month:02d}")

    # Base economic trends with realistic Rwanda ranges
    base_inflation = np.random.uniform(1.5, 3.5, 1)[0]
    base_gdp = np.random.uniform(2.0, 4.0, 1)[0]
    base_rate = np.random.uniform(4.5, 6.5, 1)[0]
    base_exchange = np.random.uniform(1020, 1080, 1)[0]

    inflation_rates = []
    gdp_growths = []
    interest_rates = []
    exchange_rates = []
    cpi_values = []
    unemployment_rates = []
    money_supply = []
    trade_balance = []

    cpi = 100.0
    for i in range(n):
        # Inflation with seasonal and trend components
        seasonal = 0.5 * np.sin(2 * np.pi * i / 12)
        trend = 0.03 * i
        noise = np.random.normal(0, 0.5)
        infl = max(0.5, base_inflation + seasonal + noise + trend * 0.02)
        inflation_rates.append(round(infl, 2))

        # GDP growth (annualized quarterly)
        gdp = max(-2.0, min(8.0, base_gdp + np.random.normal(0, 1.0) + 0.5 * np.sin(2 * np.pi * i / 4)))
        gdp_growths.append(round(gdp, 2))

        # Central bank interest rate (reacts to inflation)
        rate = max(3.0, min(12.0, base_rate + (infl - 3.0) * 0.3 + np.random.normal(0, 0.3)))
        interest_rates.append(round(rate, 2))

        # RWF/USD exchange rate (gradual depreciation + volatility)
        exch = base_exchange + i * 2.5 + np.random.normal(0, 15)
        exchange_rates.append(round(max(900, exch), 2))

        # CPI (cumulative)
        cpi *= (1 + infl / 100 / 12)
        cpi_values.append(round(cpi, 2))

        # Unemployment rate
        unemp = max(5.0, min(25.0, 16.0 + np.random.normal(0, 0.8) - gdp * 0.2))
        unemployment_rates.append(round(unemp, 2))

        # Money supply (M3) in billions RWF
        ms = 1500 + i * 15 + np.random.normal(0, 50)
        money_supply.append(round(ms, 2))

        # Trade balance in millions RWF (negative = deficit)
        tb = -np.random.uniform(50, 300) + np.random.normal(0, 30) + gdp * 10
        trade_balance.append(round(tb, 2))

    # Sector performance indices (base 100 at start)
    sectors = {
        'agriculture':    100 + np.cumsum(np.random.normal(0.3, 1.5, n)),
        'manufacturing':  100 + np.cumsum(np.random.normal(0.5, 2.0, n)),
        'services':       100 + np.cumsum(np.random.normal(0.8, 1.8, n)),
        'technology':     100 + np.cumsum(np.random.normal(1.5, 3.0, n)),
        'energy':         100 + np.cumsum(np.random.normal(0.4, 2.5, n)),
        'financial':      100 + np.cumsum(np.random.normal(0.6, 1.5, n)),
        'real_estate':    100 + np.cumsum(np.random.normal(0.3, 2.0, n)),
        'healthcare':     100 + np.cumsum(np.random.normal(0.7, 1.2, n)),
    }

    # Market sentiment (0=very negative, 100=very positive)
    sentiment = np.clip(
        50 + (np.array(inflation_rates) - base_inflation) * (-5) +
        (np.array(gdp_growths) - base_gdp) * 8 +
        np.random.normal(0, 8, n),
        0, 100
    ).astype(int)

    # Market volatility index
    volatility = np.clip(
        15 + np.abs(np.array(inflation_rates) - 4) * 3 +
        np.abs(np.array(gdp_growths) - 3) * 2 +
        np.random.exponential(3, n),
        5, 80
    ).astype(int)

    rows = []
    for i in range(n):
        row = {
            'date': months[i],
            'year': int(months[i][:4]),
            'month': int(months[i][5:7]),
            'inflation_rate': inflation_rates[i],
            'gdp_growth': gdp_growths[i],
            'interest_rate': interest_rates[i],
            'rwf_usd_exchange': exchange_rates[i],
            'consumer_price_index': cpi_values[i],
            'unemployment_rate': unemployment_rates[i],
            'money_supply_bn_rwf': money_supply[i],
            'trade_balance_mn_rwf': trade_balance[i],
            'market_sentiment': sentiment[i],
            'market_volatility': volatility[i],
        }
        for sector, values in sectors.items():
            row[f'sector_{sector}'] = round(values[i], 2)
        rows.append(row)

    df = pd.DataFrame(rows)
    path = os.path.join(DATASETS_DIR, 'market_dataset.csv')
    df.to_csv(path, index=False)
    print(f"[OK] market_dataset.csv saved -- {len(df)} rows, {len(sectors)} sectors")
    print(f"    Inflation range: {df['inflation_rate'].min():.1f}% - {df['inflation_rate'].max():.1f}%")
    print(f"    GDP growth range: {df['gdp_growth'].min():.1f}% - {df['gdp_growth'].max():.1f}%")
    return df


if __name__ == '__main__':
    print("[*] Generating synthetic datasets...")
    generate_loan_dataset()
    generate_fraud_dataset()
    generate_savings_dataset()
    generate_spending_dataset()
    generate_market_dataset()
    print("\n[DONE] All datasets generated successfully!")


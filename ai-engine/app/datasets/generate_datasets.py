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


if __name__ == '__main__':
    print("[*] Generating synthetic datasets...")
    generate_loan_dataset()
    generate_fraud_dataset()
    generate_savings_dataset()
    print("\n[DONE] All datasets generated successfully!")


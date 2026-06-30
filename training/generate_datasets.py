import pandas as pd
import numpy as np
import os

np.random.seed(42)
OUT = os.path.dirname(os.path.abspath(__file__))

# ===== LOAN DATASET =====
# Columns: income, expenses, savings, loan_amount, credit_score -> loan_status
n = 10000
income = np.random.uniform(100000, 3000000, n)
expenses = income * np.random.uniform(0.2, 0.9, n)
savings = income * np.random.uniform(0, 3, n)
loan_amount = np.random.uniform(50000, 10000000, n)
credit_score = np.clip(np.random.normal(650, 100, n).astype(int), 300, 850)

# loan_status: 1 = approved, 0 = rejected
# Logic: higher income, lower expenses, higher savings, higher credit_score -> more likely approved
dti = expenses / (income + 1)
ltv = loan_amount / (income * 0.3 * 12 + savings + 1)
score = (
    (credit_score / 850) * 0.35 +
    (1 - np.clip(dti, 0, 1)) * 0.25 +
    np.clip(savings / (income + 1), 0, 5) / 5 * 0.20 +
    (1 - np.clip(ltv, 0, 1)) * 0.20
)
prob = np.clip(score + np.random.normal(0, 0.12, n), 0, 0.99)
loan_status = (prob > 0.55).astype(int)

loan_df = pd.DataFrame({
    'income': income.round(2),
    'expenses': expenses.round(2),
    'savings': savings.round(2),
    'loan_amount': loan_amount.round(2),
    'credit_score': credit_score,
    'loan_status': loan_status
})
loan_path = os.path.join(OUT, 'loan_dataset.csv')
loan_df.to_csv(loan_path, index=False)
print(f"Loan dataset: {loan_path} ({n} rows, {loan_status.mean():.1%} approved)")

# ===== FRAUD DATASET =====
# Columns: transaction_amount, location, device, time, frequency -> is_fraud
n = 10000
amount = np.random.uniform(500, 5000000, n)
locations = ['Kigali', 'Butare', 'Gisenyi', 'Rubavu', 'Musanze', 'Nyagatare', 'International']
devices = ['mobile', 'web', 'atm', 'pos', 'unknown']
location = np.random.choice(locations, n, p=[0.4, 0.15, 0.1, 0.1, 0.1, 0.1, 0.05])
device = np.random.choice(devices, n, p=[0.4, 0.3, 0.1, 0.1, 0.1])
time = np.random.randint(0, 24, n)
frequency = np.random.poisson(3, n)

# Fraud indicators: high amount, international, unusual hour, high freq, unknown device
fraud_prob = (
    (amount > 2000000).astype(int) * 0.25 +
    (location == 'International').astype(int) * 0.20 +
    ((time < 4) | (time > 22)).astype(int) * 0.15 +
    (frequency > 10).astype(int) * 0.20 +
    (device == 'unknown').astype(int) * 0.20
)
fraud_prob = np.clip(fraud_prob + np.random.uniform(0, 0.15, n), 0, 0.99)
is_fraud = (fraud_prob > 0.50).astype(int)

fraud_df = pd.DataFrame({
    'transaction_amount': amount.round(2),
    'location': location,
    'device': device,
    'time': time,
    'frequency': frequency,
    'is_fraud': is_fraud
})
fraud_path = os.path.join(OUT, 'fraud_dataset.csv')
fraud_df.to_csv(fraud_path, index=False)
print(f"Fraud dataset: {fraud_path} ({n} rows, {is_fraud.mean():.1%} fraudulent)")

# ===== MARKET DATASET =====
# Columns for Rwanda market sectors
n = 120  # 10 years monthly
dates = pd.date_range(start='2016-01-01', periods=n, freq='ME')
years = dates.year
months = dates.month

# Sector indices (base 100 at 2016)
sectors = {
    'Agriculture': 100 + np.cumsum(np.random.normal(0.5, 1.5, n)),
    'Technology': 100 + np.cumsum(np.random.normal(1.5, 2.5, n)),
    'Real_Estate': 100 + np.cumsum(np.random.normal(0.8, 1.0, n)),
    'Manufacturing': 100 + np.cumsum(np.random.normal(0.6, 1.2, n)),
    'Retail': 100 + np.cumsum(np.random.normal(0.4, 1.5, n)),
    'Tourism': 100 + np.cumsum(np.random.normal(0.3, 2.5, n)),
    'Transport': 100 + np.cumsum(np.random.normal(0.5, 1.0, n)),
    'Energy': 100 + np.cumsum(np.random.normal(0.7, 1.3, n)),
}

# Macro indicators
inflation = np.clip(2 + np.random.normal(0, 0.8, n).cumsum() * 0.05, 0, 15)
gdp_growth = np.clip(4 + np.random.normal(0, 0.6, n).cumsum() * 0.03, -2, 10)
interest_rate = np.clip(6 + np.random.normal(0, 0.3, n).cumsum() * 0.04, 3, 12)
exchange_rate = np.clip(950 + np.random.normal(0, 5, n).cumsum(), 800, 1500)

# Trend: 0=declining, 1=stable, 2=growing
# Return: expected return %
# Risk: 0=low, 1=medium, 2=high
# Growth: 0=low, 1=medium, 2=high

market_data = {
    'date': dates.strftime('%Y-%m'),
    'year': years,
    'month': months,
    'inflation_rate': inflation.round(2),
    'gdp_growth': gdp_growth.round(2),
    'interest_rate': interest_rate.round(2),
    'rwf_usd_exchange': exchange_rate.round(2),
}
for sector, values in sectors.items():
    market_data[f'{sector}_index'] = values.round(2)

market_df = pd.DataFrame(market_data)
market_path = os.path.join(OUT, 'market_dataset.csv')
market_df.to_csv(market_path, index=False)
print(f"Market dataset: {market_path} ({n} rows)")
print(f"  Sectors: {', '.join(sectors.keys())}")

print("\nDatasets generated successfully!")

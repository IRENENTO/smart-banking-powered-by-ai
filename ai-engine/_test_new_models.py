"""Quick test script for the new market and spending models."""
import uvicorn, threading, time, httpx, sys


def start():
    uvicorn.run('app.main:app', host='127.0.0.1', port=8000, log_level='error')


t = threading.Thread(target=start, daemon=True)
t.start()
for _ in range(10):
    time.sleep(1)
    try:
        httpx.get('http://127.0.0.1:8000/', timeout=1)
        break
    except:
        pass
base = 'http://127.0.0.1:8000/api/ai'
headers = {'X-API-Key': 'dev-key-change-in-production'}

# Test market forecast
print("=== Market Forecast ===")
r = httpx.post(f'{base}/market-forecast', json={
    'year': 2026, 'month': 6, 'interest_rate': 6.5, 'rwf_usd_exchange': 1145,
    'consumer_price_index': 132, 'unemployment_rate': 16, 'money_supply_bn_rwf': 2000,
    'trade_balance_mn_rwf': -150, 'market_volatility': 25,
    'sector_agriculture': 110, 'sector_manufacturing': 115, 'sector_services': 125,
    'sector_technology': 140, 'sector_energy': 108, 'sector_financial': 120,
    'sector_real_estate': 112, 'sector_healthcare': 118,
}, headers=headers, timeout=10)
print(f'  Status: {r.status_code}')
if r.status_code == 200:
    d = r.json()
    print(f'  Inflation: {d["inflation_rate"]}%, GDP: {d["gdp_growth"]}%')
    print(f'  Sentiment: {d["market_sentiment"]}')
    print(f'  Recs: {d["recommendations"][:2]}')

# Test spending analysis (ML)
print("\n=== Spending Analysis (ML) ===")
r2 = httpx.post(f'{base}/spending-analysis', json={
    'transactions': [
        {'amount': 50000, 'category': 'food_dining', 'date': '2026-01-15'},
        {'amount': 200000, 'category': 'housing_rent', 'date': '2026-01-01'},
        {'amount': 30000, 'category': 'transport_fuel', 'date': '2026-01-10'},
        {'amount': 150000, 'category': 'shopping_retail', 'date': '2026-01-20'},
    ],
    'monthly_income': 500000,
}, headers=headers, timeout=10)
print(f'  Status: {r2.status_code}')
if r2.status_code == 200:
    d2 = r2.json()
    print(f'  AI powered: {d2.get("ai_powered")}')
    print(f'  Top category: {d2["top_category"]}')
    print(f'  Total spent: {d2["total_spent"]}')
    print(f'  Anomaly: {d2.get("is_anomaly")}')
    print(f'  Predicted spending: {d2.get("predicted_spending")}')
    print(f'  Insight: {d2["spending_insight"][:100]}')

# Test fallback (no model path scenario — not applicable here since model exists)
print("\n=== Model Status ===")
r3 = httpx.get(f'{base}/model-status', headers=headers, timeout=10)
if r3.status_code == 200:
    d3 = r3.json()
    for name, info in d3['models'].items():
        print(f'  {name}: {"OK" if info["available"] else "MISSING"} ({info["size_kb"]} KB)')

print("\nAll tests passed!" if all(
    r.status_code == 200 for r in [r, r2]
) else "\nSome tests failed!")

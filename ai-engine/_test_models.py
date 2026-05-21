import joblib, os

base = os.path.join(os.path.dirname(__file__), 'app', 'models')
for name in ['loan_model.pkl', 'fraud_model.pkl', 'savings_model.pkl']:
    path = os.path.join(base, name)
    art = joblib.load(path)
    print(f"[OK] {name}: {list(art.keys())}")
    if 'metrics' in art:
        print(f"     metrics: {art['metrics']}")

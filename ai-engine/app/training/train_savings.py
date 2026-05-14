"""
Savings & Financial Health Model Training Pipeline
====================================================
Dataset: savings_dataset.csv
Models: GradientBoostingRegressor (health score) + RandomForestRegressor (savings amount)
Output: app/models/savings_model.pkl
"""
import os
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

# ─── PATHS ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, 'datasets', 'savings_dataset.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'savings_model.pkl')
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)


def load_and_clean(path: str) -> pd.DataFrame:
    print(f"📂 Loading dataset from: {path}")
    df = pd.read_csv(path)
    print(f"   Shape: {df.shape}")
    df.drop_duplicates(inplace=True)
    df.dropna(inplace=True)

    # Encode categoricals
    cat_cols = df.select_dtypes(include=['object']).columns.tolist()
    encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    print(f"   After cleaning: {df.shape}")
    print(f"   Avg financial health score: {df['financial_health_score'].mean():.1f}")
    return df, encoders


def evaluate_regressor(name: str, y_true, y_pred):
    mae   = mean_absolute_error(y_true, y_pred)
    rmse  = np.sqrt(mean_squared_error(y_true, y_pred))
    r2    = r2_score(y_true, y_pred)
    print(f"\n  [{name}]")
    print(f"    MAE  : {mae:.2f}")
    print(f"    RMSE : {rmse:.2f}")
    print(f"    R²   : {r2:.4f}")
    return {'mae': float(mae), 'rmse': float(rmse), 'r2': float(r2)}


def train():
    df, encoders = load_and_clean(DATASET_PATH)

    feature_cols = [
        'age', 'monthly_income', 'monthly_expenses', 'num_dependents',
        'existing_savings', 'debt_payments', 'investment_amount',
        'employment_type', 'has_insurance'
    ]
    target_health  = 'financial_health_score'
    target_savings = 'recommended_monthly_saving'

    X = df[feature_cols]

    # ── Model 1: Financial Health Score ───────────────────────────────────────
    print("\n🤖 Training GradientBoostingRegressor (health score) ...")
    y_health = df[target_health]
    X_tr, X_te, y_tr, y_te = train_test_split(X, y_health, test_size=0.20, random_state=42)

    health_model = GradientBoostingRegressor(
        n_estimators=300,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        random_state=42
    )
    health_model.fit(X_tr, y_tr)
    health_pred = health_model.predict(X_te)
    health_pred = np.clip(health_pred, 0, 100)

    print("\n" + "="*50)
    print("📈 SAVINGS MODEL — EVALUATION METRICS")
    print("="*50)
    health_metrics = evaluate_regressor("Financial Health Score", y_te, health_pred)

    # CV
    cv_r2 = cross_val_score(health_model, X, y_health, cv=5, scoring='r2')
    print(f"    5-Fold CV R²: {cv_r2.mean():.4f} (+/- {cv_r2.std():.4f})")

    # ── Model 2: Recommended Monthly Saving ───────────────────────────────────
    print("\n🤖 Training RandomForestRegressor (savings amount) ...")
    y_saving = df[target_savings]
    X_tr2, X_te2, y_tr2, y_te2 = train_test_split(X, y_saving, test_size=0.20, random_state=42)

    savings_model = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        min_samples_leaf=5,
        random_state=42,
        n_jobs=-1
    )
    savings_model.fit(X_tr2, y_tr2)
    savings_pred = savings_model.predict(X_te2)
    savings_metrics = evaluate_regressor("Recommended Saving", y_te2, savings_pred)

    # Feature importance
    fi = pd.Series(health_model.feature_importances_, index=feature_cols).sort_values(ascending=False)
    print("\n🔑 Top Feature Importances (health score model):")
    print(fi.head(6).to_string())

    # Save
    artifact = {
        'health_model': health_model,
        'savings_model': savings_model,
        'feature_columns': feature_cols,
        'encoders': encoders,
        'metrics': {
            'health_score': health_metrics,
            'savings_amount': savings_metrics
        }
    }
    joblib.dump(artifact, MODEL_PATH)
    print(f"\n✅ Savings model saved → {MODEL_PATH}")
    return artifact


if __name__ == '__main__':
    train()

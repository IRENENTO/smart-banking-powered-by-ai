"""
Spending Analytics Model Training Pipeline
============================================
Dataset: spending_dataset.csv
Models: RandomForestRegressor (category spending prediction) + IsolationForest (anomaly detection)
Output: app/models/spending_model.pkl
"""
import os
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, 'datasets', 'spending_dataset.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'spending_model.pkl')
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

CATEGORIES = [
    'food_dining', 'transport_fuel', 'housing_rent', 'utilities_bills',
    'healthcare', 'education', 'entertainment_leisure', 'shopping_retail',
    'mobile_communication', 'insurance', 'savings_investments', 'other'
]


def load_and_prepare(path: str):
    print(f"Loading dataset from: {path}")
    df = pd.read_csv(path)
    print(f"   Shape: {df.shape}")
    df.drop_duplicates(inplace=True)
    df.dropna(inplace=True)

    # Encode categoricals (keep category as string for pivot, encode payment_method and spend_type)
    encoders = {}
    for col in ['payment_method', 'spend_type']:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    # Aggregate to per-user monthly spending by category
    print("   Aggregating to monthly category-level records ...")
    monthly = df.groupby(['year', 'month', 'monthly_income', 'category', 'spend_type']).agg(
        total_amount=('amount_rwf', 'sum'),
        tx_count=('amount_rwf', 'count'),
        avg_amount=('amount_rwf', 'mean'),
        max_amount=('amount_rwf', 'max'),
    ).reset_index()

    # Pivot categories into columns (using string category names)
    pivot = monthly.pivot_table(
        index=['year', 'month', 'monthly_income'],
        columns='category',
        values=['total_amount', 'tx_count', 'avg_amount'],
        fill_value=0
    )
    pivot.columns = [f'{col[0]}_{col[1]}' for col in pivot.columns]
    pivot.reset_index(inplace=True)

    # Merge back spend_type info
    spend_types = monthly.groupby(['year', 'month', 'monthly_income'])['spend_type'].agg(lambda x: x.mode()[0] if len(x) > 0 else 0).reset_index()
    result = pivot.merge(spend_types, on=['year', 'month', 'monthly_income'])

    result = result.sort_values(['monthly_income', 'year', 'month']).reset_index(drop=True)

    print(f"   After aggregation: {result.shape}")
    return result, encoders


def train():
    df, encoders = load_and_prepare(DATASET_PATH)

    # Feature columns
    cat_amount_cols = [f'total_amount_{c}' for c in CATEGORIES]
    cat_count_cols = [f'tx_count_{c}' for c in CATEGORIES]
    cat_avg_cols = [f'avg_amount_{c}' for c in CATEGORIES]
    feature_cols = ['year', 'month', 'monthly_income'] + cat_amount_cols + cat_count_cols + cat_avg_cols + ['spend_type']

    # Target: total spending
    df['total_spending'] = df[cat_amount_cols].sum(axis=1)

    X = df[feature_cols]
    y = df['total_spending']

    # ── Model 1: Total Spending Prediction ─────────────────────────────────────
    print("\nTraining RandomForestRegressor (spending prediction) ...")
    X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.20, random_state=42)

    spending_model = RandomForestRegressor(
        n_estimators=300, max_depth=12, min_samples_leaf=4, random_state=42, n_jobs=-1
    )
    spending_model.fit(X_tr, y_tr)
    y_pred = spending_model.predict(X_te)

    mae = mean_absolute_error(y_te, y_pred)
    rmse = np.sqrt(mean_squared_error(y_te, y_pred))
    r2 = r2_score(y_te, y_pred)
    print(f"   MAE: {mae:.0f} RWF")
    print(f"   RMSE: {rmse:.0f} RWF")
    print(f"   R²: {r2:.4f}")

    # ── Anomaly Detection ───────────────────────────────────────────────────────
    print("\nTraining IsolationForest (spending anomaly detection) ...")
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    anomaly_model = IsolationForest(
        n_estimators=200, contamination=0.05, random_state=42, n_jobs=-1
    )
    anomaly_model.fit(X_scaled)
    anomalies = anomaly_model.predict(X_scaled)
    anomaly_count = (anomalies == -1).sum()
    print(f"   Anomalies detected in training: {anomaly_count} ({anomaly_count/len(X)*100:.1f}%)")

    # Feature importance
    fi = pd.Series(spending_model.feature_importances_, index=feature_cols).sort_values(ascending=False)
    print("\nTop Spending Features:")
    print(fi.head(10).to_string())

    artifact = {
        'spending_model': spending_model,
        'anomaly_model': anomaly_model,
        'scaler': scaler,
        'feature_columns': feature_cols,
        'cat_amount_cols': cat_amount_cols,
        'encoders': encoders,
        'metrics': {
            'spending_prediction': {
                'mae': round(mae, 2),
                'rmse': round(rmse, 2),
                'r2': round(r2, 4),
            }
        }
    }
    joblib.dump(artifact, MODEL_PATH)
    print(f"\nSpending model saved to {MODEL_PATH}")
    return artifact


if __name__ == '__main__':
    train()

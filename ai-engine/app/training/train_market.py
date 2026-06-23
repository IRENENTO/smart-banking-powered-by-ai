"""
Market & Economic Forecast Model Training Pipeline
====================================================
Dataset: market_dataset.csv
Models: RandomForestRegressor (inflation) + GradientBoostingRegressor (GDP) + RandomForestClassifier (sentiment)
Output: app/models/market_model.pkl
"""
import os
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error, accuracy_score

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, 'datasets', 'market_dataset.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'market_model.pkl')
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)


def load_and_prepare(path: str):
    print(f"Loading dataset from: {path}")
    df = pd.read_csv(path)
    print(f"   Shape: {df.shape}")

    feature_cols = [
        'year', 'month',
        'interest_rate', 'rwf_usd_exchange', 'consumer_price_index',
        'unemployment_rate', 'money_supply_bn_rwf', 'trade_balance_mn_rwf',
        'market_volatility',
        'sector_agriculture', 'sector_manufacturing', 'sector_services',
        'sector_technology', 'sector_energy', 'sector_financial',
        'sector_real_estate', 'sector_healthcare',
    ]
    target_inflation = 'inflation_rate'
    target_gdp = 'gdp_growth'
    target_sentiment = 'market_sentiment'

    X = df[feature_cols]

    # Sentiment categories
    sentiment_labels = pd.cut(df[target_sentiment], bins=[-1, 30, 50, 70, 101], labels=[0, 1, 2, 3])
    df['sentiment_class'] = sentiment_labels.astype(int)

    return df, X, feature_cols, target_inflation, target_gdp, target_sentiment


def train():
    df, X, feature_cols, target_inflation, target_gdp, target_sentiment = load_and_prepare(DATASET_PATH)

    # ── Model 1: Inflation Rate ────────────────────────────────────────────────
    print("\nTraining RandomForestRegressor (inflation) ...")
    y_inf = df[target_inflation]
    X_tr, X_te, y_tr, y_te = train_test_split(X, y_inf, test_size=0.20, random_state=42)

    inflation_model = RandomForestRegressor(
        n_estimators=300, max_depth=8, min_samples_leaf=3, random_state=42, n_jobs=-1
    )
    inflation_model.fit(X_tr, y_tr)
    inf_pred = inflation_model.predict(X_te)

    inf_mae = mean_absolute_error(y_te, inf_pred)
    inf_rmse = np.sqrt(mean_squared_error(y_te, inf_pred))
    inf_r2 = r2_score(y_te, inf_pred)
    print(f"   Inflation MAE: {inf_mae:.3f}, RMSE: {inf_rmse:.3f}, R²: {inf_r2:.3f}")

    # ── Model 2: GDP Growth ────────────────────────────────────────────────────
    print("\nTraining GradientBoostingRegressor (GDP growth) ...")
    y_gdp = df[target_gdp]
    X_tr2, X_te2, y_tr2, y_te2 = train_test_split(X, y_gdp, test_size=0.20, random_state=42)

    gdp_model = GradientBoostingRegressor(
        n_estimators=200, max_depth=4, learning_rate=0.05, subsample=0.8, random_state=42
    )
    gdp_model.fit(X_tr2, y_tr2)
    gdp_pred = gdp_model.predict(X_te2)

    gdp_mae = mean_absolute_error(y_te2, gdp_pred)
    gdp_rmse = np.sqrt(mean_squared_error(y_te2, gdp_pred))
    gdp_r2 = r2_score(y_te2, gdp_pred)
    print(f"   GDP MAE: {gdp_mae:.3f}, RMSE: {gdp_rmse:.3f}, R²: {gdp_r2:.3f}")

    # ── Model 3: Market Sentiment Classifier ────────────────────────────────────
    print("\nTraining RandomForestClassifier (market sentiment) ...")
    y_sent = df['sentiment_class']
    X_tr3, X_te3, y_tr3, y_te3 = train_test_split(X, y_sent, test_size=0.20, random_state=42)

    sentiment_model = RandomForestClassifier(
        n_estimators=200, max_depth=6, random_state=42, n_jobs=-1
    )
    sentiment_model.fit(X_tr3, y_tr3)
    sent_pred = sentiment_model.predict(X_te3)
    sent_acc = accuracy_score(y_te3, sent_pred)
    print(f"   Sentiment accuracy: {sent_acc:.3f}")

    # Feature importance
    fi = pd.Series(inflation_model.feature_importances_, index=feature_cols).sort_values(ascending=False)
    print("\nTop Market Features (inflation model):")
    print(fi.head(8).to_string())

    artifact = {
        'inflation_model': inflation_model,
        'gdp_model': gdp_model,
        'sentiment_model': sentiment_model,
        'feature_columns': feature_cols,
        'metrics': {
            'inflation': {'mae': round(inf_mae, 3), 'rmse': round(inf_rmse, 3), 'r2': round(inf_r2, 3)},
            'gdp': {'mae': round(gdp_mae, 3), 'rmse': round(gdp_rmse, 3), 'r2': round(gdp_r2, 3)},
            'sentiment': {'accuracy': round(sent_acc, 3)},
        }
    }
    joblib.dump(artifact, MODEL_PATH)
    print(f"\nMarket model saved to {MODEL_PATH}")
    return artifact


if __name__ == '__main__':
    train()

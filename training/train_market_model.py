"""
Rwanda Market Intelligence Model Training
==========================================
Dataset: market_dataset.csv
Features: Date, inflation_rate, gdp_growth, interest_rate, rwf_usd_exchange,
          sector indices (Agriculture, Technology, Real_Estate, etc.)
Algorithms: RandomForest + XGBoost for sector predictions
Output: models/market_model.pkl
"""
import os, warnings
warnings.filterwarnings('ignore')
import pandas as pd, numpy as np, joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error, accuracy_score
try:
    from xgboost import XGBRegressor
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

BASE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE, 'market_dataset.csv')
MODEL_DIR = os.path.join(BASE, 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'market_model.pkl')
os.makedirs(MODEL_DIR, exist_ok=True)

SECTORS = [
    'Agriculture', 'Technology', 'Real_Estate', 'Manufacturing',
    'Retail', 'Tourism', 'Transport', 'Energy'
]
SENTIMENT_MAP = {0: 'Declining', 1: 'Stable', 2: 'Growing'}

def load_and_prepare(path):
    print(f"Loading dataset: {path}")
    df = pd.read_csv(path)
    print(f"  Shape: {df.shape}")
    print(f"  Columns: {list(df.columns)}")

    # Create target: next month's sector return / trend
    for sector in SECTORS:
        col = f'{sector}_index'
        df[f'{sector}_return'] = df[col].pct_change().shift(-1) * 100

    df.dropna(inplace=True)

    for sector in SECTORS:
        df[f'{sector}_trend'] = pd.cut(
            df[f'{sector}_return'].values,
            bins=[-float('inf'), -1, 1, float('inf')],
            labels=[0, 1, 2]
        ).astype(int)

    return df

def train():
    df = load_and_prepare(DATA_PATH)

    feature_cols = ['year', 'month', 'inflation_rate', 'gdp_growth',
                    'interest_rate', 'rwf_usd_exchange']

    results = {}
    models = {}

    print(f"\n{'='*60}")
    print(f"  RWANDA MARKET SECTOR MODELS")
    print(f"{'='*60}")

    for sector in SECTORS:
        print(f"\n  {'-'*40}")
        print(f"  Sector: {sector}")

        # Train trend classifier (0=Declining, 1=Stable, 2=Growing)
        target = f'{sector}_trend'
        X = df[feature_cols].values
        y = df[target].values

        X_tr, X_te, y_tr, y_te = train_test_split(
            X, y, test_size=0.20, random_state=42, stratify=y
        )

        clf = RandomForestClassifier(
            n_estimators=200, max_depth=6, random_state=42, n_jobs=-1
        )
        clf.fit(X_tr, y_tr)
        y_pred = clf.predict(X_te)
        acc = accuracy_score(y_te, y_pred)
        print(f"    Trend accuracy: {acc:.3f}")

        # Train return regressor
        ret_target = f'{sector}_return'
        y_ret = df[ret_target].values
        X_tr_r, X_te_r, y_tr_r, y_te_r = train_test_split(
            X, y_ret, test_size=0.20, random_state=42
        )

        if HAS_XGB:
            reg = XGBRegressor(
                n_estimators=200, max_depth=4, learning_rate=0.05,
                subsample=0.8, random_state=42
            )
            print(f"    Using XGBoostRegressor")
        else:
            reg = RandomForestRegressor(
                n_estimators=200, max_depth=6, random_state=42, n_jobs=-1
            )
            print(f"    Using RandomForestRegressor")

        reg.fit(X_tr_r, y_tr_r)
        ret_pred = reg.predict(X_te_r)
        mae = mean_absolute_error(y_te_r, ret_pred)
        r2 = r2_score(y_te_r, ret_pred)
        print(f"    Return MAE: {mae:.3f}, R²: {r2:.3f}")

        models[sector] = {
            'trend_model': clf,
            'return_model': reg,
        }
        results[sector] = {
            'trend_accuracy': float(acc),
            'return_mae': float(mae),
            'return_r2': float(r2),
        }

    # Aggregate metrics
    avg_trend_acc = np.mean([r['trend_accuracy'] for r in results.values()])
    avg_return_mae = np.mean([r['return_mae'] for r in results.values()])
    print(f"\n  {'='*40}")
    print(f"  Average Trend Accuracy: {avg_trend_acc:.3f}")
    print(f"  Average Return MAE: {avg_return_mae:.3f}")

    artifact = {
        'models': models,
        'sectors': SECTORS,
        'feature_columns': feature_cols,
        'sentiment_map': SENTIMENT_MAP,
        'metrics': {
            'avg_trend_accuracy': float(avg_trend_acc),
            'avg_return_mae': float(avg_return_mae),
            'sector_results': results
        },
        'training_date': pd.Timestamp.now().isoformat(),
        'dataset_size': len(df),
        'algorithm': 'RandomForest+XGBoost'
    }
    joblib.dump(artifact, MODEL_PATH)
    print(f"\n  Model saved: {MODEL_PATH}")
    return artifact

if __name__ == '__main__':
    train()

"""
Fraud Detection Model Training Pipeline
========================================
Dataset: fraud_dataset.csv
Models: IsolationForest (anomaly) + RandomForestClassifier (supervised)
Output: app/models/fraud_model.pkl
"""
import os
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, classification_report,
    confusion_matrix
)
try:
    from imblearn.over_sampling import SMOTE
    HAS_SMOTE = True
except ImportError:
    HAS_SMOTE = False
    print("⚠️  imbalanced-learn not installed — using class_weight only")

# ─── PATHS ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, 'datasets', 'fraud_dataset.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'fraud_model.pkl')
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)


def load_and_clean(path: str) -> pd.DataFrame:
    print(f"📂 Loading dataset from: {path}")
    df = pd.read_csv(path)
    print(f"   Shape: {df.shape}")
    df.drop_duplicates(inplace=True)
    df.dropna(inplace=True)
    print(f"   After cleaning: {df.shape}")
    print(f"   Fraud rate: {df['is_fraud'].mean():.2%}")
    return df


def train():
    # 1. Load
    df = load_and_clean(DATASET_PATH)
    feature_cols = [c for c in df.columns if c != 'is_fraud']
    X = df[feature_cols].values
    y = df['is_fraud'].values

    # 2. Scale
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # ── UNSUPERVISED: IsolationForest ──────────────────────────────────────
    print("\n🔍 Training IsolationForest (anomaly detection) ...")
    contamination = float(y.mean())
    iso = IsolationForest(
        n_estimators=300,
        contamination=contamination,
        random_state=42,
        n_jobs=-1
    )
    iso.fit(X_scaled)
    iso_pred = (iso.predict(X_scaled) == -1).astype(int)
    iso_acc = accuracy_score(y, iso_pred)
    print(f"   IsolationForest anomaly detection accuracy: {iso_acc:.4f}")
    print(f"   Flags as anomaly: {iso_pred.mean():.2%}")

    # ── SUPERVISED: RandomForest with class balancing ─────────────────────
    print("\n🤖 Training supervised RandomForestClassifier ...")
    X_train, X_test, y_train, y_test = train_test_split(
        X_scaled, y, test_size=0.20, random_state=42, stratify=y
    )

    if HAS_SMOTE and y_train.sum() > 5:
        print("   Applying SMOTE to balance classes ...")
        sm = SMOTE(random_state=42, k_neighbors=min(5, y_train.sum()-1))
        X_train, y_train = sm.fit_resample(X_train, y_train)
        print(f"   After SMOTE — fraud: {y_train.mean():.2%}")

    clf = RandomForestClassifier(
        n_estimators=300,
        max_depth=10,
        min_samples_leaf=3,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    y_prob = clf.predict_proba(X_test)[:, 1]

    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec  = recall_score(y_test, y_pred, zero_division=0)
    f1   = f1_score(y_test, y_pred, zero_division=0)
    auc  = roc_auc_score(y_test, y_prob)

    print("\n" + "="*50)
    print("📈 FRAUD MODEL — EVALUATION METRICS")
    print("="*50)
    print(f"  Accuracy  : {acc:.4f}  ({acc*100:.2f}%)")
    print(f"  Precision : {prec:.4f}")
    print(f"  Recall    : {rec:.4f}")
    print(f"  F1 Score  : {f1:.4f}")
    print(f"  AUC-ROC   : {auc:.4f}")
    print("\n" + classification_report(y_test, y_pred, target_names=['Legit', 'Fraud'], zero_division=0))
    print("  Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # Feature importance
    fi = pd.Series(clf.feature_importances_, index=feature_cols).sort_values(ascending=False)
    print("\n🔑 Top Feature Importances:")
    print(fi.head(6).to_string())

    # 5. Save
    artifact = {
        'isolation_forest': iso,
        'classifier': clf,
        'scaler': scaler,
        'feature_columns': feature_cols,
        'contamination_rate': contamination,
        'metrics': {
            'accuracy': float(acc),
            'precision': float(prec),
            'recall': float(rec),
            'f1_score': float(f1),
            'auc_roc': float(auc)
        }
    }
    joblib.dump(artifact, MODEL_PATH)
    print(f"\n✅ Fraud model saved → {MODEL_PATH}")
    return artifact


if __name__ == '__main__':
    train()

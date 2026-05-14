"""
Loan Model Training Pipeline
=============================
Dataset: loan_dataset.csv
Models: RandomForestClassifier + XGBoostClassifier (ensemble)
Output: app/models/loan_model.pkl
"""
import os
import sys
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier, VotingClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, classification_report,
    confusion_matrix
)
try:
    from xgboost import XGBClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False
    print("⚠️  XGBoost not installed — using RandomForest only")

# ─── PATHS ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATASET_PATH = os.path.join(BASE_DIR, 'datasets', 'loan_dataset.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'loan_model.pkl')
os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)


def load_and_clean(path: str) -> pd.DataFrame:
    print(f"📂 Loading dataset from: {path}")
    df = pd.read_csv(path)
    print(f"   Shape: {df.shape}")

    # Drop duplicates & missing
    df.drop_duplicates(inplace=True)
    df.dropna(inplace=True)

    # Cap extreme outliers (99th percentile)
    for col in ['monthly_income', 'loan_amount', 'existing_debt']:
        upper = df[col].quantile(0.99)
        df[col] = df[col].clip(upper=upper)

    print(f"   After cleaning: {df.shape}")
    return df


def encode_features(df: pd.DataFrame):
    """Label-encode categorical columns."""
    cat_cols = df.select_dtypes(include=['object']).columns.tolist()
    encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le
    return df, encoders


def train():
    # 1. Load & clean
    df = load_and_clean(DATASET_PATH)
    df, encoders = encode_features(df)

    # 2. Split features / target
    target = 'approved'
    X = df.drop(columns=[target])
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"\n📊 Training set: {X_train.shape[0]} | Test set: {X_test.shape[0]}")
    print(f"   Approval rate (train): {y_train.mean():.1%}")

    # 3. Build models
    rf = RandomForestClassifier(
        n_estimators=300,
        max_depth=12,
        min_samples_leaf=5,
        class_weight='balanced',
        random_state=42,
        n_jobs=-1
    )

    if HAS_XGB:
        xgb = XGBClassifier(
            n_estimators=300,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            use_label_encoder=False,
            eval_metric='logloss',
            random_state=42
        )
        model = VotingClassifier(
            estimators=[('rf', rf), ('xgb', xgb)],
            voting='soft'
        )
        print("\n🤖 Training ensemble: RandomForest + XGBoost ...")
    else:
        model = rf
        print("\n🤖 Training RandomForestClassifier ...")

    model.fit(X_train, y_train)

    # 4. Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc  = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec  = recall_score(y_test, y_pred)
    f1   = f1_score(y_test, y_pred)
    auc  = roc_auc_score(y_test, y_prob)

    print("\n" + "="*50)
    print("📈 LOAN MODEL — EVALUATION METRICS")
    print("="*50)
    print(f"  Accuracy  : {acc:.4f}  ({acc*100:.2f}%)")
    print(f"  Precision : {prec:.4f}")
    print(f"  Recall    : {rec:.4f}")
    print(f"  F1 Score  : {f1:.4f}")
    print(f"  AUC-ROC   : {auc:.4f}")
    print("\n" + classification_report(y_test, y_pred, target_names=['Rejected', 'Approved']))
    print("  Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # 5. Cross-validation
    cv_scores = cross_val_score(model, X, y, cv=5, scoring='f1', n_jobs=-1)
    print(f"  5-Fold CV F1: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")

    # 6. Feature importance (from RF component)
    base_rf = rf if not HAS_XGB else model.estimators_[0]
    fi = pd.Series(base_rf.feature_importances_, index=X.columns).sort_values(ascending=False)
    print("\n🔑 Top Feature Importances:")
    print(fi.head(6).to_string())

    # 7. Save
    artifact = {
        'model': model,
        'feature_columns': list(X.columns),
        'encoders': encoders,
        'metrics': {
            'accuracy': float(acc),
            'precision': float(prec),
            'recall': float(rec),
            'f1_score': float(f1),
            'auc_roc': float(auc)
        }
    }
    joblib.dump(artifact, MODEL_PATH)
    print(f"\n✅ Loan model saved → {MODEL_PATH}")
    return artifact


if __name__ == '__main__':
    train()

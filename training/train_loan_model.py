"""
Loan Prediction Model Training
===============================
Dataset: loan_dataset.csv
Features: income, expenses, savings, loan_amount, credit_score
Target: loan_status
Algorithm: Random Forest Classifier (Primary), XGBoost (Optional)
Output: models/loan_model.pkl
"""
import os, sys, warnings, json
warnings.filterwarnings('ignore')
import pandas as pd, numpy as np, joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, roc_auc_score, classification_report,
                             confusion_matrix)
try:
    from xgboost import XGBClassifier
    from sklearn.ensemble import VotingClassifier
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

BASE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE, 'loan_dataset.csv')
MODEL_DIR = os.path.join(BASE, 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'loan_model.pkl')
os.makedirs(MODEL_DIR, exist_ok=True)

def load_and_prepare(path):
    print(f"Loading dataset: {path}")
    df = pd.read_csv(path)
    print(f"  Shape: {df.shape}")
    print(f"  Columns: {list(df.columns)}")
    df.drop_duplicates(inplace=True)
    df.dropna(inplace=True)
    target = 'loan_status'
    features = [c for c in df.columns if c != target]
    X = df[features]
    y = df[target]
    return X, y, features

def train():
    X, y, feature_cols = load_and_prepare(DATA_PATH)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"\n  Train: {X_train.shape[0]} | Test: {X_test.shape[0]}")
    print(f"  Approval rate: {y.mean():.1%}")

    rf = RandomForestClassifier(
        n_estimators=300, max_depth=12, min_samples_leaf=5,
        class_weight='balanced', random_state=42, n_jobs=-1
    )

    if HAS_XGB:
        xgb = XGBClassifier(
            n_estimators=300, max_depth=6, learning_rate=0.05,
            subsample=0.8, colsample_bytree=0.8,
            use_label_encoder=False, eval_metric='logloss', random_state=42
        )
        model = VotingClassifier(
            estimators=[('rf', rf), ('xgb', xgb)], voting='soft'
        )
        print("  Training: RandomForest + XGBoost ensemble")
    else:
        model = rf
        print("  Training: RandomForestClassifier")

    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    auc = roc_auc_score(y_test, y_prob)

    print("\n" + "="*50)
    print(f"  LOAN MODEL EVALUATION")
    print("="*50)
    print(f"  Accuracy : {acc:.4f} ({acc*100:.2f}%)")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall   : {rec:.4f}")
    print(f"  F1 Score : {f1:.4f}")
    print(f"  AUC-ROC  : {auc:.4f}")
    print(f"\n  Classification Report:")
    print(classification_report(y_test, y_pred, target_names=['Rejected', 'Approved']))
    print(f"  Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    artifact = {
        'model': model,
        'feature_columns': feature_cols,
        'metrics': {
            'accuracy': float(acc), 'precision': float(prec),
            'recall': float(rec), 'f1_score': float(f1), 'auc_roc': float(auc)
        },
        'training_date': pd.Timestamp.now().isoformat(),
        'dataset_size': len(X),
        'algorithm': 'RandomForest+XGBoost' if HAS_XGB else 'RandomForest'
    }
    joblib.dump(artifact, MODEL_PATH)
    print(f"\n  Model saved: {MODEL_PATH}")
    return artifact

if __name__ == '__main__':
    train()

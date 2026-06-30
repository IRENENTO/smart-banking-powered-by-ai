"""
Fraud Detection Model Training
===============================
Dataset: fraud_dataset.csv
Features: transaction_amount, location, device, time, frequency
Target: is_fraud
Algorithm: Isolation Forest + RandomForestClassifier
Output: models/fraud_model.pkl
"""
import os, warnings
warnings.filterwarnings('ignore')
import pandas as pd, numpy as np, joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import IsolationForest, RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, roc_auc_score, classification_report,
                             confusion_matrix)
try:
    from imblearn.over_sampling import SMOTE
    HAS_SMOTE = True
except ImportError:
    HAS_SMOTE = False

BASE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE, 'fraud_dataset.csv')
MODEL_DIR = os.path.join(BASE, 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'fraud_model.pkl')
os.makedirs(MODEL_DIR, exist_ok=True)

def load_and_prepare(path):
    print(f"Loading dataset: {path}")
    df = pd.read_csv(path)
    print(f"  Shape: {df.shape}")
    print(f"  Columns: {list(df.columns)}")
    df.drop_duplicates(inplace=True)
    df.dropna(inplace=True)
    print(f"  Fraud rate: {df['is_fraud'].mean():.2%}")

    # Encode categorical columns
    cat_cols = df.select_dtypes(include=['object']).columns.tolist()
    encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col].astype(str))
        encoders[col] = le

    feature_cols = [c for c in df.columns if c != 'is_fraud']
    X = df[feature_cols].values
    y = df['is_fraud'].values
    return X, y, feature_cols, encoders

def train():
    X, y, feature_cols, encoders = load_and_prepare(DATA_PATH)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    # IsolationForest (unsupervised anomaly detection)
    print("\n  Training IsolationForest ...")
    contamination = max(float(y.mean()), 0.01)
    iso = IsolationForest(
        n_estimators=300, contamination=contamination,
        random_state=42, n_jobs=-1
    )
    iso.fit(X_scaled)
    iso_pred = (iso.predict(X_scaled) == -1).astype(int)
    iso_acc = accuracy_score(y, iso_pred)
    print(f"  IsolationForest accuracy: {iso_acc:.4f}")

    # RandomForest (supervised)
    print("\n  Training RandomForestClassifier ...")
    X_tr, X_te, y_tr, y_te = train_test_split(
        X_scaled, y, test_size=0.20, random_state=42, stratify=y
    )

    if HAS_SMOTE and y_tr.sum() > 5:
        print("  Applying SMOTE ...")
        sm = SMOTE(random_state=42, k_neighbors=min(5, max(1, y_tr.sum()-1)))
        X_tr, y_tr = sm.fit_resample(X_tr, y_tr)

    clf = RandomForestClassifier(
        n_estimators=300, max_depth=10, min_samples_leaf=3,
        class_weight='balanced', random_state=42, n_jobs=-1
    )
    clf.fit(X_tr, y_tr)

    y_pred = clf.predict(X_te)
    y_prob = clf.predict_proba(X_te)[:, 1]

    acc = accuracy_score(y_te, y_pred)
    prec = precision_score(y_te, y_pred, zero_division=0)
    rec = recall_score(y_te, y_pred, zero_division=0)
    f1 = f1_score(y_te, y_pred, zero_division=0)
    auc = roc_auc_score(y_te, y_prob)

    print("\n" + "="*50)
    print(f"  FRAUD MODEL EVALUATION")
    print("="*50)
    print(f"  Accuracy : {acc:.4f} ({acc*100:.2f}%)")
    print(f"  Precision: {prec:.4f}")
    print(f"  Recall   : {rec:.4f}")
    print(f"  F1 Score : {f1:.4f}")
    print(f"  AUC-ROC  : {auc:.4f}")
    print(f"\n  Classification Report:")
    print(classification_report(y_te, y_pred, target_names=['Legit', 'Fraud']))
    print(f"  Confusion Matrix:")
    print(confusion_matrix(y_te, y_pred))

    fi = pd.Series(clf.feature_importances_, index=feature_cols).sort_values(ascending=False)
    print(f"\n  Top Features:")
    print(fi.head(6).to_string())

    artifact = {
        'isolation_forest': iso,
        'classifier': clf,
        'scaler': scaler,
        'feature_columns': feature_cols,
        'encoders': encoders,
        'contamination_rate': contamination,
        'metrics': {
            'accuracy': float(acc), 'precision': float(prec),
            'recall': float(rec), 'f1_score': float(f1), 'auc_roc': float(auc)
        },
        'training_date': pd.Timestamp.now().isoformat(),
        'dataset_size': len(X),
        'algorithm': 'IsolationForest+RandomForest+SMOTE' if HAS_SMOTE else 'IsolationForest+RandomForest'
    }
    joblib.dump(artifact, MODEL_PATH)
    print(f"\n  Model saved: {MODEL_PATH}")
    return artifact

if __name__ == '__main__':
    train()

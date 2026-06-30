"""
AI Dashboard Service
=====================
Provides model metrics, version info, and training stats
for the Admin Dashboard AI Analytics tab.
"""
import os
import joblib

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models')

MODEL_FILES = {
    'Loan Model': 'loan_model.pkl',
    'Fraud Model': 'fraud_model.pkl',
    'Savings Model': 'savings_model.pkl',
    'Market Model': 'market_model.pkl',
    'Spending Model': 'spending_model.pkl',
}


def get_dashboard_data():
    models = []
    for name, filename in MODEL_FILES.items():
        path = os.path.join(MODEL_DIR, filename)
        entry = {
            'model_name': name,
            'available': False,
            'size_kb': 0,
            'accuracy': 0,
            'precision': 0,
            'recall': 0,
            'f1_score': 0,
            'auc_roc': 0,
            'training_date': '',
            'dataset_size': 0,
            'algorithm': '',
        }
        if os.path.exists(path):
            entry['available'] = True
            entry['size_kb'] = round(os.path.getsize(path) / 1024, 1)
            try:
                artifact = joblib.load(path)
                metrics = artifact.get('metrics', {})
                if isinstance(metrics, dict):
                    entry['accuracy'] = metrics.get('accuracy', metrics.get('avg_trend_accuracy', 0))
                    entry['precision'] = metrics.get('precision', 0)
                    entry['recall'] = metrics.get('recall', 0)
                    entry['f1_score'] = metrics.get('f1_score', 0)
                    entry['auc_roc'] = metrics.get('auc_roc', 0)
                    if 'avg_return_mae' in metrics and not entry['accuracy']:
                        entry['accuracy'] = metrics.get('avg_trend_accuracy', 0)
                entry['training_date'] = artifact.get('training_date', '')
                entry['dataset_size'] = artifact.get('dataset_size', 0)
                entry['algorithm'] = artifact.get('algorithm', '')
            except Exception:
                pass
        models.append(entry)

    return {
        'success': True,
        'models': models,
        'engine_status': 'operational',
        'model_version': '2.0.0',
        'total_predictions': 0,
    }

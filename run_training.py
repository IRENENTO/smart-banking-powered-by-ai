"""
AI Banking — Model Training Orchestrator
=========================================
Run this script to train ALL AI models:
  python run_training.py

This trains:
  1. Loan Prediction Model (RandomForest + XGBoost)
  2. Fraud Detection Model (IsolationForest + RandomForest)
  3. Rwanda Market Intelligence Model (RandomForest + XGBoost)

Each model is saved to:
  training/models/<model_name>.pkl

After training, models are copied to:
  ai-engine/app/models/<model_name>.pkl
"""
import os
import sys
import time
import shutil

BASE = os.path.dirname(os.path.abspath(__file__))
AI_ENGINE_MODELS = os.path.join(BASE, 'ai-engine', 'app', 'models')
TRAINING_MODELS = os.path.join(BASE, 'training', 'models')
TRAINING_DIR = os.path.join(BASE, 'training')

SCRIPTS = [
    ('train_loan_model.py', 'Loan Model'),
    ('train_fraud_model.py', 'Fraud Model'),
    ('train_market_model.py', 'Market Model'),
]


def print_banner():
    print("""
    ╔══════════════════════════════════════════════╗
    ║     AI BANKING — MODEL TRAINING PIPELINE     ║
    ║        Smart Banking Powered by AI           ║
    ╚══════════════════════════════════════════════╝
    """)


def train():
    print_banner()
    results = {}

    for script, name in SCRIPTS:
        script_path = os.path.join(TRAINING_DIR, script)
        print(f"\n{'='*60}")
        print(f"  Training: {name}")
        print(f"  Script: {script_path}")
        print(f"{'='*60}")

        start = time.time()
        try:
            import subprocess
            result = subprocess.run(
                [sys.executable, script_path],
                cwd=TRAINING_DIR,
                capture_output=True,
                text=True,
                timeout=600,
            )
            elapsed = time.time() - start
            print(result.stdout)

            if result.returncode != 0:
                print(f"  ERROR: {result.stderr}")
                results[name] = {'status': 'error', 'error': result.stderr}
            else:
                results[name] = {'status': 'success', 'elapsed': round(elapsed, 1)}
                print(f"\n  {name} completed in {elapsed:.1f}s")

        except subprocess.TimeoutExpired:
            results[name] = {'status': 'error', 'error': 'timeout'}
            print(f"  Timeout: {name} exceeded 600s")
        except Exception as e:
            results[name] = {'status': 'error', 'error': str(e)}
            print(f"  Error: {e}")

    # Summary
    print(f"\n{'='*60}")
    print(f"  TRAINING SUMMARY")
    print(f"{'='*60}")
    for name, r in results.items():
        status_icon = "OK" if r['status'] == 'success' else "FAIL"
        elapsed = r.get('elapsed', 'N/A')
        print(f"  [{status_icon}] {name}: {r['status']} ({elapsed}s)")

    # Copy models to AI engine
    print(f"\n{'='*60}")
    print(f"  Copying models to AI Engine...")
    print(f"{'='*60}")
    os.makedirs(AI_ENGINE_MODELS, exist_ok=True)
    for f in os.listdir(TRAINING_MODELS):
        if f.endswith('.pkl'):
            src = os.path.join(TRAINING_MODELS, f)
            dst = os.path.join(AI_ENGINE_MODELS, f)
            shutil.copy2(src, dst)
            print(f"  Copied: {f}")

    print(f"\n  Training pipeline complete!")
    return results


if __name__ == '__main__':
    train()

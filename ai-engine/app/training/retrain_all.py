"""
Master retraining script — run to retrain all models with fresh data.
Usage:  python -m app.training.retrain_all
"""
import os
import sys
import time

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(BASE_DIR))

from app.training.train_loan      import train as train_loan
from app.training.train_fraud     import train as train_fraud
from app.training.train_savings   import train as train_savings
from app.training.train_market    import train as train_market
from app.training.train_spending  import train as train_spending


def retrain_all():
    print("=" * 60)
    print("🔄  AI BANKING — FULL MODEL RETRAINING")
    print("=" * 60)

    results = {}
    for name, fn in [("Loan", train_loan), ("Fraud", train_fraud), ("Savings", train_savings), ("Market", train_market), ("Spending", train_spending)]:
        print(f"\n{'─'*60}")
        print(f"▶  Retraining {name} model ...")
        print(f"{'─'*60}")
        start = time.time()
        try:
            artifact = fn()
            elapsed = time.time() - start
            results[name] = {
                'status': 'success',
                'elapsed_seconds': round(elapsed, 1),
                'metrics': artifact.get('metrics', {})
            }
            print(f"   ✅  {name} model done in {elapsed:.1f}s")
        except Exception as e:
            results[name] = {'status': 'error', 'error': str(e)}
            print(f"   ❌  {name} model FAILED: {e}")

    print("\n" + "=" * 60)
    print("📊  RETRAINING SUMMARY")
    print("=" * 60)
    for name, r in results.items():
        status = "✅" if r['status'] == 'success' else "❌"
        print(f"  {status}  {name}: {r['status']} ({r.get('elapsed_seconds', '?')}s)")
    print("=" * 60)
    return results


if __name__ == '__main__':
    retrain_all()

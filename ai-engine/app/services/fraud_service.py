"""
Fraud Detection Service
========================
Wraps the existing predict_fraud module for consistent service-layer access.
"""
from .predict_fraud import detect_fraud, _load_model

__all__ = ['detect_fraud', '_load_model']

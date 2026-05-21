"""
Loan Prediction Service
========================
Wraps the existing predict_loan module for consistent service-layer access.
"""
from .predict_loan import predict_loan, _load_model

__all__ = ['predict_loan', '_load_model']

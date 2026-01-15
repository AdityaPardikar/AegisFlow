import pandas as pd
import numpy as np
import joblib
import shap
import os
from typing import Dict, Any
# Import from local features file
try:
    from backend.ml_engine.features import TransactionPreprocessor
except ImportError:
    # Fallback to direct import if running locally
    from features import TransactionPreprocessor

class FraudPredictor:
    def __init__(self, model_dir: str):
        self.model_dir = model_dir
        self.preprocessor = TransactionPreprocessor()
        self.xgb_model = None
        self.iso_forest = None
        self.explainer = None
        
    def load_models(self):
        """Loads the pre-trained models and scaler."""
        print(f"Loading models from {self.model_dir}...")
        
        # Load Scaler (Preprocessor)
        self.preprocessor.load(self.model_dir)
        
        # Load XGBoost
        self.xgb_model = joblib.load(os.path.join(self.model_dir, "xgb_model.pkl"))
        
        # Load Isolation Forest
        self.iso_forest = joblib.load(os.path.join(self.model_dir, "iso_forest.pkl"))
        
        # Initialize SHAP Explainer (TreeExplainer is optimized for XGBoost)
        # We use a small background dataset if needed, but for TreeExplainer it's often optional or model-based
        # For speed, we rely on the model structure itself
        self.explainer = shap.TreeExplainer(self.xgb_model)
        
        print("Models loaded successfully.")

    def predict(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Predicts fraud probability and returns SHAP explanation.
        """
        if not self.xgb_model:
            raise Exception("Models not loaded. Call load_models() first.")
            
        # 1. Preprocess
        # ensures the dataframe has the exact same columns as training
        X_input = self.preprocessor.transform(transaction_data)
        
        # 2. XGBoost Prediction (Supervised) - Primary Signal
        # proba returns [prob_legit, prob_fraud]
        fraud_prob = self.xgb_model.predict_proba(X_input)[0][1]
        
        # 3. Isolation Forest Prediction (Unsupervised) - Secondary Signal
        # Returns -1 for anomaly, 1 for normal
        iso_pred = self.iso_forest.predict(X_input)[0]
        is_anomaly = True if iso_pred == -1 else False
        
        # 4. Generate Explainability (SHAP)
        shap_values = self.explainer.shap_values(X_input)
        
        # SHAP returns a matrix, we want the first (and only) row
        # For binary classification, sometimes it returns a list. XGBoost usually returns raw log odds.
        if isinstance(shap_values, list):
             shap_values = shap_values[1] # Class 1 (Fraud)

        # Map SHAP values to feature names for the API response
        # X_input is a DataFrame, so columns are available
        feature_names = X_input.columns.tolist()
        # Shap values might be (1, N) or (N,)
        shap_array = shap_values[0] if len(shap_values.shape) > 1 else shap_values
        
        explanation = []
        for name, value in zip(feature_names, shap_array):
            explanation.append({
                "feature": name,
                "impact": float(value),  # Convert to standard float for JSON serialization
                "value": float(X_input.iloc[0][name]) # What was the actual input value?
            })
            
        # Sort by absolute impact to show most important reasons first
        explanation.sort(key=lambda x: abs(x["impact"]), reverse=True)
        
        # 5. Final Verdict Logic
        # We combine both signals. 
        # If Prob > 0.8 -> DENY
        # If Prob > 0.5 OR Anomaly -> REVIEW
        # Else -> ALLOW
        
        verdict = "ALLOW"
        if fraud_prob > 0.8:
            verdict = "DENY"
        elif fraud_prob > 0.4 or is_anomaly:
            verdict = "REVIEW"
            
        return {
            "risk_score": float(fraud_prob),
            "verdict": verdict,
            "anomaly_detected": is_anomaly,
            "explanation": explanation[:5] # Top 5 factors
        }

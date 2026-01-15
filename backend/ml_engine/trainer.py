import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.ensemble import IsolationForest
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib
import os
import time

# Import our preprocessor
# Note: In a real package structure, this might be backend.ml_engine.features
try:
    from backend.ml_engine.features import TransactionPreprocessor
except ImportError:
    # Fallback for running script directly from backend/
    import sys
    sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
    from backend.ml_engine.features import TransactionPreprocessor

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
os.makedirs(MODEL_DIR, exist_ok=True)

def generate_synthetic_data(n_samples=5000):
    """
    Generates a synthetic dataset resembling financial transactions.
    """
    print(f"Generating {n_samples} synthetic transactions...")
    np.random.seed(42)
    
    # Generate random data
    data = {
        'amount': np.random.exponential(scale=100, size=n_samples),
        'oldbalanceOrg': np.random.uniform(0, 100000, n_samples),
        'newbalanceOrig': np.random.uniform(0, 100000, n_samples),
        'oldbalanceDest': np.random.uniform(0, 100000, n_samples),
        'newbalanceDest': np.random.uniform(0, 100000, n_samples),
        'transaction_time': pd.date_range(start='2024-01-01', periods=n_samples, freq='min'),
        'type': np.random.choice(['PAYMENT', 'TRANSFER', 'CASH_OUT', 'DEBIT', 'CASH_IN'], n_samples)
    }
    
    df = pd.DataFrame(data)
    
    # Introduce Logic for Fraud (Label = 1)
    # Fraud pattern: High amount TRANSFER or CASH_OUT with drained account
    df['isFraud'] = 0
    
    # Pattern 1: Large transfers clearing out account
    mask_fraud_1 = (df['type'].isin(['TRANSFER', 'CASH_OUT'])) & (df['amount'] > 200) & (df['newbalanceOrig'] < 10)
    df.loc[mask_fraud_1, 'isFraud'] = 1
    
    # Pattern 2: Anomaly - High amount for 'PAYMENT'
    mask_fraud_2 = (df['type'] == 'PAYMENT') & (df['amount'] > 500)
    df.loc[mask_fraud_2, 'isFraud'] = 1
    
    print(f"Data generated. Fraud Rate: {df['isFraud'].mean():.2%}")
    return df

def train_models():
    """Main training pipeline."""
    df = generate_synthetic_data(10000)
    
    # 1. Preprocessing
    preprocessor = TransactionPreprocessor()
    # Need to engineer features first before split to handle OneHot columns correctly across all
    df['hour_of_day'] = df['transaction_time'].dt.hour
    df = pd.get_dummies(df, columns=['type'], prefix='type')
    
    # IMPORTANT: Ensure columns match the preprocessor's expectation
    # In a real pipeline, we'd use the preprocessor.fit() method more robustly
    # Here we align manually for the synthetic script
    expected_cols = preprocessor.feature_columns
    for col in expected_cols:
        if col not in df.columns:
            df[col] = 0
            
    X = df[expected_cols]
    y = df['isFraud']
    
    # Fit scaler
    numerical_cols = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 
                     'oldbalanceDest', 'newbalanceDest', 'hour_of_day']
    preprocessor.scaler.fit(X[numerical_cols])
    
    # Save the preprocessor
    print("Saving preprocessor...")
    preprocessor.save(MODEL_DIR)
    
    # Apply scaling
    X_scaled = X.copy()
    X_scaled[numerical_cols] = preprocessor.scaler.transform(X[numerical_cols])
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
    
    # 2. Train XGBoost (Supervised)
    print("Training XGBoost...")
    xgb_model = xgb.XGBClassifier(
        objective='binary:logistic',
        n_estimators=100,
        learning_rate=0.1,
        max_depth=5,
        eval_metric='logloss',
        use_label_encoder=False
    )
    xgb_model.fit(X_train, y_train)
    
    # Evaluate
    preds = xgb_model.predict(X_test)
    print("XGBoost Results:")
    print(classification_report(y_test, preds))
    
    # Save XGBoost
    joblib.dump(xgb_model, os.path.join(MODEL_DIR, "xgb_model.pkl"))
    
    # 3. Train Isolation Forest (Unsupervised/Anomaly)
    print("Training Isolation Forest...")
    # Train only on 'normal' behavior usually, but here we train on all to find outliers
    iso_forest = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)
    iso_forest.fit(X_train)
    
    # Save Isolation Forest
    joblib.dump(iso_forest, os.path.join(MODEL_DIR, "iso_forest.pkl"))
    
    print(f"All models saved to {MODEL_DIR}")

if __name__ == "__main__":
    train_models()

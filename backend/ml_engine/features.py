import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os

class TransactionPreprocessor:
    def __init__(self):
        self.scaler = StandardScaler()
        self.label_encoders = {}
        # Define expected columns to ensure order
        self.feature_columns = [
            'amount', 'oldbalanceOrg', 'newbalanceOrig', 
            'oldbalanceDest', 'newbalanceDest', 'hour_of_day',
            'type_CASH_IN', 'type_CASH_OUT', 'type_DEBIT', 
            'type_PAYMENT', 'type_TRANSFER'
        ]
        
    def fit(self, df: pd.DataFrame):
        """Fit the scaler to the training data."""
        # Feature engineering on the dataframe
        df_processed = self._engineer_features(df)
        
        # Fit scaler on numerical columns
        numerical_cols = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 
                         'oldbalanceDest', 'newbalanceDest', 'hour_of_day']
        self.scaler.fit(df_processed[numerical_cols])
        
    def transform(self, data: Dict[str, Any]) -> pd.DataFrame:
        """Transform a single transaction dictionary into a model-ready dataframe."""
        # Convert dict to DataFrame
        df = pd.DataFrame([data])
        
        # Basic preprocessing
        df_processed = self._engineer_features(df)
        
        # Scale numerical features
        numerical_cols = ['amount', 'oldbalanceOrg', 'newbalanceOrig', 
                         'oldbalanceDest', 'newbalanceDest', 'hour_of_day']
        
        # Handle case where scaler might not be fitted (for safety, though fit should be called first)
        try:
            df_processed[numerical_cols] = self.scaler.transform(df_processed[numerical_cols])
        except Exception:
            # Fallback if not fitted (only during initial dev/testing)
            pass

        # Ensure all columns are present (One-Hot Encoding handling)
        for col in self.feature_columns:
            if col not in df_processed.columns:
                df_processed[col] = 0
                
        # Reorder to match training shape
        return df_processed[self.feature_columns]

    def _engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Internal method to create features."""
        df = df.copy()
        
        # Extract time features if transaction_time exists, else assume current hour if missing
        if 'transaction_time' in df.columns:
            df['transaction_time'] = pd.to_datetime(df['transaction_time'])
            df['hour_of_day'] = df['transaction_time'].dt.hour
        else:
            df['hour_of_day'] = 12  # Default value
            
        # One-hot encode Transaction Type
        if 'type' in df.columns:
            df = pd.get_dummies(df, columns=['type'], prefix='type')
            
        return df

    def save(self, path: str):
        joblib.dump(self.scaler, os.path.join(path, "scaler.pkl"))

    def load(self, path: str):
        self.scaler = joblib.load(os.path.join(path, "scaler.pkl"))

from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.db.session import get_db
from backend.app.schemas.transaction import TransactionCreate, RiskAssessment
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.transaction import Transaction as TransactionModel
import time
from datetime import datetime

# We import the predictor instance from main or create a singleton dependency
# For simplicity, we'll instantiate it here or rely on a global state if loaded in main
# Ideally, we used a dependency injection pattern.
# For now, let's load it on demand or use a global. 
# A cleaner way is to have the app state hold the predictor.

import os
from backend.ml_engine.predictor import FraudPredictor

router = APIRouter()

# Global predictor instance (to be initialized on startup)
predictor = None

def get_predictor():
    if not predictor:
        raise HTTPException(status_code=503, detail="ML Model not ready")
    return predictor

@router.post("/", response_model=RiskAssessment)
async def analyze_transaction(
    *,
    transaction: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user), # Require Auth
    predictor_instance: FraudPredictor = Depends(get_predictor)
) -> Any:
    """
    Analyze a transaction in real-time for fraud risk.
    """
    try:
        # Convert Pydantic model to dict
        data = transaction.model_dump()
        
        # Make prediction
        result = predictor_instance.predict(data)
        
        # Persist to Database
        import json
        
        # Map verdict to risk level
        risk_level_map = {
            "ALLOW": "LOW",
            "REVIEW": "HIGH",
            "DENY": "CRITICAL"
        }
        
        db_transaction = TransactionModel(
            id=f"txn_{int(time.time()*1000)}", # Simple ID generation
            amount=transaction.amount,
            oldbalanceOrg=transaction.oldbalanceOrg,
            newbalanceOrig=transaction.newbalanceOrig,
            oldbalanceDest=transaction.oldbalanceDest,
            newbalanceDest=transaction.newbalanceDest,
            type=transaction.type,
            
            # Risk Info
            risk_score=result["risk_score"],
            risk_level=risk_level_map.get(result["verdict"], "MEDIUM"),
            is_flagged=result["anomaly_detected"] or result["verdict"] == "DENY",
            
            # Metadata
            timestamp=datetime.now(),
            
            # Explanation stored as JSON string in rule_violations (repurposing the column)
            rule_violations=json.dumps(result["explanation"])
        )
        
        db.add(db_transaction)
        await db.commit()
        await db.refresh(db_transaction)
        
        return result
    except Exception as e:
        print(f"Prediction Error: {e}")
        # Return error but don't crash standard flow validation if possible, 
        # but here we throw 500
        raise HTTPException(status_code=500, detail=str(e))

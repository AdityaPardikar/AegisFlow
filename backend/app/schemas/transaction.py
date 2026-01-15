from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime

class TransactionBase(BaseModel):
    amount: float = Field(..., gt=0, description="Transaction amount")
    oldbalanceOrg: float = Field(..., ge=0, description="Initial balance origin")
    newbalanceOrig: float = Field(..., ge=0, description="New balance origin")
    oldbalanceDest: float = Field(..., ge=0, description="Initial balance destination")
    newbalanceDest: float = Field(..., ge=0, description="New balance destination")
    type: Literal['PAYMENT', 'TRANSFER', 'CASH_OUT', 'DEBIT', 'CASH_IN']
    transaction_time: Optional[datetime] = None

class TransactionCreate(TransactionBase):
    pass

class ExplanationItem(BaseModel):
    feature: str
    impact: float
    value: float

class RiskAssessment(BaseModel):
    risk_score: float = Field(..., ge=0.0, le=1.0)
    verdict: Literal['ALLOW', 'DENY', 'REVIEW']
    anomaly_detected: bool
    explanation: List[ExplanationItem]
    timestamp: datetime = Field(default_factory=datetime.now)

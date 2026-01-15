from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from backend.app.db.base_class import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True) # Transaction ID from payment gateway
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    merchant_id = Column(String, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True) # Optional link to registered user
    
    # Metadata
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String, nullable=True)
    location = Column(String, nullable=True)
    device_id = Column(String, nullable=True)

    # ML Features (Paysim Dataset)
    oldbalanceOrg = Column(Float, nullable=True)
    newbalanceOrig = Column(Float, nullable=True)
    oldbalanceDest = Column(Float, nullable=True)
    newbalanceDest = Column(Float, nullable=True)
    type = Column(String, nullable=True)

    # Risk Scoring (Populated by ML Engine)
    risk_score = Column(Float, default=0.0) # 0.0 to 1.0
    risk_level = Column(String, default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    is_flagged = Column(Boolean, default=False)
    
    # Explainability
    rule_violations = Column(String) # JSON string of broken rules

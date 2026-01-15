from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from backend.app.api import deps
from backend.app.db.session import get_db
from backend.app.models.transaction import Transaction
# We can repurpose the schema or create a new one for list response
# For simplicity using dict or create a Response Schema
from pydantic import BaseModel
from datetime import datetime

class TransactionList(BaseModel):
    id: str
    amount: float
    type: str | None
    risk_score: float
    risk_level: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

router = APIRouter()

@router.get("/", response_model=List[TransactionList])
async def read_transactions(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: Any = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve transactions.
    """
    query = select(Transaction).order_by(desc(Transaction.timestamp)).offset(skip).limit(limit)
    result = await db.execute(query)
    transactions = result.scalars().all()
    return transactions

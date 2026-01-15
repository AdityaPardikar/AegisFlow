from typing import Any, List
from fastapi import APIRouter, Body, Depends, HTTPException
from fastapi.encoders import jsonable_encoder
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.api import deps
from backend.app.core.security import get_password_hash
from backend.app.db.session import get_db
from backend.app.models.user import User
from backend.app.schemas.user import User as UserSchema, UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserSchema)
async def read_user_me(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.put("/me", response_model=UserSchema)
async def update_user_me(
    *,
    db: AsyncSession = Depends(get_db),
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Update own user.
    """
    # Fetch latest user state to update
    result = await db.execute(select(User).where(User.id == current_user.id))
    user = result.scalars().first()
    
    if not user:
         raise HTTPException(status_code=404, detail="User not found")

    user_data = jsonable_encoder(user)
    update_data = user_in.model_dump(exclude_unset=True)
    
    # Handle password update separately if needed
    if update_data.get("password"):
        hashed_password = get_password_hash(update_data["password"])
        del update_data["password"]
        update_data["hashed_password"] = hashed_password

    for field in user_data:
        if field in update_data:
            setattr(user, field, update_data[field])

    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

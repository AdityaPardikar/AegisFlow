import asyncio
from backend.app.db.session import SessionLocal
from backend.app.models.user import User
from backend.app.core.security import get_password_hash
from backend.app.core.config import settings
from sqlalchemy import select

async def create_initial_data() -> None:
    async with SessionLocal() as db:
        print("Creating initial data...")
        
        # Check if user exists
        result = await db.execute(select(User).where(User.email == "admin@aegisflow.com"))
        user = result.scalars().first()
        
        if not user:
            new_user = User(
                email="admin@aegisflow.com",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                role="admin",
                is_active=True
            )
            db.add(new_user)
            await db.commit()
            print("✅ Admin user created: admin@aegisflow.com / admin123")
        else:
            print("ℹ️ Admin user already exists.")

if __name__ == "__main__":
    # Fix for Windows asyncio loop policy if needed, though usually fine in 3.11+
    asyncio.run(create_initial_data())

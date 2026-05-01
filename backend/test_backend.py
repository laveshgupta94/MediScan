import asyncio
import os
from main import register
from models import UserCreate
from database import init_db, db

async def test():
    # Force init
    init_db()
    
    user_data = UserCreate(
        full_name="Test User",
        email="test_internal@example.com",
        password="password123"
    )
    
    print("Attempting to call register function directly...")
    try:
        response = await register(user_data)
        print(f"SUCCESS: {response}")
    except Exception as e:
        print(f"FAILURE: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test())

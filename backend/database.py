import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

MONGODB_URL = os.getenv("MONGODB_URL", "")
DATABASE_NAME = "mediscan"

# Global database variables
client = None
db = None

def init_db():
    global client, db
    
    # Check if MONGODB_URL is still a placeholder or empty
    if not MONGODB_URL or "<username>" in MONGODB_URL:
        logger.warning("MONGODB_URL is not configured or is using placeholder values. Database features will not work.")
        # We still need to initialize something so the app doesn't crash on import, 
        # but we'll handle failures at the endpoint level
        client = AsyncIOMotorClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
    else:
        try:
            client = AsyncIOMotorClient(MONGODB_URL)
        except Exception as e:
            logger.error(f"Failed to initialize MongoDB client: {e}")
            client = AsyncIOMotorClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
    
    db = client[DATABASE_NAME]

# Initialize on module load
init_db()

async def get_database():
    return db

async def test_connection():
    if not client:
        return False
    try:
        await client.admin.command('ping')
        return True
    except Exception as e:
        logger.error(f"MongoDB connection test failed: {e}")
        return False

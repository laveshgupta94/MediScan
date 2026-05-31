from fastapi import FastAPI, File, UploadFile, HTTPException, Request, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from services.scanner import scan_medicine
from services.chat import send_message, clear_session
from database import db
from models import UserCreate, UserLogin, UserResponse, Token, UserInDB, ScanHistory

from auth import get_password_hash, verify_password, create_access_token, SECRET_KEY, ALGORITHM
from jose import JWTError, jwt
import uuid
import os
import uvicorn
import logging
from datetime import datetime
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(
    title="MediScan API",
    description="AI-powered medicine scanning and chat API using Groq",
    version="1.1.0",
)

# Global exception handler to ensure CORS on errors
from fastapi.responses import JSONResponse
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"},
        headers={"Access-Control-Allow-Origin": "*"}
    )

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=False, # Must be False if allow_origins is ["*"]
    allow_methods=["*"],
    allow_headers=["*"],
)



class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    medicine_context: dict | None = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    success: bool


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise credentials_exception
    return user

async def get_optional_user(token: str = Depends(oauth2_scheme)):
    try:
        return await get_current_user(token)
    except:
        return None


# ─── Auth Routes ─────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=UserResponse)
async def register(user_in: UserCreate):
    logger.info(f"Registration attempt for email: {user_in.email}")
    try:
        # Check if user already exists
        existing_user = await db.users.find_one({"email": user_in.email})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        hashed_password = get_password_hash(user_in.password)
        user_dict = user_in.dict()
        user_dict.pop("password")
        user_dict["hashed_password"] = hashed_password
        user_dict["created_at"] = datetime.utcnow()
        
        result = await db.users.insert_one(user_dict)
        
        # Return user data
        created_user = await db.users.find_one({"_id": result.inserted_id})
        
        return UserResponse(
            id=str(created_user["_id"]),
            email=created_user["email"],
            full_name=created_user["full_name"],
            created_at=created_user["created_at"]
        )
    except Exception as e:
        logger.error(f"Registration error: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")



@app.post("/api/auth/login", response_model=Token)
async def login(user_in: UserLogin):
    logger.info(f"Login attempt for email: {user_in.email}")
    try:
        user = await db.users.find_one({"email": user_in.email})
        if not user or not verify_password(user_in.password, user["hashed_password"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user["email"]})
        return {"access_token": access_token, "token_type": "bearer"}
    except Exception as e:
        logger.error(f"Login error: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user["_id"]),
        email=current_user["email"],
        full_name=current_user["full_name"],
        created_at=current_user["created_at"]
    )

@app.get("/api/auth/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    history = await db.history.find({"user_id": str(current_user["_id"])}).sort("timestamp", -1).to_list(100)
    for h in history:
        h["id"] = str(h["_id"])
        del h["_id"]
    return history

# ─── Routes ───────────────────────────────────────────────────────────────────


@app.get("/")
async def root():
    from database import test_connection
    db_status = await test_connection()
    return {
        "message": "MediScan API is running 🚀",
        "status": "healthy",
        "database": "connected" if db_status else "disconnected",
        "docs": "/docs"
    }


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "MediScan API"}


@app.post("/api/scan")
async def scan(file: UploadFile = File(...), current_user: dict = Depends(get_optional_user)):
    """
    Accept a medicine image, analyze it with Groq Vision,
    and return structured medicine information.
    """
    logger.info(f"Scan request received: {file.filename} ({file.content_type})")
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/gif"]
    if file.content_type not in allowed_types:
        logger.warning(f"Invalid file type: {file.content_type}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Please upload a JPEG, PNG, or WebP image.",
        )

    try:
        image_bytes = await file.read()
        
        # Validate file size (max 10MB)
        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

        result = await scan_medicine(image_bytes, file.content_type)

        if not result["success"]:
            logger.error(f"Scan failed: {result.get('error')}")
            raise HTTPException(status_code=422, detail=result["error"])

        # Save to history if user is logged in
        if current_user:
            try:
                scan_data = result["data"]
                history_item = {
                    "user_id": str(current_user["_id"]),
                    "medicine_name": scan_data.get("medicine_name", "Unknown Medicine"),
                    "generic_name": scan_data.get("generic_name"),
                    "confidence": scan_data.get("confidence", "low"),
                    "timestamp": datetime.utcnow(),
                    "data": scan_data
                }
                await db.history.insert_one(history_item)
                logger.info(f"Scan saved to history for user {current_user['email']}")
            except Exception as e:
                logger.error(f"Failed to save scan history: {e}")

        return {
            "success": True,
            "data": result["data"],
            "filename": file.filename,
        }
    except Exception as e:
        logger.exception("Unexpected error during scan")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")



@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with MediBot about a medicine or general health questions.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    session_id = request.session_id or str(uuid.uuid4())
    logger.info(f"Chat request for session: {session_id}")

    result = await send_message(
        session_id=session_id,
        message=request.message,
        medicine_context=request.medicine_context,
    )

    if not result["success"]:
        logger.error(f"Chat failed: {result.get('error')}")
        raise HTTPException(status_code=500, detail=result["error"])

    return ChatResponse(
        reply=result["reply"],
        session_id=session_id,
        success=True,
    )


@app.delete("/api/chat/{session_id}")
async def delete_chat_session(session_id: str):
    """Clear a chat session to start fresh."""
    await clear_session(session_id)
    return {"success": True, "message": "Session cleared."}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    logger.info(f"Starting server on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)

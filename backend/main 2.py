from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.scanner import scan_medicine
from services.chat import send_message, clear_session
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="MediScan API",
    description="AI-powered medicine scanning and chat API using Google Gemini",
    version="1.0.0",
)

# CORS — allow frontend (Vercel) and local dev
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", "*"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten this to 'origins' after deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Models ───────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    medicine_context: dict | None = None


class ChatResponse(BaseModel):
    reply: str
    session_id: str
    success: bool


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"message": "MediScan API is running 🚀", "status": "healthy"}


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "MediScan API"}


@app.post("/api/scan")
async def scan(file: UploadFile = File(...)):
    """
    Accept a medicine image, analyze it with Gemini Vision,
    and return structured medicine information.
    """
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Please upload a JPEG, PNG, or WebP image.",
        )

    # Validate file size (max 10MB)
    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 10MB.")

    result = await scan_medicine(image_bytes, file.content_type)

    if not result["success"]:
        raise HTTPException(status_code=422, detail=result["error"])

    return {
        "success": True,
        "data": result["data"],
        "filename": file.filename,
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with MediBot about a medicine or general health questions.
    Pass session_id to maintain conversation history.
    Pass medicine_context on the first message to pre-load medicine info.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    session_id = request.session_id or str(uuid.uuid4())

    result = await send_message(
        session_id=session_id,
        message=request.message,
        medicine_context=request.medicine_context,
    )

    if not result["success"]:
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

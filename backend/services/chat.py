import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROK_API_KEY"))

SYSTEM_PROMPT = """You are MediBot, a helpful and responsible medical information assistant for the MediScan app.

Your role:
- Answer questions about medicines, their uses, side effects, dosages, and interactions
- Provide clear, accurate, easy-to-understand medical information
- Always recommend consulting a licensed healthcare professional for personal medical advice
- Be empathetic and supportive

Guidelines:
- Keep responses concise and well-structured
- Use bullet points for lists
- Never diagnose conditions or prescribe treatments
- If asked about something unrelated to medicine/health, politely redirect the conversation
- Always prioritize patient safety
"""


def create_chat_session(medicine_context: dict | None = None) -> list:
    """Create a new chat session history with optional medicine context."""
    history = [
        {"role": "system", "content": SYSTEM_PROMPT}
    ]

    if medicine_context and medicine_context.get("medicine_name"):
        context_msg = f"""The user has just scanned a medicine. Here is the information extracted:
- Medicine: {medicine_context.get('medicine_name', 'Unknown')}
- Generic Name: {medicine_context.get('generic_name', 'N/A')}
- Uses: {', '.join(medicine_context.get('uses', []))}
- Side Effects: {', '.join(medicine_context.get('side_effects', []))}
- Warnings: {', '.join(medicine_context.get('warnings', []))}
- Dosage: {medicine_context.get('dosage', 'N/A')}

Use this context to answer the user's questions about this medicine."""

        history.append({"role": "user", "content": context_msg})
        history.append({
            "role": "assistant",
            "content": f"I've reviewed the information for **{medicine_context.get('medicine_name')}**. I'm ready to answer any questions you have about this medicine!"
        })

    return history


# In-memory session store (for simplicity — use Redis in production)
chat_sessions: dict[str, list] = {}


async def send_message(session_id: str, message: str, medicine_context: dict | None = None) -> dict:
    """Send a message in a chat session and return the AI response."""
    try:
        if session_id not in chat_sessions:
            chat_sessions[session_id] = create_chat_session(medicine_context)

        chat_history = chat_sessions[session_id]
        
        # append user message
        chat_history.append({"role": "user", "content": message})

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=chat_history
        )
        
        reply = response.choices[0].message.content
        
        # append assistant reply
        chat_history.append({"role": "assistant", "content": reply})

        return {
            "success": True,
            "reply": reply,
            "session_id": session_id,
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Chat failed: {str(e)}",
            "reply": None,
        }


async def clear_session(session_id: str):
    """Clear a chat session."""
    if session_id in chat_sessions:
        del chat_sessions[session_id]

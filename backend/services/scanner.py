import base64
import json
import os
import re
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

# Initialize Groq client
api_key = os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY")
client = Groq(api_key=api_key)

SCAN_PROMPT = """
You are a highly accurate medical information assistant. Analyze this medicine image (medicine strip, bottle, box, or prescription) and extract all details.

Return ONLY a valid JSON object. Do not include any conversational text or markdown blocks.
Required JSON structure:
{
  "medicine_name": "Full brand name",
  "generic_name": "Generic/chemical name",
  "manufacturer": "Manufacturer name",
  "description": "Short description of the medicine",
  "uses": ["use1", "use2"],
  "dosage": "Typical dosage",
  "side_effects": ["effect1", "effect2"],
  "warnings": ["warning1", "warning2"],
  "interactions": ["interaction1", "interaction2"],
  "storage": "Storage instructions",
  "confidence": "high/medium/low"
}

If you cannot identify a field, use null.
If the image is not medicine-related, set medicine_name to null and add an "error" field.
"""


def extract_json(text: str) -> str:
    """Extract JSON object from text using regex to handle potential chatter or markdown."""
    # Try to find content between first { and last }
    match = re.search(r'(\{.*\})', text, re.DOTALL)
    if match:
        return match.group(1)
    return text


async def scan_medicine(image_bytes: bytes, content_type: str) -> dict:
    """
    Send a medicine image to Groq Vision and return structured medicine info.
    """
    if not api_key:
        return {"success": False, "error": "Groq API Key not configured.", "data": None}

    try:
        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        
        # Use standard Groq vision model
        model_name = os.getenv("GROQ_MODEL", "llama-3.2-11b-vision-preview")
        response = client.chat.completions.create(
            model=model_name,

            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": SCAN_PROMPT},
                        {
                            "type": "image_url",
                            "image_url": {"url": f"data:{content_type};base64,{base64_image}"}
                        }
                    ]
                }
            ],
            temperature=0.1  # Lower temperature for more deterministic JSON
        )


        raw_text = response.choices[0].message.content.strip()
        json_text = extract_json(raw_text)

        result = json.loads(json_text)
        
        # Check if the AI flagged an error
        if result.get("medicine_name") is None and result.get("error"):
            return {"success": False, "error": result["error"], "data": None}

        return {"success": True, "data": result}

    except json.JSONDecodeError as e:
        print(f"JSON Parse Error: {str(e)} | Raw: {raw_text}")
        return {
            "success": False,
            "error": "Failed to parse medicine data. The image might be unclear.",
            "data": None,
        }
    except Exception as e:
        print(f"Scanner Exception: {str(e)}")
        return {
            "success": False,
            "error": f"Scan failed: {str(e)}",
            "data": None,
        }

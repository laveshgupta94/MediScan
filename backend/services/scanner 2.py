import base64
import json
import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROK_API_KEY"))

SCAN_PROMPT = """
You are a knowledgeable medical information assistant. Carefully analyze this medicine image (could be a medicine strip, bottle, box, or prescription) and extract all visible information.

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "medicine_name": "Full brand name of the medicine",
  "generic_name": "Generic/chemical name if identifiable",
  "manufacturer": "Manufacturer name if visible",
  "description": "Short description of what this medicine is",
  "uses": ["Primary use 1", "Use 2", "Use 3"],
  "dosage": "Typical dosage information",
  "side_effects": ["Side effect 1", "Side effect 2", "Side effect 3"],
  "warnings": ["Warning 1", "Warning 2"],
  "interactions": ["Drug interaction 1", "Drug interaction 2"],
  "storage": "Storage instructions",
  "confidence": "high/medium/low"
}

If you cannot identify specific information from the image, use null for that field.
If the image is not a medicine, set medicine_name to null and add an "error" field explaining what was seen.
Be accurate, responsible, and always recommend consulting a healthcare professional.
"""


async def scan_medicine(image_bytes: bytes, content_type: str) -> dict:
    """
    Send a medicine image to Groq Vision and return structured medicine info.
    """
    try:
        base64_image = base64.b64encode(image_bytes).decode("utf-8")
        
        response = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
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
            response_format={"type": "json_object"}
        )

        raw_text = response.choices[0].message.content.strip()

        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
            raw_text = raw_text.strip()

        result = json.loads(raw_text)
        return {"success": True, "data": result}

    except json.JSONDecodeError:
        return {
            "success": False,
            "error": "Could not parse medicine information. Please try a clearer image.",
            "data": None,
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Scan failed: {str(e)}",
            "data": None,
        }

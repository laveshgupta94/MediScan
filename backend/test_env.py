import os
from dotenv import load_dotenv

load_dotenv()
key = os.getenv("GROQ_API_KEY")
if key:
    print(f"Key loaded: {key[:10]}...")
else:
    print("Key not found!")

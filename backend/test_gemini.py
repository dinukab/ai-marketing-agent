import os
from dotenv import load_dotenv
from google import genai

# Read settings from the .env file
load_dotenv()

# Get the API key and model name
api_key = os.getenv("GEMINI_API_KEY")
model_name = os.getenv("GEMINI_MODEL")

# Check whether configuration exists
if not api_key:
    raise ValueError(
        "GEMINI_API_KEY is missing. Check your .env file."
    )

if not model_name:
    raise ValueError(
        "GEMINI_MODEL is missing. Check your .env file."
    )

# Connect to Gemini
client = genai.Client(api_key=api_key)

# Send a test message
response = client.models.generate_content(
    model=model_name,
    contents="Explain what customer review sentiment means in simple English."
)

# Display the AI response
print("\nGemini response:")
print(response.text)

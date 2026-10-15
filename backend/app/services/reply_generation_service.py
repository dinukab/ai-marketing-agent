import os

from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is missing from .env")

if not GEMINI_MODEL:
    raise RuntimeError("GEMINI_MODEL is missing from .env")

client = genai.Client(api_key=GEMINI_API_KEY)


def generate_review_reply(
    review_text: str,
    rating: int,
    business_name: str,
    ai_tone: str = "Professional",
    custom_rules: str | None = None,
    sentiment: str | None = None,
) -> str:

    prompt = f"""
You are a professional customer review reply assistant.

Business name: {business_name}
Customer rating: {rating}/5
Customer sentiment: {sentiment or "Not specified"}
Customer review: {review_text}

Preferred reply tone: {ai_tone}
Additional business rules: {custom_rules or "None"}

Instructions:
1. Write a helpful, natural reply to the customer.
2. Match the requested tone: {ai_tone}.
3. Consider the customer's rating, detected sentiment, and feedback:
   - For positive feedback/sentiment: express sincere gratitude and celebrate the positive aspects mentioned.
   - For negative feedback/sentiment: apologize sincerely, be empathetic, show accountability without being defensive, and invite offline resolution if appropriate.
   - For neutral or mixed feedback/sentiment: address specific comments politely and constructively.
4. Strictly follow any additional business rules provided above.
5. Never argue with the customer or invent facts.
6. Do not promise refunds, free products, or discounts unless explicitly authorized by the business rules.
7. Return only the reply text, without quotation marks, markdown headings, or prefixes.
8. Keep the reply concise, usually 2 to 4 sentences.
"""

    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.4,
        ),
    )

    if not response.text or not response.text.strip():
        raise ValueError("Gemini returned an empty reply")

    return response.text.strip()

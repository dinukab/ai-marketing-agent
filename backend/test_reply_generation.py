from app.services.reply_generation_service import generate_review_reply

reply = generate_review_reply(
    review_text="The staff were friendly and the food was delicious!",
    rating=5,
    business_name="ABC Restaurant",
    ai_tone="Friendly",
)

print("\nGenerated reply:")
print(reply)
import os
import resend
from dotenv import load_dotenv

load_dotenv()
# Hardcoded API key as requested
resend.api_key = os.getenv("RESEND_API_KEY")

def send_password_reset_email(to_email: str, reset_token: str):
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    reset_link = f"{frontend_url}/reset-password?token={reset_token}"
    
    params = {
        "from": "onboarding@resend.dev",
        "to": [to_email],
        "subject": "Reset your ReviewPilot AI password",
        "html": f"""
            <h2>Password Reset Request</h2>
            <p>Click the link below to create a new password:</p>
            <a href="{reset_link}">Reset Password</a>
            <p>This link expires in 30 minutes.</p>
        """,
    }

    return resend.Emails.send(params)
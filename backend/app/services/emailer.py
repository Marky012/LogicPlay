import random
import string
import smtplib
import os
from email.message import EmailMessage

def generate_6_digit_code() -> str:
    return ''.join(random.choices(string.digits, k=6))

def send_verification_email(to_email: str, code: str):
    print(f"\n{'='*40}")
    print(f"📧 EMAIL SIMULATION TO: {to_email}")
    print(f"🔐 VERIFICATION CODE: {code}")
    print(f"{'='*40}\n")
    
    # Optional: If you want to configure real SMTP later:
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = os.getenv("SMTP_PORT", 587)
    smtp_user = os.getenv("SMTP_USER")
    smtp_pass = os.getenv("SMTP_PASS")
    
    if smtp_server and smtp_user and smtp_pass:
        try:
            msg = EmailMessage()
            msg.set_content(f"Your LogicPlay verification code is: {code}\n\nThis code will expire in 10 minutes.")
            msg['Subject'] = 'LogicPlay Device Verification'
            msg['From'] = smtp_user
            msg['To'] = to_email
            
            server = smtplib.SMTP(smtp_server, int(smtp_port))
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.send_message(msg)
            server.quit()
        except Exception as e:
            print(f"⚠️ Failed to send real email: {e}")

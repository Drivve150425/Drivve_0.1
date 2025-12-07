from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
import random
from datetime import datetime, timedelta
from typing import Dict
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

router = APIRouter(prefix="/auth", tags=["Email Authentication"])

# In-memory OTP storage
otp_store: Dict[str, Dict] = {}

# Email config (add these to your .env file)
EMAIL_USER = os.getenv("EMAIL_USER", "your-email@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "your-app-password")

class EmailOTPRequest(BaseModel):
    email: EmailStr

class EmailOTPVerify(BaseModel):
    email: EmailStr
    otp: str

def generate_otp() -> str:
    return str(random.randint(100000, 999999))

def get_email_html(otp: str) -> str:
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
            <tr>
                <td align="center">
                    <table width="600" style="background-color: #ffffff; border-radius: 10px;">
                        <tr>
                            <td style="background: linear-gradient(135deg, #0B4A8F 0%, #1565C0 100%); padding: 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0;">DRIVVE</h1>
                                <p style="color: #E3F2FD; margin: 10px 0 0 0;">Email Verification</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 40px 30px;">
                                <h2 style="color: #333333;">Verify Your Email</h2>
                                <p style="color: #666666;">Your verification code is:</p>
                                <div style="text-align: center; padding: 20px; background-color: #F5F5F5; border-radius: 8px;">
                                    <h1 style="color: #0B4A8F; font-size: 42px; letter-spacing: 8px; margin: 0;">{otp}</h1>
                                </div>
                                <p style="color: #999999; margin-top: 30px;">
                                    This code expires in <strong>5 minutes</strong>.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """

async def send_email(to_email: str, otp: str):
    message = MIMEMultipart("alternative")
    message["From"] = f"DRIVVE <{EMAIL_USER}>"
    message["To"] = to_email
    message["Subject"] = "DRIVVE - Email Verification Code"
    
    html_part = MIMEText(get_email_html(otp), "html")
    message.attach(html_part)
    
    try:
        await aiosmtplib.send(
            message,
            hostname="smtp.gmail.com",
            port=587,
            username=EMAIL_USER,
            password=EMAIL_PASSWORD,
            start_tls=True,
        )
    except Exception as e:
        print(f"❌ Email error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to send email"
        )

@router.post("/send-email-otp")
async def send_email_otp(request: EmailOTPRequest):
    try:
        email = request.email.lower()
        otp = generate_otp()
        
        otp_store[email] = {
            "otp": otp,
            "expires_at": datetime.now() + timedelta(minutes=5)
        }
        
        await send_email(email, otp)
        
        print(f"✅ OTP sent to {email}: {otp}")
        
        return {
            "success": True,
            "message": "Verification code sent"
        }
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/verify-email-otp")
async def verify_email_otp(request: EmailOTPVerify):
    try:
        email = request.email.lower()
        
        if email not in otp_store:
            raise HTTPException(status_code=404, detail="OTP not found")
        
        data = otp_store[email]
        
        if datetime.now() > data["expires_at"]:
            del otp_store[email]
            raise HTTPException(status_code=410, detail="OTP expired")
        
        if data["otp"] != request.otp:
            raise HTTPException(status_code=400, detail="Invalid OTP")
        
        del otp_store[email]
        
        return {
            "success": True,
            "message": "Email verified"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

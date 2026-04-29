import os
import json
from dotenv import load_dotenv
from firebase_admin import credentials, initialize_app, auth

# Load environment variables from .env file (if present)
load_dotenv()

# Path to the service account JSON downloaded from Firebase Console
# User must place their firebase-service-account.json in the backend/ directory
SERVICE_ACCOUNT_PATH = os.path.join(
    os.path.dirname(__file__), "..", "firebase-service-account.json"
)

firebase_app = None

def init_firebase_admin():
    global firebase_app
    if firebase_app is not None:
        return firebase_app

    service_account_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")

    if service_account_json:
        try:
            cred_dict = json.loads(service_account_json)
            cred = credentials.Certificate(cred_dict)
            firebase_app = initialize_app(cred)
            print("✅ Firebase Admin SDK initialized from environment variable")
        except Exception as e:
            print(
                "⚠️  Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", e,
                "\n   Firebase token verification will be skipped in dev mode.",
            )
            firebase_app = None
    elif os.path.exists(SERVICE_ACCOUNT_PATH):
        cred = credentials.Certificate(SERVICE_ACCOUNT_PATH)
        firebase_app = initialize_app(cred)
        print("✅ Firebase Admin SDK initialized from file")
    else:
        print(
            "⚠️  FIREBASE_SERVICE_ACCOUNT_JSON not set and firebase-service-account.json not found at",
            SERVICE_ACCOUNT_PATH,
            "\n   Firebase token verification will be skipped in dev mode.",
        )
        firebase_app = None
    return firebase_app


def verify_firebase_token(id_token: str) -> dict:
    """
    Verify a Firebase ID token.
    Returns the decoded token dict on success.
    Raises ValueError on failure.
    """
    if firebase_app is None:
        # Development fallback: skip verification
        print("⚠️  Firebase Admin not initialized — skipping token verification")
        return {"uid": "dev-uid", "phone_number": None}

    try:
        decoded_token = auth.verify_id_token(id_token, app=firebase_app)
        return decoded_token
    except Exception as e:
        raise ValueError(f"Invalid Firebase ID token: {e}")

def send_sms(phone_number: str, message: str):
    """
    Send SMS via Firebase Auth (uses Firebase Phone Auth verification).
    Note: Firebase Admin SDK does not support sending custom SMS.
    For production, integrate Twilio or MSG91.
    For now, this is a placeholder that returns False to skip SMS.
    """
    if firebase_app is None:
        print("⚠️  Firebase Admin unavailable - SMS skipped")
        return False

    # Firebase Admin SDK does not have a method to send custom SMS.
    # The auth.verify_phone_number is for client-side verification, not server-side.
    # For now, we skip SMS and let the frontend handle Firebase Phone Auth flow.
    print(f"⚠️  Firebase Admin SDK does not support sending custom SMS")
    print(f"   Use frontend Firebase Phone Auth or integrate Twilio/MSG91 for SMS")
    print(f"   OTP code: {message}")
    return False


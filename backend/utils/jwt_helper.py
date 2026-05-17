import jwt
import datetime

SECRET_KEY = "drivve_secret_key"

ACCESS_EXPIRE_MINUTES = 60

REFRESH_EXPIRE_DAYS = 30


def create_access_token(user_id):

    payload = {

        "user_id": user_id,

        "type": "access",

        "exp":
            datetime.datetime.utcnow()
            + datetime.timedelta(
                minutes=
                ACCESS_EXPIRE_MINUTES
            )
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm="HS256"
    )

    return token


def create_refresh_token(user_id):

    payload = {

        "user_id": user_id,

        "type": "refresh",

        "exp":
            datetime.datetime.utcnow()
            + datetime.timedelta(
                days=
                REFRESH_EXPIRE_DAYS
            )
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm="HS256"
    )

    return token


def decode_token(token):

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        return payload

    except Exception:

        return None
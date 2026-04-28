"""
Socket.IO handler for real-time chat.
Mounted as an ASGI sub-application in main.py.
"""

import socketio
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Conversation, ChatMessage

# Create Socket.IO server with ASGI mode
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    ping_interval=25,
    ping_timeout=10,
)

# Wrap in ASGI app
socket_app = socketio.ASGIApp(sio, socketio_path="socket.io")


def normalize_phone(phone: str) -> str:
    if not phone:
        return phone
    phone = phone.replace(" ", "").replace("-", "")
    if phone.startswith("+91"):
        return phone
    if phone.startswith("91") and len(phone) == 12:
        return f"+{phone}"
    if phone.startswith("+"):
        return phone
    return f"+91{phone}"


# ─────────────────────────────────────────────────────────────────────────────
# Connection / Disconnection
# ─────────────────────────────────────────────────────────────────────────────

@sio.event
async def connect(sid, environ, auth):
    """Client connects — store their phone number in the session."""
    phone = None
    if auth and isinstance(auth, dict):
        phone = auth.get("phone_number") or auth.get("token")
    if not phone:
        # Try query string fallback
        query = environ.get("QUERY_STRING", "")
        for part in query.split("&"):
            if part.startswith("phone="):
                phone = part.split("=", 1)[1]
                break

    if not phone:
        print(f"[socket] Connection rejected for {sid}: no phone")
        return False

    phone = normalize_phone(phone)
    await sio.save_session(sid, {"phone_number": phone})
    print(f"[socket] Connected: {sid} -> {phone}")
    await sio.emit("connected", {"sid": sid, "phone": phone}, to=sid)


@sio.event
async def disconnect(sid):
    session = await sio.get_session(sid)
    phone = session.get("phone_number", "unknown") if session else "unknown"
    print(f"[socket] Disconnected: {sid} ({phone})")


# ─────────────────────────────────────────────────────────────────────────────
# Join / Leave Conversation Room
# ─────────────────────────────────────────────────────────────────────────────

@sio.event
async def join_conversation(sid, data):
    """Client joins a conversation room so they receive messages for it."""
    conv_id = data.get("conversation_id") if data else None
    if not conv_id:
        await sio.emit("error", {"message": "conversation_id required"}, to=sid)
        return

    room = f"conv_{conv_id}"
    await sio.enter_room(sid, room)
    await sio.emit("joined_conversation", {"conversation_id": conv_id, "room": room}, to=sid)
    print(f"[socket] {sid} joined room {room}")


@sio.event
async def leave_conversation(sid, data):
    conv_id = data.get("conversation_id") if data else None
    if conv_id:
        room = f"conv_{conv_id}"
        await sio.leave_room(sid, room)
        await sio.emit("left_conversation", {"conversation_id": conv_id}, to=sid)


# ─────────────────────────────────────────────────────────────────────────────
# Send / Receive Messages
# ─────────────────────────────────────────────────────────────────────────────

@sio.event
async def send_message(sid, data):
    """Client sends a message — persist it and broadcast to the room."""
    session = await sio.get_session(sid)
    sender_phone = normalize_phone(session.get("phone_number", "")) if session else ""

    conv_id = data.get("conversation_id")
    text = data.get("text", "").strip()
    msg_type = data.get("type", "text")
    file_url = data.get("file_url")

    if not conv_id or not text:
        await sio.emit("error", {"message": "conversation_id and text required"}, to=sid)
        return

    db: Session = SessionLocal()
    try:
        conv = db.query(Conversation).filter(Conversation.id == conv_id).first()
        if not conv:
            await sio.emit("error", {"message": "Conversation not found"}, to=sid)
            return

        if sender_phone not in (conv.participant_1_phone, conv.participant_2_phone):
            await sio.emit("error", {"message": "Not a participant"}, to=sid)
            return

        msg = ChatMessage(
            conversation_id=conv_id,
            sender_phone=sender_phone,
            text=text,
            type=msg_type,
            file_url=file_url,
            status="sent",
        )
        db.add(msg)
        db.flush()

        conv.last_message = text
        conv.last_message_time = msg.created_at
        conv.last_message_type = msg_type

        db.commit()

        payload = {
            "id": msg.id,
            "conversation_id": conv_id,
            "sender_id": sender_phone,
            "sender_phone": sender_phone,
            "text": text,
            "type": msg_type,
            "file_url": file_url,
            "status": "sent",
            "created_at": msg.created_at.isoformat() if msg.created_at else None,
        }

        room = f"conv_{conv_id}"
        await sio.emit("new_message", payload, room=room, skip_sid=sid)
        await sio.emit("message_sent", {"message_id": msg.id}, to=sid)
        print(f"[socket] Message {msg.id} sent in room {room}")

    except Exception as e:
        db.rollback()
        print(f"[socket] send_message error: {e}")
        await sio.emit("error", {"message": str(e)}, to=sid)
    finally:
        db.close()


# ─────────────────────────────────────────────────────────────────────────────
# Typing Indicator
# ─────────────────────────────────────────────────────────────────────────────

@sio.event
async def typing(sid, data):
    session = await sio.get_session(sid)
    sender_phone = session.get("phone_number", "") if session else ""
    conv_id = data.get("conversation_id") if data else None
    is_typing = data.get("typing", False) if data else False

    if conv_id:
        room = f"conv_{conv_id}"
        await sio.emit("user_typing", {
            "conversation_id": conv_id,
            "user_id": sender_phone,
            "typing": is_typing,
        }, room=room, skip_sid=sid)


# ─────────────────────────────────────────────────────────────────────────────
# Mark Messages as Seen
# ─────────────────────────────────────────────────────────────────────────────

@sio.event
async def mark_seen(sid, data):
    session = await sio.get_session(sid)
    me = normalize_phone(session.get("phone_number", "")) if session else ""

    conv_id = data.get("conversation_id")
    message_ids = data.get("message_ids", [])

    if not conv_id or not message_ids:
        return

    db: Session = SessionLocal()
    try:
        updated = db.query(ChatMessage).filter(
            ChatMessage.conversation_id == conv_id,
            ChatMessage.id.in_(message_ids),
            ChatMessage.sender_phone != me,
        ).update({"status": "seen"}, synchronize_session=False)
        db.commit()

        room = f"conv_{conv_id}"
        await sio.emit("messages_seen", {
            "conversation_id": conv_id,
            "message_ids": message_ids,
        }, room=room, skip_sid=sid)
        print(f"[socket] {updated} messages marked seen in {room}")
    except Exception as e:
        db.rollback()
        print(f"[socket] mark_seen error: {e}")
    finally:
        db.close()


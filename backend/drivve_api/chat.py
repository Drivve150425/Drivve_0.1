"""
Chat API — REST endpoints for conversations and messages.
Auth: X-Phone-Number header (matches the app's phone-based auth system).
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_, and_, func
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone

from database import get_db
from models import User, Conversation, ChatMessage

router = APIRouter()


# ─────────────────────────────────────────────────────────────────────────────
# Schemas
# ─────────────────────────────────────────────────────────────────────────────

class SendMessageRequest(BaseModel):
    text: str
    type: str = "text"          # text | voice
    file_url: Optional[str] = None


class CreateConversationRequest(BaseModel):
    participant_phone: str      # the OTHER person's phone
    ride_id: Optional[int] = None


class MarkReadRequest(BaseModel):
    message_ids: List[int]


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

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


def get_or_create_conversation(db: Session, phone_a: str, phone_b: str, ride_id: Optional[int] = None):
    """
    Conversations are unique per pair of participants (order-independent).
    """
    a = normalize_phone(phone_a)
    b = normalize_phone(phone_b)

    # Try both orderings
    conv = db.query(Conversation).filter(
        or_(
            and_(Conversation.participant_1_phone == a, Conversation.participant_2_phone == b),
            and_(Conversation.participant_1_phone == b, Conversation.participant_2_phone == a),
        )
    ).first()

    if conv:
        return conv

    conv = Conversation(
        participant_1_phone=a,
        participant_2_phone=b,
        ride_id=ride_id,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def user_display_name(db: Session, phone: str) -> str:
    user = db.query(User).filter(User.phone_number == phone).first()
    if user:
        return user.full_name or user.first_name or f"User {phone[-4:]}"
    return f"User {phone[-4:]}"


def user_profile_pic(db: Session, phone: str) -> Optional[str]:
    user = db.query(User).filter(User.phone_number == phone).first()
    return user.profile_picture if user else None


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/chat/conversations
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/api/chat/conversations")
def list_conversations(
    x_phone_number: Optional[str] = Header(None, alias="X-Phone-Number"),
    db: Session = Depends(get_db),
):
    """
    List all conversations where the current user is a participant.
    Returns summary with last message, unread count, and other user info.
    """
    if not x_phone_number:
        raise HTTPException(status_code=401, detail="X-Phone-Number header required")

    me = normalize_phone(x_phone_number)

    convs = db.query(Conversation).filter(
        or_(Conversation.participant_1_phone == me, Conversation.participant_2_phone == me)
    ).order_by(desc(Conversation.last_message_time)).all()

    result = []
    for conv in convs:
        other_phone = conv.participant_2_phone if conv.participant_1_phone == me else conv.participant_1_phone

        unread_count = db.query(ChatMessage).filter(
            ChatMessage.conversation_id == conv.id,
            ChatMessage.sender_phone == other_phone,
            ChatMessage.status != "seen"
        ).count()

        result.append({
            "id": conv.id,
            "ride_id": conv.ride_id,
            "other_user": {
                "id": other_phone,   # using phone as ID for simplicity
                "phone": other_phone,
                "name": user_display_name(db, other_phone),
                "avatar": user_profile_pic(db, other_phone),
            },
            "last_message": conv.last_message,
            "last_message_time": conv.last_message_time.isoformat() if conv.last_message_time else None,
            "last_message_type": conv.last_message_type,
            "unread_count": unread_count,
            "created_at": conv.created_at.isoformat() if conv.created_at else None,
        })

    return {"success": True, "conversations": result}


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/chat/conversations
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/api/chat/conversations")
def create_conversation(
    data: CreateConversationRequest,
    x_phone_number: Optional[str] = Header(None, alias="X-Phone-Number"),
    db: Session = Depends(get_db),
):
    if not x_phone_number:
        raise HTTPException(status_code=401, detail="X-Phone-Number header required")

    me = normalize_phone(x_phone_number)
    other = normalize_phone(data.participant_phone)

    if me == other:
        raise HTTPException(status_code=400, detail="Cannot chat with yourself")

    conv = get_or_create_conversation(db, me, other, data.ride_id)

    other_phone = conv.participant_2_phone if conv.participant_1_phone == me else conv.participant_1_phone

    return {
        "success": True,
        "conversation": {
            "id": conv.id,
            "ride_id": conv.ride_id,
            "other_user": {
                "id": other_phone,
                "phone": other_phone,
                "name": user_display_name(db, other_phone),
                "avatar": user_profile_pic(db, other_phone),
            },
            "created_at": conv.created_at.isoformat() if conv.created_at else None,
        }
    }


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/chat/conversations/{conversation_id}/messages
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/api/chat/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: int,
    x_phone_number: Optional[str] = Header(None, alias="X-Phone-Number"),
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
):
    if not x_phone_number:
        raise HTTPException(status_code=401, detail="X-Phone-Number header required")

    me = normalize_phone(x_phone_number)

    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if me not in (conv.participant_1_phone, conv.participant_2_phone):
        raise HTTPException(status_code=403, detail="Not a participant")

    messages = db.query(ChatMessage).filter(
        ChatMessage.conversation_id == conversation_id
    ).order_by(ChatMessage.created_at.asc()).offset(offset).limit(limit).all()

    # Auto-mark delivered
    for msg in messages:
        if msg.status == "sent" and msg.sender_phone != me:
            msg.status = "delivered"

    db.commit()

    return {
        "success": True,
        "messages": [
            {
                "id": m.id,
                "conversation_id": m.conversation_id,
                "sender_id": m.sender_phone,   # frontend uses sender_id
                "sender_phone": m.sender_phone,
                "text": m.text,
                "type": m.type,
                "file_url": m.file_url,
                "status": m.status,
                "created_at": m.created_at.isoformat() if m.created_at else None,
                "from_me": m.sender_phone == me,
                "sender_name": "You" if m.sender_phone == me else user_display_name(db, m.sender_phone),
            }
            for m in messages
        ]
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/chat/conversations/{conversation_id}/messages
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/api/chat/conversations/{conversation_id}/messages")
def send_message(
    conversation_id: int,
    data: SendMessageRequest,
    x_phone_number: Optional[str] = Header(None, alias="X-Phone-Number"),
    db: Session = Depends(get_db),
):
    if not x_phone_number:
        raise HTTPException(status_code=401, detail="X-Phone-Number header required")

    me = normalize_phone(x_phone_number)

    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if me not in (conv.participant_1_phone, conv.participant_2_phone):
        raise HTTPException(status_code=403, detail="Not a participant")

    msg = ChatMessage(
        conversation_id=conversation_id,
        sender_phone=me,
        text=data.text,
        type=data.type,
        file_url=data.file_url,
        status="sent",
    )
    db.add(msg)
    db.flush()

    # Update conversation last message
    conv.last_message = data.text
    conv.last_message_time = msg.created_at
    conv.last_message_type = data.type

    db.commit()
    db.refresh(msg)

    return {
        "success": True,
        "message": {
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "sender_id": msg.sender_phone,
            "sender_phone": msg.sender_phone,
            "text": msg.text,
            "type": msg.type,
            "file_url": msg.file_url,
            "status": msg.status,
            "created_at": msg.created_at.isoformat() if msg.created_at else None,
            "from_me": True,
            "sender_name": "You",
        }
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/chat/conversations/{conversation_id}/messages/read
# ─────────────────────────────────────────────────────────────────────────────

@router.post("/api/chat/conversations/{conversation_id}/messages/read")
def mark_messages_read(
    conversation_id: int,
    data: MarkReadRequest,
    x_phone_number: Optional[str] = Header(None, alias="X-Phone-Number"),
    db: Session = Depends(get_db),
):
    if not x_phone_number:
        raise HTTPException(status_code=401, detail="X-Phone-Number header required")

    me = normalize_phone(x_phone_number)

    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if me not in (conv.participant_1_phone, conv.participant_2_phone):
        raise HTTPException(status_code=403, detail="Not a participant")

    updated = db.query(ChatMessage).filter(
        ChatMessage.conversation_id == conversation_id,
        ChatMessage.id.in_(data.message_ids),
        ChatMessage.sender_phone != me,
    ).update({"status": "seen"}, synchronize_session=False)

    db.commit()

    return {"success": True, "marked_read": updated}


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/chat/unread-count
# ─────────────────────────────────────────────────────────────────────────────

@router.get("/api/chat/unread-count")
def unread_count(
    x_phone_number: Optional[str] = Header(None, alias="X-Phone-Number"),
    db: Session = Depends(get_db),
):
    if not x_phone_number:
        raise HTTPException(status_code=401, detail="X-Phone-Number header required")

    me = normalize_phone(x_phone_number)

    count = db.query(ChatMessage).join(Conversation).filter(
        or_(Conversation.participant_1_phone == me, Conversation.participant_2_phone == me),
        ChatMessage.sender_phone != me,
        ChatMessage.status.in_(["sent", "delivered"]),
    ).count()

    return {"success": True, "unread_count": count}
# Add these endpoints to your chat router

@router.post("/api/chat/conversations/{conversation_id}/clear")
def clear_chat(
    conversation_id: int,
    x_phone_number: Optional[str] = Header(None, alias="X-Phone-Number"),
    db: Session = Depends(get_db),
):
    """Clear all messages in a conversation for the user"""
    if not x_phone_number:
        raise HTTPException(status_code=401, detail="X-Phone-Number header required")
    
    me = normalize_phone(x_phone_number)
    
    conv = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    if me not in (conv.participant_1_phone, conv.participant_2_phone):
        raise HTTPException(status_code=403, detail="Not a participant")
    
    # Soft delete or hard delete messages
    db.query(ChatMessage).filter(
        ChatMessage.conversation_id == conversation_id
    ).delete()
    
    # Reset conversation last message
    conv.last_message = None
    conv.last_message_time = None
    conv.last_message_type = None
    
    db.commit()
    
    return {"success": True, "message": "Chat cleared successfully"}


@router.delete("/api/chat/messages/{message_id}")
def delete_message(
    message_id: int,
    x_phone_number: Optional[str] = Header(None, alias="X-Phone-Number"),
    db: Session = Depends(get_db),
):
    """Delete a specific message"""
    if not x_phone_number:
        raise HTTPException(status_code=401, detail="X-Phone-Number header required")
    
    me = normalize_phone(x_phone_number)
    
    msg = db.query(ChatMessage).filter(ChatMessage.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Only sender can delete their own messages
    if msg.sender_phone != me:
        raise HTTPException(status_code=403, detail="Can only delete your own messages")
    
    db.delete(msg)
    db.commit()
    
    return {"success": True, "message": "Message deleted"}


@router.post("/api/chat/report-user")
def report_user(
    data: dict,
    x_phone_number: Optional[str] = Header(None, alias="X-Phone-Number"),
    db: Session = Depends(get_db),
):
    """Report a user"""
    # Store report in database (create a reports table)
    # For now, just log and return success
    print(f"User {x_phone_number} reported user {data.get('reported_user_phone')}")
    return {"success": True, "message": "User reported"}


@router.post("/api/chat/report-message")
def report_message(
    data: dict,
    x_phone_number: Optional[str] = Header(None, alias="X-Phone-Number"),
    db: Session = Depends(get_db),
):
    """Report a specific message"""
    print(f"User {x_phone_number} reported message {data.get('message_id')}")
    return {"success": True, "message": "Message reported"}
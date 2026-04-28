"""
Migration: Create chat tables (conversations + chat_messages).
Run with: python backend/migrate_chat_tables.py
"""
from sqlalchemy import text
from database import engine

with engine.begin() as conn:
    # conversations
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS conversations (
            id SERIAL PRIMARY KEY,
            participant_1_phone VARCHAR(20) NOT NULL,
            participant_2_phone VARCHAR(20) NOT NULL,
            ride_id INTEGER,
            last_message TEXT,
            last_message_time TIMESTAMP WITH TIME ZONE,
            last_message_type VARCHAR(20) DEFAULT 'text',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """))
    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_conversations_p1 ON conversations (participant_1_phone);
    """))
    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_conversations_p2 ON conversations (participant_2_phone);
    """))
    print("✅ conversations table ready")

    # chat_messages
    conn.execute(text("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id SERIAL PRIMARY KEY,
            conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
            sender_phone VARCHAR(20) NOT NULL,
            text TEXT NOT NULL,
            type VARCHAR(20) DEFAULT 'text',
            file_url VARCHAR(500),
            status VARCHAR(20) DEFAULT 'sent',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    """))
    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages (conversation_id);
    """))
    conn.execute(text("""
        CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages (sender_phone);
    """))
    print("✅ chat_messages table ready")

print("🎉 Chat migration complete!")


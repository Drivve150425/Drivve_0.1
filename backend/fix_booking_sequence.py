"""
Fix PostgreSQL sequence for ride_bookings table.
Run this if you get: duplicate key value violates unique constraint "ride_bookings_pkey"
"""
from sqlalchemy import text
from database import engine

with engine.begin() as conn:
    # Get the sequence name for ride_bookings.id
    result = conn.execute(text("""
        SELECT pg_get_serial_sequence('ride_bookings', 'id')
    """)).scalar()
    
    seq_name = result or 'ride_bookings_id_seq'
    print(f"Sequence name: {seq_name}")
    
    # Reset sequence to max(id) + 1
    conn.execute(text(f"""
        SELECT setval('{seq_name}', COALESCE((SELECT MAX(id) FROM ride_bookings), 0) + 1, false)
    """))
    
    # Verify
    new_val = conn.execute(text(f"SELECT last_value FROM {seq_name}")).scalar()
    print(f"✅ Sequence reset. Next ID will be: {new_val}")


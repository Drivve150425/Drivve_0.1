"""
Migration script: Add missing columns to ride_bookings table.
These columns exist in models.py (RideBooking) but not in the actual DB table.
"""
from sqlalchemy import text
from database import engine

COLUMNS = [
    ("seats_booked", "INTEGER"),
    ("total_amount", "DOUBLE PRECISION"),
    ("pickup_lat", "DOUBLE PRECISION"),
    ("pickup_lon", "DOUBLE PRECISION"),
    ("drop_lat", "DOUBLE PRECISION"),
    ("drop_lon", "DOUBLE PRECISION"),
    ("intersection_pickup_lat", "DOUBLE PRECISION"),
    ("intersection_pickup_lon", "DOUBLE PRECISION"),
    ("intersection_drop_lat", "DOUBLE PRECISION"),
    ("intersection_drop_lon", "DOUBLE PRECISION"),
    ("pickup_walk_distance_m", "INTEGER"),
    ("drop_walk_distance_m", "INTEGER"),
]

with engine.begin() as conn:
    for col_name, col_type in COLUMNS:
        sql = text(f'''
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns
                    WHERE table_name = 'ride_bookings' AND column_name = '{col_name}'
                ) THEN
                    ALTER TABLE ride_bookings ADD COLUMN {col_name} {col_type};
                END IF;
            END $$;
        ''')
        conn.execute(sql)
        print(f"✅ Checked/added column: {col_name}")

print("🎉 Migration complete. ride_bookings table is now aligned with RideBooking model.")


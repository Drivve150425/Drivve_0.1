import re
from typing import Optional

def generate_user_id(first_name: str, last_name: Optional[str], phone_number: str) -> str:
    """
    Generate DRIVVE User ID: D-{FirstInitial}{LastInitial}{Last4Digits}
    
    Examples:
    - Aman Jain, +919990468600 → D-AJ8600
    - Lakshay (no last name), +919990468600 → D-LX8600
    """
    try:
        # Get first initial
        first_initial = first_name[0].upper() if first_name else 'D'
        
        # Get last initial (use 'X' if no last name)
        last_initial = last_name[0].upper() if last_name and len(last_name) > 0 else 'X'
        
        # Extract digits from phone number and get last 4
        digits_only = re.sub(r'\D', '', phone_number)
        last_four_digits = digits_only[-4:] if len(digits_only) >= 4 else digits_only.zfill(4)
        
        # Generate User ID
        user_id = f"D-{first_initial}{last_initial}{last_four_digits}"
        
        return user_id
        
    except Exception as e:
        print(f"Error generating User ID: {e}")
        # Fallback User ID
        import time
        fallback_id = f"D-XX{str(int(time.time()))[-4:]}"
        return fallback_id

def validate_user_id(user_id: str) -> bool:
    """Validate User ID format: D-[A-Z]{2}[0-9]{4}"""
    pattern = r'^D-[A-Z]{2}\d{4}$'
    return bool(re.match(pattern, user_id))

# Test function
def test_user_id_generation():
    test_cases = [
        ("Aman", "Jain", "+919990468600", "D-AJ8600"),
        ("Lakshay", "", "+919990468600", "D-LX8600"),
        ("Priya", "Sharma", "9717557085", "D-PS7085"),
        ("Rahul", None, "9876543210", "D-RX3210"),
    ]
    
    print("Testing User ID Generation:")
    for first, last, phone, expected in test_cases:
        result = generate_user_id(first, last, phone)
        status = "✅" if result == expected else "❌"
        print(f"{status} {first} {last or 'None'} {phone} → {result} (expected: {expected})")

if __name__ == "__main__":
    test_user_id_generation()

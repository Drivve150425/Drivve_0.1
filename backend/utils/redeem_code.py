# utils/redeem_code.py

import random
import string

def generate_redeem_code():
    return "DC-" + "".join(
        random.choices(string.ascii_uppercase + string.digits, k=8)
    )

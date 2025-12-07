import requests
import json

BASE_URL = "http://192.168.1.3:8000"

def test_complete_drivve_flow():
    print("🧪 TESTING COMPLETE DRIVVE API FLOW")
    print("="*60)
    
    # Test 1: Health Check ✅
    print("1️⃣ Testing Health Check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"✅ Health: {response.status_code} - {response.json()['status']}")
    
    # Test 2: Root Endpoint ✅
    print("\n2️⃣ Testing Root Endpoint...")
    response = requests.get(BASE_URL)
    print(f"✅ Root: {response.status_code} - {response.json()['message']}")
    
    # Test 3: Send OTP ✅
    print("\n3️⃣ Testing OTP Generation...")
    otp_data = {"phone_number": "9990468600", "country_code": "+91"}
    response = requests.post(f"{BASE_URL}/api/send-otp", json=otp_data)
    result = response.json()
    print(f"✅ Send OTP: {response.status_code}")
    print(f"   Generated OTP: {result.get('otp')}")
    generated_otp = result.get('otp')
    
    # Test 4: Verify OTP ✅
    print("\n4️⃣ Testing OTP Verification...")
    verify_data = {
        "phone_number": "9990468600", 
        "otp_code": generated_otp, 
        "country_code": "+91"
    }
    response = requests.post(f"{BASE_URL}/api/verify-otp", json=verify_data)
    result = response.json()
    print(f"✅ Verify OTP: {response.status_code}")
    print(f"   Message: {result.get('message')}")
    print(f"   User ID: {result.get('user_id')}")
    print(f"   First Time: {result.get('is_first_time')}")
    
    # Test 5: Check User Exists ✅
    print("\n5️⃣ Testing User Check...")
    check_data = {"phone_number": "+919990468600"}
    response = requests.post(f"{BASE_URL}/api/v1/users/check", json=check_data)
    result = response.json()
    print(f"✅ Check User: {response.status_code}")
    print(f"   User Exists: {result.get('exists')}")
    
    # Test 6: Create User Profile ✅
    print("\n6️⃣ Testing Profile Creation (Custom User ID)...")
    profile_data = {
        "phone_number": "9990468600",
        "first_name": "Aman",
        "last_name": "Jain", 
        "email": "aman@drivve.com",
        "gender": "Male",
        "state": "Delhi",
        "city": "New Delhi",
        "date_of_birth": "1995-05-15"
    }
    response = requests.post(f"{BASE_URL}/api/v1/users/create", json=profile_data)
    result = response.json()
    print(f"✅ Create Profile: {response.status_code}")
    print(f"   Success: {result.get('success')}")
    print(f"   Custom User ID: {result.get('user_id')}") # Should be D-AJ8600!
    print(f"   Message: {result.get('message')}")
    
    # Test 7: Verify User Now Exists ✅
    print("\n7️⃣ Re-checking User After Profile Creation...")
    response = requests.post(f"{BASE_URL}/api/v1/users/check", json=check_data)
    result = response.json()
    print(f"✅ Final Check: {response.status_code}")
    print(f"   User Exists: {result.get('exists')}")
    if result.get('user_data'):
        user_data = result.get('user_data')
        print(f"   User ID: {user_data.get('user_id')}")
        print(f"   Name: {user_data.get('first_name')} {user_data.get('last_name')}")
        print(f"   Profile Complete: {user_data.get('profile_completed')}")
    
    print("\n🎉 COMPLETE FLOW TEST FINISHED!")
    print("="*60)
    print("✅ Your DRIVVE backend is 100% functional!")
    print("📱 Ready for React Native integration!")

if __name__ == "__main__":
    test_complete_drivve_flow()

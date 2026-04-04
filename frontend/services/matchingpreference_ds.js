import { API_BASE_URL } from "../config/config_ip";

class DatabaseService {
// GET MASTER (UI builder)
async getMatchingPreferenceMaster() {
  const res = await fetch(`${API_BASE_URL}/api/v1/matching-preferences/master`);
  return await res.json();
}

// GET USER VALUES
async getUserMatchingPreferences(phoneNumber) {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/matching-preferences/user?phone_number=${encodeURIComponent(phoneNumber)}`
  );
  return await res.json();
}

// SAVE / UPDATE SINGLE PREFERENCE
async saveMatchingPreference(phoneNumber, key, value) {
  await fetch(`${API_BASE_URL}/api/v1/matching-preferences/user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      preference_key: key,
      value
    })
  });
}

}
export default new DatabaseService();

import { API_BASE_URL } from "../config/config_ip";

 class DatabaseService {
 async getSecuritySettings(phoneNumber) {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/settings/security?phone_number=${encodeURIComponent(phoneNumber)}`
    );
    return await res.json();
  }

  async updateSecuritySettings(phoneNumber, contactVisibility) {
    const res = await fetch(`${API_BASE_URL}/api/v1/settings/security`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone_number: phoneNumber,
        contact_visibility: contactVisibility
      })
    });
    return await res.json();
  }
 }
export default new DatabaseService();
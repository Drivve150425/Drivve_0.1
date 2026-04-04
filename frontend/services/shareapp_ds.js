import { API_BASE_URL } from "../config/config_ip";

 class DatabaseService {
async trackShare(payload) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/referral/share`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    return await response.json();
  } catch (e) {
    console.error("❌ trackShare error:", e);
    return null;
  }
}
async getShareStats(phoneNumber) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/referral/stats?phone_number=${encodeURIComponent(phoneNumber)}`,
      {
        method: "GET",
        headers: { Accept: "application/json" },
      }
    );

    return await response.json();
  } catch (e) {
    console.error("❌ getShareStats error", e);
    return null;
  }
}

 }
export default new DatabaseService();
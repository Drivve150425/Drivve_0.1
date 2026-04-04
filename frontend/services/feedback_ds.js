import { API_BASE_URL } from "../config/config_ip";

class DatabaseService {
async submitFeedback(phoneNumber, rating, reason = "") {
  try {
    console.log("⭐ Submitting feedback:", phoneNumber, rating);

    const res = await fetch(`${API_BASE_URL}/api/v1/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        rating,
        reason,
      }),
    });

    return await res.json();
  } catch (e) {
    console.error("❌ submitFeedback error", e);
    return { success: false };
  }
}

}
export default new DatabaseService();

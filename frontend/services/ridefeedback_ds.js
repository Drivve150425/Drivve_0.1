
import { API_BASE_URL } from "../config/config_ip";

 class DatabaseService {
// ================= RIDE FEEDBACK =================
async submitRideFeedback(payload) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/ride-feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await res.json();
  } catch (e) {
    console.error("❌ submitRideFeedback error", e);
    return { success: false };
  }
}
 }
export default new DatabaseService();
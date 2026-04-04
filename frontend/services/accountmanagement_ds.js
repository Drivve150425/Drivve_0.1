import { API_BASE_URL } from "../config/config_ip";

class DatabaseService {
// ================= ACCOUNT DEACTIVATION =================
async deactivateAccount(phone_number, reason = "") {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/account/deactivate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone_number,
        reason,
      }),
    });

    return await res.json();
  } catch (e) {
    console.error("❌ deactivateAccount error", e);
    return { success: false };
  }
}

}
export default new DatabaseService();

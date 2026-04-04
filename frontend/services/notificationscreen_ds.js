import { API_BASE_URL } from "../config/config_ip";

 class DatabaseService {
// GET notification settings
async getNotificationSettings(phone_number) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/settings/notifications?phone_number=${encodeURIComponent(phone_number)}`
    );
    return await res.json();
  } catch (e) {
    console.error("❌ Notification settings error", e);
    return null;
  }
}

// UPDATE notification settings
async updateNotificationSettings(phone_number, settings) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/settings/notifications`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone_number,
        ...settings,
      }),
    });

    return await res.json();
  } catch (e) {
    console.error("❌ Update notifications error", e);
    return null;
  }
}
}
export default new DatabaseService();

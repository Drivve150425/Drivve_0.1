import { API_BASE_URL } from "../config/config_ip";
import { Platform } from 'react-native';

 class DatabaseService {
    getNetworkTimeout() {
      return Platform.OS === 'ios' ? 15000 : 10000;
    }
// GET user notifications
async getNotifications(phone_number, page = 1, limit = 20) {
  try {
    if (!phone_number) {
      console.warn("❌ getNotifications called without phone number");
      return { notifications: [] };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      this.getNetworkTimeout()
    );

    const url =
      `${API_BASE_URL}/api/v1/notifications` +
      `?phone_number=${encodeURIComponent(phone_number)}` +
      `&page=${page}&limit=${limit}`;

    console.log("🔔 Fetching notifications:", url);

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(Platform.OS === "ios" && {
          "User-Agent": "DRIVVE-iOS/1.0"
        })
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const text = await res.text();
      console.error("❌ Notifications fetch error:", res.status, text);
      throw new Error(text);
    }

    const json = await res.json();
    console.log("✅ Notifications loaded:", json.notifications?.length || 0);

    return json;
  } catch (e) {
    console.error("❌ getNotifications error:", e);
    return { notifications: [] };
  }
}

// MARK notification as read
async markNotificationRead(notification_id) {
  try {
    console.log("👁️ Marking notification read:", notification_id);

    const res = await fetch(`${API_BASE_URL}/api/v1/notifications/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify({ id: notification_id })
    });

    return await res.json();
  } catch (e) {
    console.error("❌ markNotificationRead error:", e);
    return null;
  }
}

// CLEAR all notifications
async clearNotifications(phone_number) {
  try {
    console.log("🧹 Clearing notifications for:", phone_number);

    const res = await fetch(
      `${API_BASE_URL}/api/v1/notifications/clear?phone_number=${encodeURIComponent(
        phone_number
      )}`,
      { method: "POST" }
    );

    return await res.json();
  } catch (e) {
    console.error("❌ clearNotifications error:", e);
    return null;
  }
}
 }
export default new DatabaseService();
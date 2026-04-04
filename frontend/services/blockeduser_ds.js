import { API_BASE_URL } from "../config/config_ip";

class DatabaseService {
async getBlockedUsers(phone_number) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/blocked-users?phone_number=${encodeURIComponent(phone_number)}`
    );
    return await res.json();
  } catch (e) {
    console.error("❌ Blocked users load error", e);
    return { blocked_users: [] };
  }
}

async unblockUser(block_id) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/blocked-users/${block_id}`,
      { method: "DELETE" }
    );
    return await res.json();
  } catch (e) {
    console.error("❌ Unblock user error", e);
    return null;
  }
}
}
export default new DatabaseService();

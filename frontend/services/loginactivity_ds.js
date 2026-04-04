import { API_BASE_URL } from "../config/config_ip";

class DatabaseService {
async getDevices(phone_number) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/devices?phone_number=${encodeURIComponent(phone_number)}`
    );
    return await res.json();
  } catch (e) {
    console.error("❌ Device load error", e);
    return { devices: [] };
  }
}

async logoutDevice(device_id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/devices/${device_id}`, {
      method: "DELETE",
    });
    return await res.json();
  } catch (e) {
    console.error("❌ Logout device error", e);
    return null;
  }
}

}
export default new DatabaseService();
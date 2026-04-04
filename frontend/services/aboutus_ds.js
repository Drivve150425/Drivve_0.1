import { API_BASE_URL } from "../config/config_ip";
class DatabaseService {
  
async getAboutUs() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/about-us`, {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (e) {
    console.error("❌ getAboutUs error:", e);
    return [];
  }
}
}
export default new DatabaseService();


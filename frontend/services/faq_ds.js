import { API_BASE_URL } from "../config/config_ip";

 class DatabaseService {
async getFAQCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/support/faq-categories`);
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (e) {
    console.error("❌ getFAQCategories error:", e);
    return [];
  }
}

async getFAQs(category = null) {
  try {
    const url = category
      ? `${API_BASE_URL}/api/v1/support/faqs?category=${encodeURIComponent(category)}`
      : `${API_BASE_URL}/api/v1/support/faqs`;

    const res = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" }
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return await res.json();
  } catch (e) {
    console.error("❌ getFAQs error:", e);
    return [];
  }
}

}
export default new DatabaseService();

import { API_BASE_URL } from "../config/config_ip";

class DatabaseService {

  async handleResponse(res) {
    const text = await res.text();

    // ❌ अगर HTML आया (server error)
    if (text.startsWith("<")) {
      console.error("❌ HTML Error:", text);
      throw new Error("Server returned HTML instead of JSON");
    }

    return JSON.parse(text);
  }

  async getAddresses(phone) {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/addresses?phone_number=${encodeURIComponent(phone)}`
    );
    return this.handleResponse(res);
  }

  async saveAddress(payload) {
    const res = await fetch(`${API_BASE_URL}/api/v1/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return this.handleResponse(res);
  }

  async updateAddress(id, payload) {
    const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return this.handleResponse(res);
  }

  async deleteAddress(id) {
    const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${id}`, {
      method: "DELETE",
    });

    return this.handleResponse(res);
  }
}

export default new DatabaseService();
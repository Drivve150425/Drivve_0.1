import { API_BASE_URL } from "../config/config_ip";

 class DatabaseService {
async getAddresses(phone) {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/addresses?phone_number=${encodeURIComponent(phone)}`
  );
  return await res.json();
}

async saveAddress(payload) {
  const res = await fetch(`${API_BASE_URL}/api/v1/addresses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

async updateAddress(id, payload) {
  const res = await fetch(`${API_BASE_URL}/api/v1/addresses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return await res.json();
}

async deleteAddress(id) {
  await fetch(`${API_BASE_URL}/api/v1/addresses/${id}`, { method: "DELETE" });
}

 }
export default new DatabaseService();
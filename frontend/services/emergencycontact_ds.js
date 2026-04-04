import { API_BASE_URL } from "../config/config_ip";

class DatabaseService {
 async getContacts(phoneNumber) {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/emergency-contacts?phone_number=${encodeURIComponent(phoneNumber)}`
    );
    return await res.json();
  }

  async addContact(payload) {
    const res = await fetch(`${API_BASE_URL}/api/v1/emergency-contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });
    return await res.json();
  }

 async updateContact(id, payload, phoneNumber) {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/emergency-contacts/${id}?phone_number=${encodeURIComponent(phoneNumber)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    }
  );
  return await res.json();
}

  async deleteContact(id, phoneNumber) {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/emergency-contacts/${id}?phone_number=${encodeURIComponent(phoneNumber)}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    }
  );

  return await res.json();
}
}
export default new DatabaseService();
import { API_BASE_URL } from "../config/config_ip";

class DatabaseService {
async addVehicle(formData) {
  const res = await fetch(`${API_BASE_URL}/api/v1/vehicles`, {
    method: "POST",
    body: formData, // ✅ multipart
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}

async updateVehicle(id, formData) {
  const res = await fetch(`${API_BASE_URL}/api/v1/vehicles/${id}`, {
    method: "PUT",
    body: formData, // ✅ multipart
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}
}
export default new DatabaseService();


import { API_BASE_URL } from "../config/config_ip";

class DatabaseService {
async getVehicles(phoneNumber) {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/vehicles?phone_number=${encodeURIComponent(phoneNumber)}`
  );
  //   const json = await res.json();
  //   return json.vehicles || [];
  // }
    const text = await res.text();

  try {
    const json = JSON.parse(text);
    return json.vehicles || [];
  } catch (e) {
    console.log("Invalid JSON:", text);
    return [];
  }
}

async deleteVehicle(id) {
  const res = await fetch(`${API_BASE_URL}/api/v1/vehicles/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await res.text());
  return true;
}

}
export default new DatabaseService();


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
async getDbList(filters = {}) {
  try {
    const queryParams = new URLSearchParams();

    // Optional filters
    if (filters.body_type) {
      queryParams.append("body_type", filters.body_type);
    }

    if (filters.fuel_type) {
      queryParams.append("fuel_type", filters.fuel_type);
    }

    if (filters.make_company_name) {
      queryParams.append(
        "make_company_name",
        filters.make_company_name
      );
    }

    if (filters.model_name) {
      queryParams.append("model_name", filters.model_name);
    }

    if (filters.page) {
      queryParams.append("page", filters.page);
    }

    if (filters.limit) {
      queryParams.append("limit", filters.limit);
    }

    const url = `${API_BASE_URL}/api/v1/db-list?${queryParams.toString()}`;

    const res = await fetch(url);

    const text = await res.text();

    try {
      const json = JSON.parse(text);

      return {
        success: json.success || false,
        count: json.count || 0,
        total: json.total || 0,
        data: json.data || [],
      };
    } catch (e) {
      console.log("Invalid JSON:", text);

      return {
        success: false,
        data: [],
      };
    }
  } catch (error) {
    console.log("getDbList Error:", error);

    return {
      success: false,
      data: [],
    };
  }
}
}
export default new DatabaseService();

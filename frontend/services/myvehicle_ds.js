import { API_BASE_URL } from "../config/config_ip";

class DatabaseService {
  
  async getVehicles(phoneNumber) {
    const res = await fetch(
      `${API_BASE_URL}/api/v1/vehicles?phone_number=${encodeURIComponent(phoneNumber)}`
    );
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

  // ✅ NEW METHOD: Fetch rides for a specific vehicle
  async getVehicleRides(vehicleId) {
    try {
      // Try to fetch by vehicle_id first
      const response = await fetch(`${API_BASE_URL}/api/v1/rides?vehicle_id=${vehicleId}`);
      if (response.ok) {
        const data = await response.json();
        return data.rides || [];
      }
      return [];
    } catch (error) {
      console.error(`Error fetching rides for vehicle ${vehicleId}:`, error);
      return [];
    }
  }

  // ✅ Alternative: Fetch all rides and filter by vehicle_id
  async getAllRides() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/rides`);
      if (response.ok) {
        const data = await response.json();
        return data.rides || [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching all rides:', error);
      return [];
    }
  }

  async getDbList(filters = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (filters.body_type) {
        queryParams.append("body_type", filters.body_type);
      }
      if (filters.fuel_type) {
        queryParams.append("fuel_type", filters.fuel_type);
      }
      if (filters.make_company_name) {
        queryParams.append("make_company_name", filters.make_company_name);
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
import { API_BASE_URL } from "../config/config_ip";

class DatabaseService {


  async addVehicle(formData) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/vehicles`, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json",
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to add vehicle");
      }
      
      return true;
    } catch (error) {
      console.error("Error adding vehicle:", error);
      throw error;
    }
  }

  async updateVehicle(id, formData) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/vehicles/${id}`, {
        method: "PUT",
        body: formData,
        headers: {
          "Accept": "application/json",
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Failed to update vehicle");
      }
      
      return true;
    } catch (error) {
      console.error("Error updating vehicle:", error);
      throw error;
    }
  }

}

export default new DatabaseService();
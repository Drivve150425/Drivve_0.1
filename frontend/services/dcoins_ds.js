import { API_BASE_URL } from "../config/config_ip";

class DatabaseService {
async redeemCoins(phoneNumber) {
  const res = await fetch(`${API_BASE_URL}/api/v1/dcoins/redeem`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone_number: phoneNumber }),
  });
  return await res.json();
}

async getRedeemHistory(phoneNumber) {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/dcoins/history?phone_number=${encodeURIComponent(phoneNumber)}`
  );
  return await res.json();
}

}
export default new DatabaseService();

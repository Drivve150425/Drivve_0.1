import { API_BASE_URL } from "../config/config_ip";

 class DatabaseService {
async getRewards(phoneNumber) {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/rewards?phone_number=${encodeURIComponent(phoneNumber)}`
  );
  return await res.json();
}

async creditReward(phoneNumber, rewardId) {
  const res = await fetch(`${API_BASE_URL}/api/v1/rewards/credit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      phone_number: phoneNumber,
      reward_id: rewardId,
    }),
  });

  return await res.json();
}
 }
export default new DatabaseService();
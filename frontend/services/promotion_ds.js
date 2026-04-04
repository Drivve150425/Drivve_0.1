import { API_BASE_URL } from "../config/config_ip";

 class DatabaseService {
async getPromotions(phoneNumber) {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/promotions?phone_number=${encodeURIComponent(phoneNumber)}`
  );

  const json = await res.json();
  return json.promotions || [];
}

async redeemPromotion(promoId, phoneNumber) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/promotions/redeem`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        promo_id: promoId,
        phone_number: phoneNumber   // ✅ HERE
      }),
    });

    return await res.json();
  } catch (e) {
    console.error("❌ redeemPromotion error", e);
    return { alreadyRedeemed: true };
  }
}
 }
export default new DatabaseService();
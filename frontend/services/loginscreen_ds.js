import { API_BASE_URL } from "../config/config_ip";
console.log("CREATE", API_BASE_URL);

class DatabaseService {
async sendOtp(phone_number) {
  try {
    console.log("📲 Sending OTP for:", phone_number);

    const res = await fetch(`${API_BASE_URL}/api/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone_number,
      }),
    });

    console.log("📡 Status:", res.status);
    console.log("📡 Headers:", Object.fromEntries(res.headers));

 
    const json = await res.json();
    console.log("✅ sendOtp response:", json);

    return json;
  } catch (e) {
    console.error("❌ sendOtp error:", e);
    return null;
  }
}

}
export default new DatabaseService();

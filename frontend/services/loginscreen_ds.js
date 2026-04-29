import { API_BASE_URL } from "../config/config_ip";
console.log("CREATE", API_BASE_URL);

class LoginService {
  async sendOtp(phone_number) {
    try {
      console.log("📲 Sending backend OTP for:", phone_number);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_BASE_URL}/api/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ phone_number }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const result = await res.json();
      console.log("✅ Backend sendOtp success:", result);
      
      return {
        success: true,
        message: "OTP sent successfully",
        data: result,
        phone_number: phone_number
      };
    } catch (e) {
      console.error("❌ sendOtp error:", e);
      return {
        success: false,
        message: e.message || "Failed to send OTP",
        phone_number: phone_number
      };
    }
  }
}

export default new LoginService();

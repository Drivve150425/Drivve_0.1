import { API_BASE_URL } from "../config/config_ip";

class DatabaseService {
 // Add inside DatabaseService class
async getUserProfile(phoneNumber) {
  try {
    if (!phoneNumber) {
      console.warn("❌ getUserProfile called without phone number");
      return null;
    }

    // 🔥 ENSURE + is preserved
    const normalizedPhone = phoneNumber.startsWith("+")
      ? phoneNumber
      : `+${phoneNumber}`;

    const url = `${API_BASE_URL}/api/v1/users/profile?phone_number=${encodeURIComponent(
      normalizedPhone
    )}`;

    console.log("📡 Calling profile API:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const text = await response.text(); // 👈 CRITICAL

    if (!response.ok) {
      console.error("❌ Profile API error:", response.status, text);
      return null;
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("❌ getUserProfile error:", error);
    return null;
  }
}
async updateUserProfile(data) {
  try {
    console.log("📤 Updating profile payload:", data);

    const response = await fetch(`${API_BASE_URL}/api/v1/users/updateprofile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", // 🔴 REQUIRED
        Accept: "application/json",
      },
      body: JSON.stringify({
        phone_number: data.phone_number, // 🔴 MUST exist
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        email: data.email || null,
         email_verified: data.email_verified ?? false,
        gender: data.gender || null,
        date_of_birth: data.date_of_birth || null, // yyyy-mm-dd
        state: data.state || null,
        city: data.city || null,
        bio: data.bio || null,
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("❌ Update profile failed:", response.status, text);
      return null;
    }

    return JSON.parse(text);
  } catch (e) {
    console.error("❌ updateUserProfile error", e);
    return null;
  }
}
async selectAvatar(phoneNumber, avatarName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/update-avatar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        avatar_name: avatarName,
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("❌ Avatar update failed:", response.status, text);
      return null;
    }

    return JSON.parse(text);

  } catch (err) {
    console.log("❌ Avatar update error:", err);
    return null;
  }
}
async updateProfilePicture(phone, imageUri) {
  try {

    const formData = new FormData();

    formData.append("phone_number", phone);

    formData.append("profile_picture", {
      uri: imageUri,
      name: "profile.jpg",
      type: "image/jpeg",
    });

    const response = await fetch(
      `${API_BASE_URL}/api/v1/users/update-profile-picture`,
      {
        method: "PUT",
       
        body: formData,
      }
    );

    return await response.json();

  } catch (e) {
    console.log("IMAGE UPLOAD ERROR:", e);
    return null;
  }
}
// Add this method to DatabaseService class in myprofile_ds.js
async updateAvatar(phoneNumber, avatarName) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/users/update-avatar`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        avatar_name: avatarName,
      }),
    });

    const text = await response.text();

    if (!response.ok) {
      console.error("❌ Avatar update failed:", response.status, text);
      return null;
    }

    return JSON.parse(text);
  } catch (err) {
    console.log("❌ Avatar update error:", err);
    return null;
  }
}
}
export default new DatabaseService();

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";
import { API_BASE_URL } from "../config/config_ip";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const appState = useRef(AppState.currentState);

  // =========================================
  // RESTORE SESSION
  // =========================================
  const restoreSession = async () => {
    try {
      console.log("🔄 RESTORE SESSION");

      const storedAuth = await AsyncStorage.getItem("auth");

      if (!storedAuth) {
        console.log("❌ No saved auth");

        setLoading(false);
        return;
      }

      const authData = JSON.parse(storedAuth);

      // CHECK TOKEN EXISTS
      if (authData?.accessToken) {
        setUser(authData.userData);
        setIsAuthenticated(true);

        console.log("✅ Session restored");

        // SILENT REFRESH
        await refreshAccessToken();
      }
    } catch (error) {
      console.log("❌ Restore session error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // REFRESH ACCESS TOKEN
  // =========================================
 const refreshAccessToken = async () => {
  try {
    console.log("🔄 REFRESH TOKEN");

    const storedAuth = await AsyncStorage.getItem("auth");

    if (!storedAuth) return false;

    const authData = JSON.parse(storedAuth);

    if (!authData.refreshToken) {
      return false;
    }

    // ✅ FIXED: Use your actual backend URL
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: authData.refreshToken,
      }),
    });

    const data = await response.json();

    if (response.ok) {
     const updatedAuth = {
  ...authData,
  accessToken: data.accessToken,
  refreshToken:
    data.refreshToken || authData.refreshToken,
  lastUsed: Date.now(),
};

      await AsyncStorage.setItem("auth", JSON.stringify(updatedAuth));
      setUser(updatedAuth.userData);
      setIsAuthenticated(true);
      console.log("✅ Token refreshed");

      return true;
    } else {
      console.log("❌ Refresh token expired");
      await logout();
      return false;
    }
  } catch (error) {
    console.log("❌ Refresh token error:", error);
    return false;
  }
};
  // =========================================
  // APP START
  // =========================================
  useEffect(() => {
    restoreSession();
  }, []);

  // =========================================
  // APP RESUME
  // =========================================
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextState === "active"
        ) {
          console.log("📲 App resumed");

          await refreshAccessToken();
        }

        appState.current = nextState;
      }
    );

    return () => subscription.remove();
  }, []);

  // =========================================
  // LOGIN
  // =========================================
const login = async (data) => {
  try {
    console.log("🔐 LOGIN DATA:", data);

    const sessionData = {
      userData: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      lastUsed: Date.now(),
    };

    // ✅ FIXED: Use 'auth' key instead of 'user'
    await AsyncStorage.setItem("auth", JSON.stringify(sessionData));

    console.log("✅ SAVED AUTH:", sessionData);

    setUser(data.user);
    setIsAuthenticated(true);

    console.log("✅ LOGIN SUCCESS");
  } catch (error) {
    console.log("❌ Login error:", error);
  }
};
  // =========================================
  // GUEST LOGIN
  // =========================================
 const loginGuest = async () => {
  try {
    const guestData = {
      id: "guest_" + Date.now(),
      first_name: "Guest",
      isGuest: true,
    };

    const authData = {
      userData: guestData,
      accessToken: "guest_token",
      refreshToken: "guest_refresh",
      lastUsed: Date.now(),
    };

    // ✅ FIXED: Use 'auth' key
    await AsyncStorage.setItem("auth", JSON.stringify(authData));

    setUser(guestData);
    setIsAuthenticated(true);

    console.log("👤 Guest Login");
  } catch (error) {
    console.log("❌ Guest login error:", error);
  }
};

  // =========================================
  // LOGOUT
  // =========================================
  const logout = async () => {
  try {
    // ✅ FIXED: Remove 'auth' key
    await AsyncStorage.removeItem("auth");
    
    setUser(null);
    setIsAuthenticated(false);

    console.log("🚪 Logout");
  } catch (error) {
    console.log("❌ Logout error:", error);
  }
};

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        loginGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
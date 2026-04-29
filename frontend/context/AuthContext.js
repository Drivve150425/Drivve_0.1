import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState } from "react-native";

const AuthContext = createContext();

const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  let appState = AppState.currentState;

  const isSessionValid = (sessionData) => {
    if (!sessionData || !sessionData.lastUsed) return false;
    return Date.now() - sessionData.lastUsed < SESSION_EXPIRY_MS;
  };

  // 🔄 Restore session on app start
  const restoreSession = async () => {
    try {
      const storedSession = await AsyncStorage.getItem("user");

      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        console.log("🔍 Loaded session:", sessionData);

        if (isSessionValid(sessionData)) {
          setUser(sessionData.userData);
          setIsAuthenticated(true);

          // update lastUsed
          sessionData.lastUsed = Date.now();
          await AsyncStorage.setItem("user", JSON.stringify(sessionData));

          console.log("✅ Session restored");
        } else {
          console.log("❌ Session expired");
          await AsyncStorage.removeItem("user");
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log("❌ Restore session error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    restoreSession();
  }, []);

  // 🔄 Handle app background → foreground
  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextState) => {
      if (appState.match(/inactive|background/) && nextState === "active") {
        console.log("📲 App resumed");

        const storedSession = await AsyncStorage.getItem("user");

        if (storedSession) {
          const sessionData = JSON.parse(storedSession);

          if (isSessionValid(sessionData)) {
            sessionData.lastUsed = Date.now();
            await AsyncStorage.setItem("user", JSON.stringify(sessionData));

            setUser(sessionData.userData);
            setIsAuthenticated(true);

            console.log("✅ Session refreshed");
          } else {
            await AsyncStorage.removeItem("user");
            setUser(null);
            setIsAuthenticated(false);
            console.log("❌ Session expired on resume");
          }
        }
      }
      appState = nextState;
    });

    return () => subscription.remove();
  }, []);

  // 🔐 LOGIN
  const login = async (userData) => {
    try {
      const sessionData = {
        userData,
        lastUsed: Date.now(),
      };

      await AsyncStorage.setItem("user", JSON.stringify(sessionData));

      setUser(userData);
      setIsAuthenticated(true);

      console.log("🔐 Login saved");
    } catch (error) {
      console.log("❌ Login error:", error);
    }
  };

  // 👤 GUEST LOGIN
  const loginGuest = async () => {
    const guestData = {
      id: "guest_" + Date.now(),
      first_name: "Guest",
      phone_number: "guest_mode",
      isGuest: true,
      createdAt: Date.now(),
    };

    try {
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          userData: guestData,
          lastUsed: Date.now(),
        })
      );

      setUser(guestData);
      setIsAuthenticated(true);

      console.log("👤 Guest login");
    } catch (error) {
      console.log("Guest login error:", error);
    }
  };

  // 🚪 LOGOUT
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
      console.log("🚪 Logout");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        loginGuest,
        logout,
        loading,
        isGuest: !!user?.isGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
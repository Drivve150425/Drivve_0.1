import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

// 30 days in milliseconds
const SESSION_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isSessionValid = (sessionData) => {
    if (!sessionData || !sessionData.lastUsed) return false;
    return Date.now() - sessionData.lastUsed < SESSION_EXPIRY_MS;
  };

  // 🔄 Restore & validate session on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedSession = await AsyncStorage.getItem("user");
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          console.log("🔍 Loaded session:", sessionData);
          
          if (isSessionValid(sessionData)) {
            setUser(sessionData.userData);
            // Delay for React state batching + child sync
            setTimeout(() => {
              setIsAuthenticated(true);
              console.log("✅ Session valid - state set");
            }, 100);
            
            await updateLastUsed();
          } else {
            console.log("❌ Session expired, clearing");
            await AsyncStorage.removeItem("user");
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.log("Restore session error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Update lastUsed timestamp (called on app start & optionally elsewhere)
  const updateLastUsed = async () => {
    try {
      const storedSession = await AsyncStorage.getItem("user");
      if (storedSession) {
        const sessionData = JSON.parse(storedSession);
        sessionData.lastUsed = Date.now();
        await AsyncStorage.setItem("user", JSON.stringify(sessionData));
        console.log("📅 Updated lastUsed:", new Date(sessionData.lastUsed).toLocaleDateString());
      }
    } catch (error) {
      console.log("Update lastUsed error:", error);
    }
  };

  // 🔐 Login - store with timestamp
  const login = async (userData) => {
    try {
      const sessionData = {
        userData,
        lastUsed: Date.now()
      };
      await AsyncStorage.setItem("user", JSON.stringify(sessionData));
      setUser(userData);
      setIsAuthenticated(true);
      console.log("🔐 Login session created");
    } catch (error) {
      console.log("Login store error:", error);
    }
  };

  // 👤 Guest login - local mode
  const loginGuest = async () => {
    try {
      const guestData = {
        id: 'guest_' + Date.now(),
        first_name: 'Guest',
        phone_number: 'guest_mode',
        isGuest: true,
        createdAt: Date.now()
      };
      await AsyncStorage.setItem('guestData', JSON.stringify(guestData));
      setUser(guestData);
      setIsAuthenticated(true);
      console.log('👤 Guest mode activated + authenticated');
    } catch (error) {
      console.error('Guest login error:', error);
      throw error; // Re-throw for caller to handle
    }
  };

  // 🚪 Logout - clear everything + guest
  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'guestData']);
      setUser(null);
      setIsAuthenticated(false);
      console.log('🚪 All sessions cleared');
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      loginGuest,
      logout, 
      loading,
      updateLastUsed,
      isGuest: !!user?.isGuest
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


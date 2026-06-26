import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logoutUser, clearAccessToken, getAccessToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }

    getCurrentUser()
      .then((payload) => {
        setUser(payload?.data?.user || payload?.data || null);
      })
      .catch(() => {
        clearAccessToken();
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  function login(userData) {
    setUser(userData);
  }

  async function logout() {
    try {
      await logoutUser();
    } catch {
      // Token might already be invalid, still clear locally
      clearAccessToken();
    }
    setUser(null);
    window.location.hash = "/signin";
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

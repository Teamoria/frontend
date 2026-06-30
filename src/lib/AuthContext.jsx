import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logoutUser, clearAccessToken, getAccessToken } from "./api.js";
import { normalizeRole } from "./authRoles.js";

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

    refreshUser()
      .catch(() => {
        clearAccessToken();
        setUser(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  async function refreshUser() {
    const payload = await getCurrentUser();
    const nextUser = payload?.data?.user || payload?.data || payload?.user || payload || null;
    setUser(nextUser);
    return nextUser;
  }

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

  const normalizedRole = normalizeRole(user?.role);
  const isAdmin = normalizedRole === "admin";
  const isCompanyOwner = normalizedRole === "company_owner";
  const isCompanyUser = ["company_owner", "company_manager", "company_member"].includes(normalizedRole);

  return (
    <AuthContext.Provider value={{ user, normalizedRole, isAdmin, isCompanyOwner, isCompanyUser, isLoading, login, logout, refreshUser }}>
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

import React, { createContext, useContext, useState, useEffect } from "react";
import { loginApi, registerApi } from "../api/auth";

const TOKEN_KEY = "smartlf_token";
const USER_KEY = "smartlf_user";

/**
 * Normalizes backend role string to frontend role string.
 * USER  -> "user"
 * STAFF -> "staff"
 * ADMIN -> "admin"
 */
export const normalizeRole = (role) => {
  if (!role) return "user";
  const upper = String(role).trim().toUpperCase();
  if (upper === "ADMIN") return "admin";
  if (upper === "STAFF") return "staff";
  return "user";
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Session Hydration on Mount
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedUserRaw = localStorage.getItem(USER_KEY);

      if (storedToken && storedUserRaw) {
        const parsedUser = JSON.parse(storedUserRaw);
        const normRole = normalizeRole(parsedUser.role);

        setToken(storedToken);
        setUser({ ...parsedUser, role: normRole });
        setRole(normRole);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Failed to restore auth session:", err);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem("smartlf_page");
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync state if unauthorized event dispatched by axios interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("smartlf:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("smartlf:unauthorized", handleUnauthorized);
    };
  }, []);

  /**
   * Executes Login against API Gateway
   */
  const login = async (email, password) => {
    const data = await loginApi({ email, password });

    const normRole = normalizeRole(data.role);
    const normalizedUser = {
      userId: data.userId,
      name: data.name,
      email: data.email,
      phone: data.phone || "",
      role: normRole,
      createdAt: data.createdAt || null,
      emailNotifications: data.emailNotifications ?? true,
      smsNotifications: data.smsNotifications ?? false,
    };

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));

    setToken(data.token);
    setUser(normalizedUser);
    setRole(normRole);
    setIsAuthenticated(true);

    return normRole;
  };

  /**
   * Updates current stored user details in AuthContext & localStorage
   */
  const updateUserProfile = (partialData) => {
    setUser((prev) => {
      const updated = { ...prev, ...partialData };
      localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  /**
   * Executes Registration against API Gateway (does NOT issue JWT)
   */
  const register = async (userData) => {
    const response = await registerApi(userData);
    return response;
  };

  /**
   * Clears auth session and token
   */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("smartlf_page");

    setToken(null);
    setUser(null);
    setRole(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    token,
    role,
    isAuthenticated,
    loading,
    login,
    register,
    updateUserProfile,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

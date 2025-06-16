import { createContext, useContext, useEffect, useState } from "react";
import { getBaseURL } from "@/utils/getBaseURL";
import { users } from './auth.js'

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔐 Login: expects HttpOnly cookies
  const loginUser = async (formData) => {
    // console.log(formData);

    if (!formData.email) {
      const randomIndex = Math.floor(Math.random() * users.length);
      formData.email = users[randomIndex];
    }
    const res = await fetch(`${getBaseURL()}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
      credentials: "include",
    });

    if (!res.ok) {
      // Get error message from response if possible
      let errorMsg = "Login failed";
      try {
        const errorData = await res.json();
        if (errorData?.detail) errorMsg = errorData.detail;
      } catch { }

      throw new Error(errorMsg);  // THROW error to reject promise
    }

    await fetchCurrentUser(); // Set user context
    return { success: true };
  };


  // 👤 Fetch user details (cookie protected)
  const fetchCurrentUser = async () => {
    try {
      let res = await fetch(`${getBaseURL()}/api/me`, {
        method: "GET",
        credentials: "include",
      });

      if (res.status === 401) {
        // Attempt refresh token
        const refresh = await fetch(`${getBaseURL()}/token/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (!refresh.ok) throw new Error("Refresh failed");

        // Retry fetching user
        res = await fetch(`${getBaseURL()}/api/me`, {
          method: "GET",
          credentials: "include",
        });
      }

      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error("User fetch error:", err);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Logout user
  const logout = async () => {
    try {
      await fetch(`${getBaseURL()}/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed");
    }
    setCurrentUser(null);
  };

  useEffect(() => {
    fetchCurrentUser(); // Auto-login on reload
  }, []);

  const value = {
    currentUser,
    role: currentUser?.role || null,
    isAdmin: currentUser?.role === "admin",
    isManager: currentUser?.role === "manager",
    isEmployee: currentUser?.role === "employee",
    loginUser,
    logout,
    loading,
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

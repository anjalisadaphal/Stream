import { useState, useEffect, createContext, useContext } from "react";
import api from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
        // Check if user is admin based on roles from backend
        setIsAdmin(response.data.is_admin || false);
      } catch (error) {
        console.error("Auth check failed:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append("username", email);
    formData.append("password", password);

    const response = await api.post("/auth/login", formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });

    const { access_token } = response.data;
    localStorage.setItem("token", access_token);

    // Fetch user details
    const userResponse = await api.get("/auth/me");
    setUser(userResponse.data);
    // Set admin status
    setIsAdmin(userResponse.data.is_admin || false);
    return userResponse.data;
  };

  const register = async (email, password, fullName) => {
    await api.post("/auth/register", { email, password, full_name: fullName });
    // Auto login after register for better UX
    return login(email, password);
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
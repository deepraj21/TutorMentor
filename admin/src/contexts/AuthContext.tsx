import React, { createContext, useContext, useState, useEffect } from "react";

interface AdminUser {
  _id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  admin: AdminUser | null;
  isLoggedIn: boolean;
  signin: (email: string, password: string) => Promise<boolean>;
  signout: () => void;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("admin");
    if (stored) setAdmin(JSON.parse(stored));
  }, []);

  const signin = async (email: string, password: string) => {
    try {
        const res = await fetch(`${BACKEND_URL}/api/auth/admin-signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok && data.admin) {
        setAdmin(data.admin);
        localStorage.setItem("admin", JSON.stringify(data.admin));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const signout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        isLoggedIn: !!admin,
        signin,
        signout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
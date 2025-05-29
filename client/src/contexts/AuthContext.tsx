import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, provider, signInWithPopup } from "@/utils/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import axios from "axios";
import { toast } from "sonner";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Try to load from localStorage first
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedLoggedIn = localStorage.getItem("isLoggedIn");
    return storedLoggedIn === "true";
  });

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);

      if (currentUser) {
        localStorage.setItem("authUser", JSON.stringify({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        }));
        localStorage.setItem("isLoggedIn", "true");
      } else {
        localStorage.removeItem("authUser");
        localStorage.setItem("isLoggedIn", "false");
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await axios.post(`${BACKEND_URL}/api/auth`, {
        name: user.displayName,
        email: user.email,
      });

      localStorage.setItem("authUser", JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }));
      localStorage.setItem("studentId", response.data.user._id);
      localStorage.setItem("isLoggedIn", "true");
      window.location.reload();
      toast.success(response.data.message);

    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Failed to sign in");
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem("authUser");
      localStorage.removeItem("batchId");
      localStorage.removeItem("chatHistory");
      localStorage.removeItem("studentId");
      localStorage.setItem("isLoggedIn", "false");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, signIn, signOut }}>
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
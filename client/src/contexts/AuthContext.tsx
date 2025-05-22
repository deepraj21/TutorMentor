import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, provider, signInWithPopup } from "@/utils/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
// import axios from "axios";

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

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

      // Save to localStorage
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

      // Save to localStorage
      localStorage.setItem("authUser", JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      }));
      localStorage.setItem("isLoggedIn", "true");

      // await axios.post(`${BACKEND_URL}/api/auth`, {
      //   email: user.email,
      //   name: user.displayName,
      // });

    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem("authUser");
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
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoggedIn(!!currentUser);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

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
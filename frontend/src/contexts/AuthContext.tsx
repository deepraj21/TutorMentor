import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, provider, signInWithPopup } from "@/utils/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import axios from "axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface UserData {
  id?: string;
  uid?: string;
  email: string;
  name?: string;
  displayName?: string;
  photoURL?: string;
  role: "student" | "teacher";
}

interface AuthContextType {
  user: UserData | null;
  isLoggedIn: boolean;
  signIn: () => Promise<void>;
  login: (userData: UserData) => void;
  signOut: () => Promise<void>;
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(() => {
    const storedUser = localStorage.getItem("classroomUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const storedLoggedIn = localStorage.getItem("isLoggedIn");
    return storedLoggedIn === "true";
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userData: UserData = {
          uid: currentUser.uid,
          email: currentUser.email!,
          displayName: currentUser.displayName || undefined,
          photoURL: currentUser.photoURL || undefined,
          role: "student"
        };
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem("classroomUser", JSON.stringify(userData));
        localStorage.setItem("isLoggedIn", "true");
      } else if (!localStorage.getItem("classroomUser")) {
        setUser(null);
        setIsLoggedIn(false);
        localStorage.removeItem("classroomUser");
        localStorage.setItem("isLoggedIn", "false");
      }
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const response = await axios.post(`${BACKEND_URL}/api/auth/google-signin`, {
        name: user.displayName,
        email: user.email,
      });

      const userData: UserData = {
        uid: user.uid,
        email: user.email!,
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
        role: "student"
      };

      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem("classroomUser", JSON.stringify(userData));
      localStorage.setItem("studentId", response.data.student._id);
      localStorage.setItem("isLoggedIn", "true");

      navigate("/student");
      
      toast.success('Welcome to Classroom', {
        description: response.data.message,
      });

    } catch (error) {
      console.error("Error signing in:", error);
      toast.error("Failed to sign in");
    }
  };

  const login = (userData: UserData) => {
    setUser(userData);
    setIsLoggedIn(true);
    localStorage.setItem("classroomUser", JSON.stringify(userData));
    localStorage.setItem('teacherId', userData.id);
    localStorage.setItem("isLoggedIn", "true");
  };

  const signOut = async () => {
    try {
      if (user?.role === "student") {
        await auth.signOut();
      }
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem("classroomUser");
      localStorage.removeItem("studentId");
      localStorage.removeItem("teacherId");
      localStorage.removeItem("chatHistory");
      localStorage.setItem("isLoggedIn", "false");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, signIn, login, signOut }}>
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
"use client";

import {
  logout as apiLogout,
  signin as apiSignin,
  signup as apiSignup,
  getCurrentUser,
} from "@/lib/api";
import { User } from "@shipyard/types";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signup: (email: string, password: string) => Promise<void>;
  signin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  const signup = async (email: string, password: string) => {
    const res = await apiSignup({ email, password });

    setUser(res);
  };

  const signin = async (email: string, password: string) => {
    await apiSignin({ email, password });

    const currentUser = await getCurrentUser();
    setUser(currentUser);
  };

  const logout = async () => {
    await apiLogout();

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signup, signin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

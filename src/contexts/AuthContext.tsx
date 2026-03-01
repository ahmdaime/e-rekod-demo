"use client";

import React, { createContext, useContext } from "react";
import { useRouter } from "next/navigation";

interface DemoUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: DemoUser | null;
  session: unknown;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
}

const demoUser: DemoUser = {
  id: "demo-teacher",
  email: "cikgu@demo.erekod.my",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const value: AuthContextType = {
    user: demoUser,
    session: { user: demoUser },
    loading: false,
    isAuthenticated: true,
    signIn: async () => ({ error: null }),
    signOut: async () => {
      router.push("/landing");
      return { error: null };
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}

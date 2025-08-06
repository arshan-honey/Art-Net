"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role: "VISITOR" | "ENTHUSIAST" | "ARTIST" | "ADMIN";
  avatar?: string;
  isVerified: boolean;
  artistProfile?: {
    id: string;
    artistStatement?: string;
    specialties: string[];
    isPublic: boolean;
  };
};

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: "ENTHUSIAST" | "ARTIST";
    artistData?: {
      artistStatement?: string;
      specialties?: string[];
      acceptCommissions?: boolean;
    };
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check for existing session on mount
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error: any) {
      // Silently handle authentication errors - user is simply not logged in
      if (
        error.message !== "Not authenticated" &&
        error.message !== "Unauthorized"
      ) {
        console.error("Error checking current user:", error);
      }
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiClient.login(email, password);

      if (response.success && response.user) {
        setUser(response.user);
        return true;
      }

      return false;
    } catch (error: any) {
      setError(error.message || "Login failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: "ENTHUSIAST" | "ARTIST";
    artistData?: {
      artistStatement?: string;
      specialties?: string[];
      acceptCommissions?: boolean;
    };
  }): Promise<boolean> => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await apiClient.signup(data);

      if (response.success && response.user) {
        setUser(response.user);
        return true;
      }

      return false;
    } catch (error: any) {
      setError(error.message || "Registration failed");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiClient.logout();
      setUser(null);
      setError(null);
      router.push("/login"); // Redirect to login page after logout
      router.refresh(); // Refresh the page to clear any session state
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch (error: any) {
      // Silently handle authentication errors - user is simply not logged in
      if (
        error.message !== "Not authenticated" &&
        error.message !== "Unauthorized"
      ) {
        console.error("Failed to refresh user:", error);
      }
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        refreshUser,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

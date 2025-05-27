import { useState, useEffect } from "react";
import { GovernmentAPI } from "@/services/GovernmentAPI";

interface GovernmentUser {
  id: string;
  role: string;
  province_id: string;
  province: string;
  created_at: string;
}

export function useGovernmentAuth() {
  const [user, setUser] = useState<GovernmentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const isAuth = GovernmentAPI.isAuthenticated();
      const currentUser = GovernmentAPI.getCurrentUser() as GovernmentUser;

      setIsAuthenticated(isAuth);
      setUser(currentUser);
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    GovernmentAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = () => {
    checkAuthStatus();
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    logout,
    refreshUser,
  };
}

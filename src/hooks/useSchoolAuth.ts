import { useState, useEffect } from "react";
import { SchoolAPI } from "@/services/SchoolAPI";

interface SchoolUser {
  id: string;
  role: string;
  name: string;
  npsn: string;
  school_id: string;
  address?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  government_id: string;
  created_at: string;
}

export function useSchoolAuth() {
  const [user, setUser] = useState<SchoolUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const isAuth = SchoolAPI.isAuthenticated();
      const currentUser = SchoolAPI.getCurrentUser() as SchoolUser;

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
    SchoolAPI.logout();
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

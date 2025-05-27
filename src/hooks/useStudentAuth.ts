import { useState, useEffect } from "react";
import { StudentAPI } from "@/services/StudentAPI";

export interface StudentUser {
  id: string;
  role: string;
  name: string;
  student_number: string;
  class: string;
  grade: string;
  address?: string;
  gender?: string;
  birth_date?: string;
  school_id: string;
  created_at: string;
}

export function useStudentAuth() {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const isAuth = StudentAPI.isAuthenticated();
      const currentUser = StudentAPI.getCurrentUser() as StudentUser;

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
    StudentAPI.logout();
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

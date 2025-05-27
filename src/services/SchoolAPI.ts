import axios, { AxiosResponse } from "axios";
import { LoginRequest, LoginResponse } from "@/types/auth-types";
import { SchoolResponse, UpdateSchoolRequest } from "@/types/school-types";

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("school_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear storage and redirect to login
      localStorage.removeItem("school_token");
      localStorage.removeItem("school_user");
      window.location.href = "/school/auth/login";
    }
    return Promise.reject(error);
  }
);

export class SchoolAPI {
  /**
   * Authenticate school and get JWT token
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await apiClient.post(
        "/api/school/auth/login",
        credentials
      );

      // Store token and user data in localStorage
      if (response.data.success && response.data.token) {
        localStorage.setItem("school_token", response.data.token);
        localStorage.setItem("school_user", JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(error.response.data.message || "Login failed");
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Logout school (clear local storage)
   */
  static logout(): void {
    localStorage.removeItem("school_token");
    localStorage.removeItem("school_user");
    window.location.href = "/school/auth/login";
  }

  /**
   * Get current school's profile
   */
  static async getProfile(): Promise<SchoolResponse> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: { profile: SchoolResponse };
      }> = await apiClient.get("/api/school/profile");

      return response.data.data.profile;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to fetch profile"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Update school profile
   */
  static async updateProfile(
    profileData: UpdateSchoolRequest
  ): Promise<SchoolResponse> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: { profile: SchoolResponse };
      }> = await apiClient.put("/api/school/profile", profileData);

      return response.data.data.profile;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to update profile"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Change school password
   */
  static async changePassword(passwordData: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<void> {
    try {
      await apiClient.put("/api/school/change-password", passwordData);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to change password"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Check if school is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem("school_token");
    const user = localStorage.getItem("school_user");
    return !!(token && user);
  }

  /**
   * Get current school user data from localStorage
   */
  static getCurrentUser(): object | null {
    const userStr = localStorage.getItem("school_user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Get current auth token
   */
  static getToken(): string | null {
    return localStorage.getItem("school_token");
  }
}

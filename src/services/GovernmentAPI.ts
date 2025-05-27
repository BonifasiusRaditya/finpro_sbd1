import axios, { AxiosResponse } from "axios";
import { LoginRequest, LoginResponse } from "@/types/auth-types";
import {
  SchoolResponse,
  CreateSchoolRequest,
  UpdateSchoolRequest,
} from "@/types/school-types";

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
    const token = localStorage.getItem("government_token");
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
      localStorage.removeItem("government_token");
      localStorage.removeItem("government_user");
      window.location.href = "/government/auth/login";
    }
    return Promise.reject(error);
  }
);

export class GovernmentAPI {
  /**
   * Authenticate government user and get JWT token
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await apiClient.post(
        "/api/gov/auth/login",
        credentials
      );

      // Store token and user data in localStorage
      if (response.data.success && response.data.token) {
        localStorage.setItem("government_token", response.data.token);
        localStorage.setItem(
          "government_user",
          JSON.stringify(response.data.user)
        );
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
   * Logout government user (clear local storage)
   */
  static logout(): void {
    localStorage.removeItem("government_token");
    localStorage.removeItem("government_user");
    window.location.href = "/government/auth/login";
  }

  /**
   * Get all schools under government jurisdiction
   */
  static async getSchools(): Promise<SchoolResponse[]> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: { schools: SchoolResponse[] };
      }> = await apiClient.get("/api/gov/schools");

      return response.data.data.schools;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to fetch schools"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Get a specific school by ID
   */
  static async getSchool(schoolId: string): Promise<SchoolResponse> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: { school: SchoolResponse };
      }> = await apiClient.get(`/api/gov/schools/${schoolId}`);

      return response.data.data.school;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to fetch school"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Create a new school
   */
  static async createSchool(
    schoolData: CreateSchoolRequest
  ): Promise<SchoolResponse> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: { school: SchoolResponse };
      }> = await apiClient.post("/api/gov/schools", schoolData);

      return response.data.data.school;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to create school"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Update a school
   */
  static async updateSchool(
    schoolId: string,
    schoolData: UpdateSchoolRequest
  ): Promise<SchoolResponse> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: { school: SchoolResponse };
      }> = await apiClient.put(`/api/gov/schools/${schoolId}`, schoolData);

      return response.data.data.school;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to update school"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Delete a school
   */
  static async deleteSchool(schoolId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/gov/schools/${schoolId}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to delete school"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Check if government user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem("government_token");
    const user = localStorage.getItem("government_user");
    return !!(token && user);
  }

  /**
   * Get current government user data from localStorage
   */
  static getCurrentUser(): object | null {
    const userStr = localStorage.getItem("government_user");
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
    return localStorage.getItem("government_token");
  }
}

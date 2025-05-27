import axios, { AxiosResponse } from "axios";
import { LoginRequest, LoginResponse } from "@/types/auth-types";
import {
  StudentProfileResponse,
  UpdateStudentProfileRequest,
  ChangeStudentPasswordRequest,
} from "@/types/student-types";

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
    const token = localStorage.getItem("student_token");
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
      localStorage.removeItem("student_token");
      localStorage.removeItem("student_user");
      window.location.href = "/student/auth/login";
    }
    return Promise.reject(error);
  }
);

export class StudentAPI {
  /**
   * Authenticate student and get JWT token
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response: AxiosResponse<LoginResponse> = await apiClient.post(
        "/api/student/auth/login",
        credentials
      );

      // Store token and user data in localStorage
      if (response.data.success && response.data.token) {
        localStorage.setItem("student_token", response.data.token);
        localStorage.setItem(
          "student_user",
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
   * Logout student (clear local storage)
   */
  static logout(): void {
    localStorage.removeItem("student_token");
    localStorage.removeItem("student_user");
    window.location.href = "/student/auth/login";
  }

  /**
   * Get current student's profile
   */
  static async getProfile(): Promise<StudentProfileResponse> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: { profile: StudentProfileResponse };
      }> = await apiClient.get("/api/student/profile");

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
   * Update student profile
   */
  static async updateProfile(
    profileData: UpdateStudentProfileRequest
  ): Promise<StudentProfileResponse> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: { profile: StudentProfileResponse };
      }> = await apiClient.put("/api/student/profile", profileData);

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
   * Change student password
   */
  static async changePassword(
    passwordData: ChangeStudentPasswordRequest
  ): Promise<void> {
    try {
      await apiClient.put("/api/student/change-password", passwordData);
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
   * Check if student is authenticated
   */
  static isAuthenticated(): boolean {
    const token = localStorage.getItem("student_token");
    const user = localStorage.getItem("student_user");
    return !!(token && user);
  }

  /**
   * Get current student user data from localStorage
   */
  static getCurrentUser(): object | null {
    const userStr = localStorage.getItem("student_user");
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
    return localStorage.getItem("student_token");
  }

  /**
   * Get student's meal history with pagination and filtering
   */
  static async getMealHistory(params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<{
    meal_history: Array<{
      id: string;
      received_at: string;
      menu_name: string;
      menu_description?: string;
      menu_date: string;
      price_per_portion: number;
      menu_image_url?: string;
      allocation_quantity: number;
      allocation_date: string;
    }>;
    statistics: {
      total_meals_claimed: number;
      meals_today: number;
      meals_this_week: number;
      meals_this_month: number;
      total_value: number;
    };
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      limit: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.start_date)
        searchParams.append("start_date", params.start_date);
      if (params?.end_date) searchParams.append("end_date", params.end_date);

      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: {
          meal_history: Array<{
            id: string;
            received_at: string;
            menu_name: string;
            menu_description?: string;
            menu_date: string;
            price_per_portion: number;
            menu_image_url?: string;
            allocation_quantity: number;
            allocation_date: string;
          }>;
          statistics: {
            total_meals_claimed: number;
            meals_today: number;
            meals_this_week: number;
            meals_this_month: number;
            total_value: number;
          };
          pagination: {
            current_page: number;
            total_pages: number;
            total_count: number;
            limit: number;
            has_next: boolean;
            has_prev: boolean;
          };
        };
      }> = await apiClient.get(
        `/api/student/meal-history?${searchParams.toString()}`
      );

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to fetch meal history"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Get today's available menus for the student
   */
  static async getAvailableMenus(): Promise<{
    available_menus: Array<{
      allocation_id: string;
      menu_id: string;
      menu_name: string;
      menu_description?: string;
      menu_date: string;
      price_per_portion: number;
      menu_image_url?: string;
      total_quantity: number;
      distributed_count: number;
      available_quantity: number;
      allocation_date: string;
      already_claimed: boolean;
    }>;
    date: string;
    has_claimed_today: boolean;
    can_claim: boolean;
  }> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: {
          available_menus: Array<{
            allocation_id: string;
            menu_id: string;
            menu_name: string;
            menu_description?: string;
            menu_date: string;
            price_per_portion: number;
            menu_image_url?: string;
            total_quantity: number;
            distributed_count: number;
            available_quantity: number;
            allocation_date: string;
            already_claimed: boolean;
          }>;
          date: string;
          has_claimed_today: boolean;
          can_claim: boolean;
        };
      }> = await apiClient.get("/api/student/available-menus");

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to fetch available menus"
        );
      }
      throw new Error("Network error occurred");
    }
  }
}

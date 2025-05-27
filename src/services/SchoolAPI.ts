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

  /**
   * Get school dashboard data
   */
  static async getDashboard(): Promise<{
    school: {
      id: string;
      name: string;
      npsn: string;
      school_id: string;
    };
    statistics: {
      total_students: number;
      active_allocations: number;
      total_quantity_allocated: number;
      total_distributed: number;
      total_available: number;
      meals_today: number;
      meals_this_week: number;
      meals_this_month: number;
    };
    allocations: Array<{
      allocation_id: string;
      menu_id: string;
      menu_name: string;
      menu_description?: string;
      menu_date: string;
      menu_image_url?: string;
      total_quantity: number;
      distributed_count: number;
      available_quantity: number;
      allocation_date: string;
    }>;
    last_updated: string;
  }> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: {
          school: {
            id: string;
            name: string;
            npsn: string;
            school_id: string;
          };
          statistics: {
            total_students: number;
            active_allocations: number;
            total_quantity_allocated: number;
            total_distributed: number;
            total_available: number;
            meals_today: number;
            meals_this_week: number;
            meals_this_month: number;
          };
          allocations: Array<{
            allocation_id: string;
            menu_id: string;
            menu_name: string;
            menu_description?: string;
            menu_date: string;
            menu_image_url?: string;
            total_quantity: number;
            distributed_count: number;
            available_quantity: number;
            allocation_date: string;
          }>;
          last_updated: string;
        };
      }> = await apiClient.get("/api/school/dashboard");

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to fetch dashboard data"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Get student monitoring data with meal statistics
   */
  static async getStudentMonitoring(params?: {
    page?: number;
    limit?: number;
    search?: string;
    class?: string;
    grade?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{
    students: Array<{
      id: string;
      name: string;
      student_number: string;
      class: string;
      grade: string;
      address?: string;
      gender?: string;
      birth_date?: string;
      created_at: string;
      meal_statistics: {
        total_meals_received: number;
        meals_this_week: number;
        meals_this_month: number;
        last_meal_date?: string;
        total_meal_value: number;
        recent_meals: number;
        activity_status: string;
      };
    }>;
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      limit: number;
      has_next: boolean;
      has_prev: boolean;
    };
    filters: {
      classes: string[];
      grades: string[];
    };
    statistics: {
      total_students: number;
      active_students: number;
      never_claimed_students: number;
      total_meals_distributed: number;
      avg_meals_per_student: string;
      total_meal_value: number;
      activity_rate: string;
    };
  }> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.search) searchParams.append("search", params.search);
      if (params?.class) searchParams.append("class", params.class);
      if (params?.grade) searchParams.append("grade", params.grade);
      if (params?.date_from) searchParams.append("date_from", params.date_from);
      if (params?.date_to) searchParams.append("date_to", params.date_to);

      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: {
          students: Array<{
            id: string;
            name: string;
            student_number: string;
            class: string;
            grade: string;
            address?: string;
            gender?: string;
            birth_date?: string;
            created_at: string;
            meal_statistics: {
              total_meals_received: number;
              meals_this_week: number;
              meals_this_month: number;
              last_meal_date?: string;
              total_meal_value: number;
              recent_meals: number;
              activity_status: string;
            };
          }>;
          pagination: {
            current_page: number;
            total_pages: number;
            total_count: number;
            limit: number;
            has_next: boolean;
            has_prev: boolean;
          };
          filters: {
            classes: string[];
            grades: string[];
          };
          statistics: {
            total_students: number;
            active_students: number;
            never_claimed_students: number;
            total_meals_distributed: number;
            avg_meals_per_student: string;
            total_meal_value: number;
            activity_rate: string;
          };
        };
      }> = await apiClient.get(
        `/api/school/student-monitoring?${searchParams.toString()}`
      );

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message ||
            "Failed to fetch student monitoring data"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Get food menu list with distribution statistics
   */
  static async getFoodMenuList(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
    sort_order?: string;
  }): Promise<{
    menus: Array<{
      menu_id: string;
      name: string;
      description?: string;
      menu_date: string;
      price_per_portion: number;
      image_url?: string;
      nutritional_info?: string;
      allocation: {
        allocation_id: string;
        allocated_quantity: number;
        allocation_date: string;
        remaining_quantity: number;
      };
      distribution: {
        distributed_count: number;
        completion_rate: number;
        total_value_distributed: number;
        today_distributed: number;
        yesterday_distributed: number;
        week_distributed: number;
        avg_daily_distribution: number;
      };
      participation: {
        unique_students_served: number;
        repeat_students: number;
      };
      status: {
        menu_status: string;
        time_category: string;
      };
    }>;
    pagination: {
      current_page: number;
      total_pages: number;
      total_count: number;
      limit: number;
      has_next: boolean;
      has_prev: boolean;
    };
    statistics: {
      total_menus: number;
      upcoming_menus: number;
      today_menus: number;
      completed_menus: number;
      total_allocated_portions: number;
      total_distributed_portions: number;
      total_value_distributed: number;
      avg_completion_rate: number;
      overall_efficiency: string;
    };
    filters: {
      available_statuses: string[];
      sort_options: Array<{ value: string; label: string }>;
    };
  }> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.search) searchParams.append("search", params.search);
      if (params?.status) searchParams.append("status", params.status);
      if (params?.date_from) searchParams.append("date_from", params.date_from);
      if (params?.date_to) searchParams.append("date_to", params.date_to);
      if (params?.sort_by) searchParams.append("sort_by", params.sort_by);
      if (params?.sort_order)
        searchParams.append("sort_order", params.sort_order);

      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: {
          menus: Array<{
            menu_id: string;
            name: string;
            description?: string;
            menu_date: string;
            price_per_portion: number;
            image_url?: string;
            nutritional_info?: string;
            allocation: {
              allocation_id: string;
              allocated_quantity: number;
              allocation_date: string;
              remaining_quantity: number;
            };
            distribution: {
              distributed_count: number;
              completion_rate: number;
              total_value_distributed: number;
              today_distributed: number;
              yesterday_distributed: number;
              week_distributed: number;
              avg_daily_distribution: number;
            };
            participation: {
              unique_students_served: number;
              repeat_students: number;
            };
            status: {
              menu_status: string;
              time_category: string;
            };
          }>;
          pagination: {
            current_page: number;
            total_pages: number;
            total_count: number;
            limit: number;
            has_next: boolean;
            has_prev: boolean;
          };
          statistics: {
            total_menus: number;
            upcoming_menus: number;
            today_menus: number;
            completed_menus: number;
            total_allocated_portions: number;
            total_distributed_portions: number;
            total_value_distributed: number;
            avg_completion_rate: number;
            overall_efficiency: string;
          };
          filters: {
            available_statuses: string[];
            sort_options: Array<{ value: string; label: string }>;
          };
        };
      }> = await apiClient.get(
        `/api/school/food-menu-list?${searchParams.toString()}`
      );

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to fetch food menu list"
        );
      }
      throw new Error("Network error occurred");
    }
  }
}

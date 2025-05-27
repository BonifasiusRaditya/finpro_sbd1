import axios, { AxiosResponse } from "axios";
import { LoginRequest, LoginResponse } from "@/types/auth-types";
import {
  SchoolResponse,
  CreateSchoolRequest,
  UpdateSchoolRequest,
} from "@/types/school-types";
import {
  MenuResponse,
  CreateMenuRequest,
  UpdateMenuRequest,
  MenuAllocationResponse,
  CreateMenuAllocationRequest,
  UpdateMenuAllocationRequest,
} from "@/types/menu-types";

// Pagination interface
interface PaginationInfo {
  current_page: number;
  total_pages: number;
  total_count: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// Analytics types
interface AnalyticsOverview {
  total_schools: number;
  total_students: number;
  total_menus: number;
  active_menus: number;
  total_allocations: number;
  active_allocations: number;
  total_distributions: number;
  unique_students_served: number;
  total_portions_allocated: number;
  total_budget_allocated: number;
  avg_menu_price: number;
}

interface AnalyticsActivity {
  new_schools_30d: number;
  new_students_30d: number;
  new_menus_30d: number;
  new_allocations_30d: number;
  today_distributions: number;
  week_distributions: number;
  month_distributions: number;
}

interface AnalyticsEfficiency {
  distribution_rate: number;
  student_participation_rate: number;
  budget_utilization: number;
  avg_cost_per_meal: number;
}

interface AnalyticsTrend {
  month: string;
  distributions: number;
  unique_students: number;
  total_value: number;
}

interface TopSchool {
  id: string;
  name: string;
  npsn: string;
  total_distributions: number;
  unique_students_served: number;
  total_students: number;
  participation_rate: number;
}

interface MenuPopularity {
  id: string;
  name: string;
  date: string;
  price_per_portion: number;
  distribution_count: number;
  total_allocated: number;
  utilization_rate: number;
}

interface AnalyticsResponse {
  overview: AnalyticsOverview;
  recent_activity: AnalyticsActivity;
  efficiency: AnalyticsEfficiency;
  trends: AnalyticsTrend[];
  top_schools: TopSchool[];
  menu_popularity: MenuPopularity[];
}

// Dashboard types
interface DashboardOverview {
  total_schools: number;
  total_students: number;
  new_schools_30d: number;
  total_menus: number;
  active_menus: number;
  recent_menus: number;
  menus_this_week: number;
  total_allocations: number;
  total_portions_allocated: number;
  total_budget_allocated: number;
  upcoming_allocations: number;
  today_allocations: number;
  recent_allocations: number;
  total_distributions: number;
  unique_students_served: number;
  today_distributions: number;
  yesterday_distributions: number;
  week_distributions: number;
  month_distributions: number;
  total_distribution_value: number;
  avg_menu_price: number;
  avg_allocation_quantity: number;
}

interface DashboardEfficiency {
  overall_distribution_rate: number;
  overall_participation_rate: number;
  active_schools: number;
  recently_active_schools: number;
  distribution_growth: number;
  participation_growth: number;
}

interface SchoolPerformance {
  id: string;
  name: string;
  npsn: string;
  total_students: number;
  total_distributions: number;
  unique_students_served: number;
  participation_rate: number;
  recent_distributions: number;
  today_distributions: number;
}

interface DailyTrend {
  date: string;
  distributions: number;
  unique_students: number;
  active_schools: number;
  total_value: number;
}

interface MenuPopularityDashboard {
  id: string;
  name: string;
  date: string;
  price_per_portion: number;
  distribution_count: number;
  total_allocated: number;
  utilization_rate: number;
  schools_served: number;
}

interface RecentActivity {
  activity_type: string;
  title: string;
  description: string;
  timestamp: string;
  entity_id: string;
}

interface DashboardResponse {
  overview: DashboardOverview;
  efficiency: DashboardEfficiency;
  school_performance: SchoolPerformance[];
  daily_trends: DailyTrend[];
  menu_popularity: MenuPopularityDashboard[];
  recent_activities: RecentActivity[];
}

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
      window.location.href = "/govt/auth/login";
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
    window.location.href = "/gov/auth/login";
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

  // ===== MENU MANAGEMENT =====

  /**
   * Get all menus with pagination and filtering
   */
  static async getMenus(params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<{ menus: MenuResponse[]; pagination: PaginationInfo }> {
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
        data: { menus: MenuResponse[]; pagination: PaginationInfo };
      }> = await apiClient.get(`/api/gov/menus?${searchParams.toString()}`);

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(error.response.data.message || "Failed to fetch menus");
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Get a specific menu by ID
   */
  static async getMenu(menuId: string): Promise<MenuResponse> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: MenuResponse;
      }> = await apiClient.get(`/api/gov/menus/${menuId}`);

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(error.response.data.message || "Failed to fetch menu");
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Create a new menu
   */
  static async createMenu(menuData: CreateMenuRequest): Promise<MenuResponse> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: MenuResponse;
      }> = await apiClient.post("/api/gov/menus", menuData);

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(error.response.data.message || "Failed to create menu");
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Update a menu
   */
  static async updateMenu(
    menuId: string,
    menuData: UpdateMenuRequest
  ): Promise<MenuResponse> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: MenuResponse;
      }> = await apiClient.put(`/api/gov/menus/${menuId}`, menuData);

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(error.response.data.message || "Failed to update menu");
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Delete a menu
   */
  static async deleteMenu(menuId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/gov/menus/${menuId}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(error.response.data.message || "Failed to delete menu");
      }
      throw new Error("Network error occurred");
    }
  }

  // ===== MENU ALLOCATION =====

  /**
   * Get all menu allocations with pagination and filtering
   */
  static async getMenuAllocations(params?: {
    page?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<{
    allocations: MenuAllocationResponse[];
    pagination: PaginationInfo;
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
          allocations: MenuAllocationResponse[];
          pagination: PaginationInfo;
        };
      }> = await apiClient.get(
        `/api/gov/menu-allocations?${searchParams.toString()}`
      );

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to fetch menu allocations"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Get a specific menu allocation by ID
   */
  static async getMenuAllocation(
    allocationId: string
  ): Promise<MenuAllocationResponse> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: MenuAllocationResponse;
      }> = await apiClient.get(`/api/gov/menu-allocations/${allocationId}`);

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to fetch menu allocation"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Create a new menu allocation
   */
  static async createMenuAllocation(
    allocationData: CreateMenuAllocationRequest
  ): Promise<MenuAllocationResponse> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: MenuAllocationResponse;
      }> = await apiClient.post("/api/gov/menu-allocations", allocationData);

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to create menu allocation"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Update a menu allocation
   */
  static async updateMenuAllocation(
    allocationId: string,
    allocationData: UpdateMenuAllocationRequest
  ): Promise<MenuAllocationResponse> {
    try {
      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: MenuAllocationResponse;
      }> = await apiClient.put(
        `/api/gov/menu-allocations/${allocationId}`,
        allocationData
      );

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to update menu allocation"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  /**
   * Delete a menu allocation
   */
  static async deleteMenuAllocation(allocationId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/gov/menu-allocations/${allocationId}`);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to delete menu allocation"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  // ===== ANALYTICS =====

  /**
   * Get comprehensive analytics data
   */
  static async getAnalytics(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<AnalyticsResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.start_date)
        searchParams.append("start_date", params.start_date);
      if (params?.end_date) searchParams.append("end_date", params.end_date);

      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: AnalyticsResponse;
      }> = await apiClient.get(`/api/gov/analytics?${searchParams.toString()}`);

      return response.data.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data) {
        throw new Error(
          error.response.data.message || "Failed to fetch analytics"
        );
      }
      throw new Error("Network error occurred");
    }
  }

  // ===== DASHBOARD =====

  /**
   * Get comprehensive dashboard data
   */
  static async getDashboard(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<DashboardResponse> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.start_date)
        searchParams.append("start_date", params.start_date);
      if (params?.end_date) searchParams.append("end_date", params.end_date);

      const response: AxiosResponse<{
        success: boolean;
        message: string;
        data: DashboardResponse;
      }> = await apiClient.get(`/api/gov/dashboard?${searchParams.toString()}`);

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
}

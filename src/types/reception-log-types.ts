export interface ReceptionLog {
  id: string; // UUID
  user_id: string; // Student ID
  school_menu_allocation_id: string; // Reference to school_menu_allocation
  received_at: Date;
  date: Date; // Date when the meal was claimed
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateReceptionLogRequest {
  user_id: string;
  school_menu_allocation_id: string;
}

export interface ReceptionLogResponse {
  id: string;
  user_id: string;
  school_menu_allocation_id: string;
  received_at: Date;
  student_name: string;
  student_number: string;
  menu_name: string;
  menu_description?: string;
  menu_date: string;
  allocation_quantity: number;
  distributed_at: Date;
}

export interface SchoolDashboardAllocation {
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
}

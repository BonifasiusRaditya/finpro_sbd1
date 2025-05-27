import { School } from "./school-types";

export interface Student {
  id?: string;
  name: string;
  student_number: string;
  password: string;
  class: string;
  grade: string;
  address: string;
  gender: string;
  birth_date: string;
  school_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface StudentExtended extends Student {
  school: School;
}

// API Request Types
export interface CreateStudentRequest {
  name: string;
  student_number: string;
  password: string;
  class: string;
  grade: string;
  address?: string;
  gender?: string;
  birth_date?: string;
}

export interface UpdateStudentProfileRequest {
  name?: string;
  address?: string;
  gender?: string;
  birth_date?: string;
}

export interface ChangeStudentPasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// API Response Types
export interface StudentResponse {
  id: string;
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

export interface StudentProfileResponse extends StudentResponse {
  school_name: string;
  school_npsn: string;
}

export type UserRole = "government" | "school" | "student";

export interface JWTPayload {
  id: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface GovernmentJWTPayload extends JWTPayload {
  role: "government";
  province_id: string;
  province: string;
}

export interface SchoolJWTPayload extends JWTPayload {
  role: "school";
  school_id: string;
  npsn: string;
  name: string;
  government_id: string;
}

export interface StudentJWTPayload extends JWTPayload {
  role: "student";
  student_number: string;
  name: string;
  class: string;
  grade: number;
  school_id: string;
}

export interface LoginRequest {
  identifier: string; // province_id for gov, school_id for school, student_number for student
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    role: UserRole;
    name: string;
    [key: string]: unknown;
  };
  message?: string;
}

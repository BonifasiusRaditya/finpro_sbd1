export interface School {
  id: string; // UUID
  name: string;
  npsn: string;
  school_id: string;
  password: string;
  address?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  government_id: string; // UUID
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateSchoolRequest {
  name: string;
  npsn: string;
  school_id: string;
  password: string;
  address?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
}

export interface UpdateSchoolRequest {
  name?: string;
  address?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  password?: string;
}

export interface SchoolResponse {
  id: string;
  name: string;
  npsn: string;
  school_id: string;
  address?: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  government_id: string;
  created_at?: Date;
  updated_at?: Date;
}

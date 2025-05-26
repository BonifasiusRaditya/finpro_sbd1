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
}

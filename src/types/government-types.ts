export interface Government {
  id: string; // UUID
  province_id: string;
  province: string;
  password: string;
  address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Menu {
  id: string; // UUID
  name: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  price_per_portion: number;
  image_url?: string;
  created_by?: string; // Government ID that created this menu
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateMenuRequest {
  name: string;
  description?: string;
  date: string; // YYYY-MM-DD format
  price_per_portion: number;
  image_url?: string;
}

export interface UpdateMenuRequest {
  name?: string;
  description?: string;
  date?: string;
  price_per_portion?: number;
  image_url?: string;
}

export interface MenuResponse {
  id: string;
  name: string;
  description?: string;
  date: string;
  price_per_portion: number;
  image_url?: string;
  created_by?: string; // Government ID that created this menu
  created_at?: Date;
  updated_at?: Date;
}

export interface SchoolMenuAllocation {
  id: string; // UUID
  school_id: string;
  menu_id: string;
  quantity: number;
  date: string; // YYYY-MM-DD format
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateMenuAllocationRequest {
  school_id: string;
  menu_id: string;
  quantity: number;
  date: string; // YYYY-MM-DD format
}

export interface UpdateMenuAllocationRequest {
  quantity?: number;
  date?: string;
}

export interface MenuAllocationResponse {
  id: string;
  school_id: string;
  menu_id: string;
  quantity: number;
  date: string;
  created_at?: Date;
  updated_at?: Date;
  menu?: MenuResponse;
  school?: {
    id: string;
    name: string;
    npsn: string;
    school_id: string;
  };
}

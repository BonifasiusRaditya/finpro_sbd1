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

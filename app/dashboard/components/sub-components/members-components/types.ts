// Common types used across member components
export interface Member {
  id: string;
  family_no: number;
  surname: string;
  name: string;
  fathers_or_husbands_name: string;
  father_in_laws_name: string;
  gender: string;
  relationship: string;
  marital_status: string;
  marriage_date: string;
  date_of_birth: string;
  education: string;
  stream: string;
  qualification: string;
  occupation: string;
  email: string;
  profile_pic: string;
  family_cover_pic: string;
  blood_group: string;
  native_place: string;
  residential_address_line1: string;
  residential_address_state: string;
  residential_address_city: string;
  pin_code: string;
  residential_landline: string;
  office_address: string;
  office_address_state: string;
  office_address_city: string;
  office_address_pin: string;
  landline_office: string;
  mobile_no1: string;
  mobile_no2: string;
  date_of_demise: string | null;
  updated_at: string;
}

export type SortDirection = "asc" | "desc" | null;
export type SortField = keyof Member | null;

// Define filter options
export type FilterOption = {
  id: string;
  label: string;
  options?: { value: string; label: string }[];
  type: "select" | "date" | "text";
  field: string;
};
// Common types used across member components
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
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
// Types for applications
export type ApplicationStatus = "pending" | "approved" | "rejected";

export type EventApplication = {
  id: string; // uuid
  user_id: string; // uuid
  name: string;
  description: string;
  start_at: string; // timestamptz
  duration: string; // interval
  organizers: string[];
  submitted_at: string; // timestamptz
  image_url?: string;
  created_at: string; // timestamptz
  location: string;
  city: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  status: ApplicationStatus;
};

export type DonationApplication = {
  id: string; // uuid
  user_id: string; // uuid
  amount: number;
  description: string;
  cause: string;
  open_till: string;
  submitted_at: string; // timestamptz
  image_url?: string;
  created_at: string; // timestamptz
  status: ApplicationStatus;
};

// Loan Application Types
export type EducationLoanApplication = {
  id: string; // uuid
  user_id: string; // uuid
  full_name: string;
  gender: string;
  marital_status: string;
  nationality: string;
  current_address: string;
  permanent_address: string;
  passport_number: string;
  cibil_score: number;
  level_of_study: string;
  mode_of_study: string;
  course_name: string;
  course_duration: string;
  institution_name: string;
  institution_type: string;
  institution_address: string;
  commencement_date: string; // date
  completion_date: string; // date
  visa_status: string;
  total_course_fee: number;
  other_expenses: number;
  self_contribution: number;
  loan_amount: number;
  repayment_period: number;
  moratorium_period: number;
  tenth_details: string;
  competitive_exams: any; // jsonb
  admission_letter_url: string;
  academic_certificates_url: string;
  created_at: string; // timestamptz
  date_of_birth: string; // date
  mobile_number: string;
  email_id: string;
  pan_number: string;
  aadhaar_number: string;
  employment_status: boolean;
  company_name: string;
  designation: string;
  annual_income: number;
  work_experience: number;
  salary_slips_url: string;
  co_applicant_name: string;
  co_applicant_relation: string;
  co_applicant_dob: string; // date
  co_applicant_mobile: string;
  co_applicant_email: string;
  co_applicant_occupation: string;
  co_applicant_employer: string;
  co_applicant_income: number;
  co_applicant_pan: string;
  co_applicant_aadhaar: string;
  co_applicant_address_proof_url: string;
  co_applicant_income_proof_url: string;
  movable_assets: any; // jsonb
  immovable_assets: any; // jsonb
  existing_loans: any; // jsonb
  total_liabilities: number;
  security_offered: string;
  bank_account_holder_name: string;
  bank_name: string;
  bank_branch: string;
  bank_account_number: string;
  bank_ifsc_code: string;
  declaration_signed: boolean;
  declaration_date: string; // date
  applicant_signature_url: string;
  co_applicant_signature_url: string;
  co_applicant_cibil_score: string;
  twelfth_details: string;
  graduation_details: string;
  status: ApplicationStatus;
};

export type BusinessLoanApplication = {
  id: string; // uuid
  user_id: string; // uuid
  full_name: string;
  date_of_birth: string; // date
  gender: string;
  residential_address: string;
  marital_status: string;
  cibil_score: number;
  pan_number: string;
  aadhaar_number: string;
  business_name: string;
  nature_of_business: string;
  industry_type: string;
  business_pan: string;
  gstin: string;
  business_address: string;
  udyam_registration: string;
  website_url: string;
  annual_turnover: number;
  net_profit: number;
  monthly_revenue: number;
  current_liabilities: number;
  loan_amount: number;
  loan_tenure: number;
  preferred_emi: number;
  disbursement_date: string; // date
  bank_statements_url: string;
  itr_documents_url: string;
  pan_card_url: string;
  aadhaar_card_url: string;
  gst_certificate_url: string;
  created_at: string; // timestamptz
  email: string;
  mobile_number: string;
  business_type: string;
  year_of_incorporation: string; // date
  annual_turnover_year1: number;
  annual_turnover_year2: number;
  annual_turnover_year3: number;
  net_profit_year1: number;
  net_profit_year2: number;
  net_profit_year3: number;
  monthly_revenue_6months: number[];
  audited_financial_statements_url: string;
  loan_purpose: string;
  co_applicant_full_name: string;
  co_applicant_relation: string;
  co_applicant_pan: string;
  co_applicant_aadhaar: string;
  co_applicant_contact: string;
  co_applicant_occupation: string;
  co_applicant_annual_income: number;
  co_applicant_cibil_score: number;
  co_applicant_id_proof_url: string;
  co_applicant_income_proof_url: string;
  has_collateral: boolean;
  collateral_asset_type: string;
  collateral_asset_value: number;
  collateral_ownership_proof_url: string;
  collateral_asset_location: string;
  udyam_registration_url: string;
  business_address_proof_url: string;
  collateral_documents_url: string;
  bank_account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  bank_branch: string;
  declaration_accepted: boolean;
  e_signature: string;
  status: ApplicationStatus;
};

// Hostel Application Types
export type GirlsHostelApplication = {
  id: string; // uuid
  created_at: string;
  user_id: string; // uuid
  applicant_name: string;
  age: number;
  institution: string;
  course: string;
  duration: string;
  contact: string;
  description: string;
  image_url?: string;
  submitted_at: string; // timestamptz
  status: ApplicationStatus;
};

export type MulundHostelApplication = {
  id: string; // uuid
  created_at: string;
  user_id: string; // uuid 
  applicant_name: string;
  age: number;
  institution: string;
  course: string;
  duration: string;
  contact: string;
  description: string;
  image_url?: string;
  submitted_at: string; // timestamptz
  status: ApplicationStatus;
};

export type VatsalyadhamApplication = {
  id: string; // uuid
  created_at: string;
  user_id: string; // uuid
  applicant_name: string;
  age: number;
  reason: string;
  duration: string;
  contact: string;
  description: string;
  image_url?: string;
  submitted_at: string; // timestamptz
  status: ApplicationStatus;
};

export type ApplicationType =
  | "event"
  | "donation"
  | "education_loan"
  | "business_loan"
  | "girls_hostel"
  | "mulund_hostel"
  | "vatsalyadham";

export type LoanApplicationType = "education_loan" | "business_loan";
export type HostelApplicationType = "girls_hostel" | "mulund_hostel" | "vatsalyadham";
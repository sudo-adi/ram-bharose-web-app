// Types for applications
export type EventApplication = {
  id: number;
  created_at: string;
  user_id: string;
  name: string;
  description: string;
  start_at: string;
  duration: string;
  organizers: string[];
  image_url?: string;
  status: "pending" | "approved" | "rejected";
};

export type DonationApplication = {
  id: number;
  created_at: string;
  user_id: string;
  amount: number;
  description: string;
  cause: string;
  open_till: string;
  image_url?: string;
  status: "pending" | "approved" | "rejected";
};

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type ApplicationType = "event" | "donation";
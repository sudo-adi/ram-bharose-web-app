export type Member = {
  id: string;
  name: string;
  phone: string;
  image: string;
  position?: string;
};

export type CommitteeWithMembers = {
  id: number;
  name: string;
  image: string;
  totalMembers: number;
  members: Member[];
};

export type CommitteeFormData = {
  name: string;
  location: string;
  member_name: string;
  phone: string;
  image?: File; // Add this optional property
};

export type MemberFormData = {
  member_name: string;
  phone: string;
  committee_name: string;
  name: string; // Add this property
};
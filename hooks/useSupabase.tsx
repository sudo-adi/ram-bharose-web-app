import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { decode } from 'base64-arraybuffer';
import { Event } from "../app/dashboard/components/sub-components/event-components/types";
import { Donation } from "../app/dashboard/components/sub-components/donation-components/types";

// Hook for member operations (add, update, delete)
export const useMemberOperations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const uploadProfilePicture = async (base64Data: string, fileName: string) => {
    const decodedFile = decode(base64Data);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, decodedFile, {
        contentType: 'image/jpeg'
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const saveMember = async (member: any, isUpdate = false) => {
    setLoading(true);
    setError(null);
    console.log("Saving member:", member);
    try {
      const profileData = {
        ...member,
        family_no: Number(member.family_no),
        updated_at: new Date().toISOString()
      };

      // Handle profile picture upload if it's a base64 string
      if (member.profile_pic?.startsWith('data:image')) {
        const base64Data = member.profile_pic.split(',')[1];
        const fileName = `profile-${Date.now()}.jpg`;
        profileData.profile_pic = await uploadProfilePicture(base64Data, fileName);
      }

      let result;
      if (isUpdate && member.id) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', member.id)
          .select()
          .single();
      } else {
        // Add new profile
        const profileDataWithoutId = { ...profileData };
        result = await supabase
          .from('profiles')
          .insert(profileDataWithoutId)
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return result.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMember = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    saveMember,
    deleteMember
  };
};

// Form Types
interface EventFormData {
  userId: string;
  name: string;
  description: string;
  startTime: string;
  duration: string;
  organizers: string[]; // Changed to string array
  image?: File;
}

interface DonationFormData {
  userId: string;
  amount: number;
  description: string;
  cause: string;
  openTill: string;
  image?: File;
}

// Types
type Profile = {
  id: number;
  family_no: string;
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
  date_of_demise: string;
};

interface Article {
  id: string;
  title: string;
  body: string;
  header_image_url: string;
  created_at: string;
  userName: string;
}

type UseQueryResult<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
};

type Committee = {
  id: number;
  created_at: string;
  name: string;
  phone: string;
  location: string;
  member_name: string;
};

type Business = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  created_at: string;
  images?: string[];
  logo?: string;
  owner?: {
    name: string;
    image: string;
  };
  image_url?: string;
};

// Updated hook with pagination, search, and filters
export const useProfiles = (
  page = 1,
  pageSize = 20,
  searchQuery = "",
  filters = {}
) => {
  const [result, setResult] = useState<
    UseQueryResult<{ data: Profile[]; count: number }>
  >({
    data: null,
    error: null,
    loading: true,
  });

  const fetchProfiles = async () => {
    try {
      setResult((prev) => ({ ...prev, loading: true }));

      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Create query with pagination
      let query = supabase
        .from("profiles")
        .select("*", { count: "exact" })
        .range(from, to);

      // Add search filter if provided
      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,surname.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,mobile_no1.ilike.%${searchQuery}%`
        );
      }

      // Apply additional filters if provided
      if (filters && Object.keys(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            query = query.eq(key, value);
          }
        });
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setResult({
        data: { data: data || [], count: count || 0 },
        error: null,
        loading: false,
      });
    } catch (error) {
      setResult({
        data: null,
        error: error as Error,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [page, pageSize, searchQuery, JSON.stringify(filters)]);

  return { ...result, refetch: fetchProfiles };
};

export const useProfile = (id: number) => {
  const [result, setResult] = useState<UseQueryResult<Profile>>({
    data: null,
    error: null,
    loading: true,
  });

  const fetchProfile = async () => {
    try {
      setResult((prev) => ({ ...prev, loading: true }));
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setResult({
        data,
        error: null,
        loading: false,
      });
    } catch (error) {
      setResult({
        data: null,
        error: error as Error,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  return { ...result, refetch: fetchProfile };
};

// Form submission hooks
export const useFormSubmission = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadImage = async (file: File, id: number) => {
    try {
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      // Convert ArrayBuffer to Uint8Array for Supabase storage
      const uint8Array = new Uint8Array(arrayBuffer);

      const fileExtension = file.name.split(".").pop() || "jpg";
      const filePath = `${id}.${fileExtension}`;
      const contentType = file.type;

      const { data, error } = await supabase.storage
        .from("application-pictures")
        .upload(filePath, uint8Array, { contentType });

      if (error) {
        console.error(error);
        throw error;
      }
      return data.path;
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const submitEvent = async (formData: EventFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Convert organizers array to PostgreSQL array format
      const organizersArray = `{${formData.organizers.join(",")}}`;

      // First submit the event data without image
      const { data: eventData, error: insertError } = await supabase
        .from("event_applications")
        .insert([
          {
            user_id: formData.userId,
            name: formData.name,
            description: formData.description,
            start_at: formData.startTime,
            duration: formData.duration,
            organizers: organizersArray,
          },
        ])
        .select();

      if (insertError) throw insertError;

      // Then upload image if exists using the event ID
      let imagePath = null;
      if (formData.image && eventData?.[0]?.id) {
        imagePath = await uploadImage(formData.image, eventData[0].id);

        // Update the event with image path
        const { error: updateError } = await supabase
          .from("event_applications")
          .update({ image_url: imagePath })
          .eq("id", eventData[0].id);

        if (updateError) throw updateError;
      }

      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitDonation = async (formData: DonationFormData) => {
    setLoading(true);
    setError(null);

    try {
      // First submit the donation data without image
      const { data: donationData, error: insertError } = await supabase
        .from("donation_applications")
        .insert([
          {
            user_id: formData.userId,
            amount: formData.amount,
            description: formData.description,
            cause: formData.cause,
            open_till: formData.openTill,
          },
        ])
        .select();

      if (insertError) throw insertError;

      // Then upload image if exists using the donation ID
      let imagePath = null;
      if (formData.image && donationData?.[0]?.id) {
        imagePath = await uploadImage(formData.image, donationData[0].id);

        // Update the donation with image path
        const { error: updateError } = await supabase
          .from("donation_applications")
          .update({ image_url: imagePath })
          .eq("id", donationData[0].id);

        if (updateError) throw updateError;
      }

      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    submitEvent,
    submitDonation,
  };
};

export const useBirthdays = (filter: "today" | "month" | "all" = "all") => {
  const [result, setResult] = useState<UseQueryResult<any[]>>({
    // Changed from Profile[] to any[]
    data: null,
    error: null,
    loading: true,
  });

  const fetchBirthdays = async () => {
    try {
      setResult((prev) => ({ ...prev, loading: true }));

      const { data, error } = await supabase
        .from("profiles")
        .select("name, surname, date_of_birth, profile_pic, mobile_no1, email")
        .not("date_of_birth", "is", null);

      if (error) throw error;

      // Transform and filter the data
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();

      const monthAbbreviations = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const transformedData = data
        .map((profile) => {
          if (!profile.date_of_birth) return null;

          try {
            // More robust date parsing
            const parts = profile.date_of_birth.split("/");
            if (parts.length !== 3) return null;

            const [day, monthAbbr, yearPart] = parts;
            const monthIndex = monthAbbreviations.findIndex(
              (m) => m.toLowerCase() === monthAbbr.toLowerCase()
            );

            if (monthIndex === -1) return null;

            const parsedDay = parseInt(day);
            if (isNaN(parsedDay)) return null;

            let fullYear = parseInt(yearPart);
            if (isNaN(fullYear)) return null;

            if (yearPart.length === 2) {
              fullYear = fullYear < 50 ? 2000 + fullYear : 1900 + fullYear;
            }

            const birthDate = new Date(fullYear, monthIndex, parsedDay);
            let age = now.getFullYear() - birthDate.getFullYear();

            if (
              now.getMonth() < monthIndex ||
              (now.getMonth() === monthIndex && now.getDate() < parsedDay)
            ) {
              age--;
            }

            const displayDate = new Date(
              now.getFullYear(),
              monthIndex,
              parsedDay
            ).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            });

            return {
              id: `${profile.name}-${profile.date_of_birth}`,
              name: `${profile.name} ${profile.surname || ""}`.trim(),
              age: age.toString(),
              date: displayDate,
              image:
                profile.profile_pic ||
                "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg",
              phone: profile.mobile_no1,
              email: profile.email,
              monthIndex,
              day: parsedDay,
            };
          } catch (e) {
            console.error("Error parsing date:", profile.date_of_birth, e);
            return null;
          }
        })
        .filter(Boolean)
        .filter((birthday) => {
          if (!birthday) return false; // Add null check

          if (filter === "today") {
            return (
              birthday.monthIndex === currentMonth &&
              birthday.day === currentDay
            );
          } else if (filter === "month") {
            return birthday.monthIndex === currentMonth;
          }
          return true;
        })
        .sort((a, b) => {
          // Add null checks for a and b
          if (!a || !b) return 0;

          if (a.monthIndex !== b.monthIndex) {
            return a.monthIndex - b.monthIndex;
          }
          return a.day - b.day;
        });

      setResult({
        data: transformedData,
        error: null,
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching birthdays:", error);
      setResult({
        data: null,
        error: error as Error,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchBirthdays();
  }, [filter]);

  return { ...result, refetch: fetchBirthdays };
};

export const useFamilyVerification = (familyCode: string) => {
  const [result, setResult] = useState<UseQueryResult<Profile[]>>({
    data: null,
    error: null,
    loading: true,
  });

  const verifyFamilyCode = async () => {
    try {
      setResult((prev) => ({ ...prev, loading: true }));
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("family_no", familyCode);

      if (error) throw error;

      setResult({
        data,
        error: null,
        loading: false,
      });
    } catch (error) {
      setResult({
        data: null,
        error: error as Error,
        loading: false,
      });
    }
  };

  useEffect(() => {
    if (familyCode) {
      verifyFamilyCode();
    }
  }, [familyCode]);

  return { ...result, refetch: verifyFamilyCode };
};

export const useCommittees = () => {
  const [result, setResult] = useState<UseQueryResult<Committee[]>>({
    data: null,
    error: null,
    loading: true,
  });

  const fetchCommittees = async () => {
    try {
      setResult((prev) => ({ ...prev, loading: true }));
      const { data, error } = await supabase
        .from("committee") // Make sure this matches your table name exactly
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setResult({
        data,
        error: null,
        loading: false,
      });
    } catch (error) {
      setResult({
        data: null,
        error: error as Error,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchCommittees();
  }, []);

  // Add committee function
  const addCommittee = async (committeeData: {
    name: string;
    location: string;
    member_name: string;
    phone: string;
  }) => {
    try {
      const { error } = await supabase
        .from("committee")
        .insert([committeeData]);

      if (error) throw error;

      // Refresh the data after adding
      await fetchCommittees();
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Update committee function
  const updateCommittee = async (
    committeeId: number,
    updatedData: Partial<Committee>
  ) => {
    try {
      const { error } = await supabase
        .from("committee")
        .update(updatedData)
        .eq("id", committeeId);

      if (error) throw error;

      // Refresh the data after update
      await fetchCommittees();
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Delete committee function
  const deleteCommittee = async (committeeId: number) => {
    try {
      const { error } = await supabase
        .from("committee")
        .delete()
        .eq("id", committeeId);

      if (error) throw error;

      // Refresh the data after deletion
      await fetchCommittees();
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  // Add committee member function
  const addCommitteeMember = async (committeeData: {
    committee_name: string;
    member_name: string;
    phone: string;
    location?: string;
  }) => {
    try {
      const { error } = await supabase.from("committee").insert([
        {
          name: committeeData.committee_name,
          member_name: committeeData.member_name,
          phone: committeeData.phone,
          location: committeeData.location,
        },
      ]);

      if (error) throw error;

      // Refresh the data after adding
      await fetchCommittees();
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  return {
    ...result,
    refetch: fetchCommittees,
    addCommittee,
    updateCommittee,
    deleteCommittee,
    addCommitteeMember, // Add this new function to the return object
  };
};

// Add this type to your existing types
type CommitteeImage = {
  name: string;
  url: string;
  created_at: string;
  size: number;
  contentType: string;
};

// Add this hook to your existing hooks
export const useCommitteeImages = () => {
  const [result, setResult] = useState<UseQueryResult<CommitteeImage[]>>({
    data: null,
    error: null,
    loading: true,
  });

  const fetchCommitteeImages = async () => {
    try {
      setResult((prev) => ({ ...prev, loading: true }));

      // List all files in the committee_pictures bucket
      const { data: files, error } = await supabase.storage
        .from("committee-pictures")
        .list();

      if (error) throw error;

      // Get public URLs for each image
      const images = await Promise.all(
        files.map(async (file) => {
          const {
            data: { publicUrl },
          } = supabase.storage
            .from("committee-pictures")
            .getPublicUrl(file.name);

          return {
            name: file.name,
            url: publicUrl,
            created_at: file.created_at,
            size: file.metadata?.size || 0,
            contentType: file.metadata?.mimetype || "image/jpeg",
          };
        })
      );

      setResult({
        data: images,
        error: null,
        loading: false,
      });
    } catch (error) {
      setResult({
        data: null,
        error: error as Error,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchCommitteeImages();
  }, []);

  return { ...result, refetch: fetchCommitteeImages };
};

// Add this type to your existing types
type Doctor = {
  id: number;
  name: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  clinic_address: string;
  contact_email: string;
  contact_phone: string;
  available_timings: string;
  created_at: string;
};

export const useDoctors = (page = 1, pageSize = 9, searchQuery = "") => {
  const [result, setResult] = useState<
    UseQueryResult<{ data: Doctor[]; count: number }>
  >({
    data: null,
    error: null,
    loading: true,
  });

  const fetchDoctors = async () => {
    try {
      setResult((prev) => ({ ...prev, loading: true }));

      // Calculate range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      // Create query with pagination
      let query = supabase
        .from("doctors")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to);

      // Add search filter if provided
      if (searchQuery) {
        query = query.or(
          `name.ilike.%${searchQuery}%,specialization.ilike.%${searchQuery}%,qualification.ilike.%${searchQuery}%`
        );
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setResult({
        data: { data: data || [], count: count || 0 },
        error: null,
        loading: false,
      });
    } catch (error) {
      setResult({
        data: null,
        error: error as Error,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [page, pageSize, searchQuery]);

  // Add update doctor function
  const updateDoctor = async (
    doctorId: number,
    updatedData: Partial<Doctor>
  ) => {
    try {
      const { error } = await supabase
        .from("doctors")
        .update(updatedData)
        .eq("id", doctorId);

      if (error) throw error;

      // Refresh the data after update
      await fetchDoctors();
      return { success: true, error: null };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  };

  return { ...result, refetch: fetchDoctors, updateDoctor };
};

// Hooks for Business-related queries
export const useBusiness = () => {
  const [result, setResult] = useState<UseQueryResult<Business[]>>({
    data: null,
    error: null,
    loading: true,
  });

  const fetchBusinesses = async () => {
    try {
      setResult((prev) => ({ ...prev, loading: true }));
      const { data, error } = await supabase.from("nari_sahas").select("*");

      if (error) throw error;

      // Fetch images and logo for each business
      const businessesWithImages = await Promise.all(
        data.map(async (business) => {
          // Get business logo
          const { data: logoData } = await supabase.storage
            .from("businesses")
            .list(`${business.user_id}/logo`);

          const logoUrl =
            logoData && logoData.length > 0
              ? (
                supabase.storage
                  .from("businesses")
                  .getPublicUrl(
                    `${business.user_id}/logo/${logoData[0].name}`
                  )
              ).data.publicUrl
              : null;

          // Get business images
          const { data: imagesData } = await supabase.storage
            .from("businesses")
            .list(`${business.user_id}/images`);

          const imageUrls = await Promise.all(
            (imagesData || []).map(async (image) => {
              const {
                data: { publicUrl },
              } = supabase.storage
                .from("businesses")
                .getPublicUrl(`${business.user_id}/images/${image.name}`);
              return publicUrl;
            })
          );

          return {
            ...business,
            logo: logoUrl,
            images: imageUrls,
          };
        })
      );

      setResult({
        data: businessesWithImages,
        error: null,
        loading: false,
      });
    } catch (error) {
      setResult({
        data: null,
        error: error as Error,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return { ...result, refetch: fetchBusinesses };
};

// Add this type to your existing types
type ShubhChintak = {
  id: number;
  created_at: string;
  file_url: string;
  title: string;
  cover_image_name: string;
  cover_image_url?: string; // This will be added after fetching from storage
};

// Update the useShubhChintak hook
export const useShubhChintak = (limit?: number) => {
  const [result, setResult] = useState<UseQueryResult<ShubhChintak[]>>({
    data: null,
    error: null,
    loading: true,
  });

  const fetchShubhChintak = async () => {
    try {
      setResult((prev) => ({ ...prev, loading: true }));

      // 1. Fetch magazine data from the table
      let query = supabase
        .from("shubh_chintak")
        .select("*")
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data: magazines, error: tableError } = await query;

      if (tableError) throw tableError;

      if (!magazines || magazines.length === 0) {
        setResult({
          data: [],
          error: null,
          loading: false,
        });
        return;
      }

      // 2. Get cover image URLs from storage
      const magazinesWithImages = await Promise.all(
        magazines.map(async (magazine) => {
          if (magazine.cover_image_name) {
            const {
              data: { publicUrl },
            } = supabase.storage
              .from("shubh-chintak")
              .getPublicUrl(`magzine-cover/${magazine.cover_image_name}.png`);

            return {
              ...magazine,
              cover_image_url: publicUrl,
            };
          }
          return magazine;
        })
      );

      setResult({
        data: magazinesWithImages,
        error: null,
        loading: false,
      });
    } catch (error) {
      setResult({
        data: null,
        error: error as Error,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchShubhChintak();
  }, [limit]);

  return { ...result, refetch: fetchShubhChintak };
};

// Add this type definition before the useFamilies hook
type Family = {
  id: number; // family_no
  name: string; // surname + family name
  headName: string; // head of family name
  headImage: string; // head profile pic
  coverImage: string; // family cover pic
  address: string; // residential address
  city: string; // residential address city
  state: string; // residential address state
  pinCode: string; // pin code
  totalMembers: number; // count of members
  members: FamilyMember[]; // array of family members
};

// You'll also need to add the FamilyMember type
type FamilyMember = {
  uuid: string;
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
  date_of_demise: string;
  updated_at: string;
};

// New hook for fetching distinct family numbers and their members
export const useNews = () => {
  const [result, setResult] = useState<UseQueryResult<Article[]>>({
    data: null,
    error: null,
    loading: true,
  });

  const fetchNews = async () => {
    try {
      setResult((prev) => ({ ...prev, loading: true }));
      const { data: articles, error: articlesError } = await supabase
        .from("articles")
        .select("*");

      if (articlesError) throw articlesError;


      setResult({
        data: articles,
        error: null,
        loading: false,
      });
    } catch (error) {
      setResult({
        data: null,
        error: error as Error,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return { ...result, refetch: fetchNews };
};

export const useFamilies = (page = 1, pageSize = 12, searchQuery = "") => {
  const [result, setResult] = useState<
    UseQueryResult<{ families: Family[]; count: number }>
  >({
    data: null,
    error: null,
    loading: true,
  });

  const fetchFamilies = async () => {
    try {
      setResult((prev) => ({ ...prev, loading: true }));

      // Step 1: First fetch distinct family numbers with pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1; // Changed to be inclusive upper bound

      // Query to get distinct family numbers
      let familyQuery = supabase
        .from("profiles")
        .select("family_no,count()", { count: "exact" })
        .not("family_no", "is", null)
        .order("family_no", { ascending: true })

        .range(from, to);

      // Add search filter if provided
      if (searchQuery) {
        familyQuery = supabase
          .from("profiles")
          .select("family_no,count()", { count: "exact" })
          .not("family_no", "is", null)
          .or(`name.ilike.%${searchQuery}%,surname.ilike.%${searchQuery}%`)
          .order("family_no", { ascending: true })
          .range(from, to);
      }

      const { data: familyNos, error: familyError, count } = await familyQuery;

      if (familyError) throw familyError;

      if (!familyNos || familyNos.length === 0) {
        setResult({
          data: { families: [], count: 0 },
          error: null,
          loading: false,
        });
        return;
      }

      // Step 2: Fetch all profiles for these family numbers
      const uniqueFamilyNos = [...new Set(familyNos.map((f) => f.family_no))];

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("family_no", uniqueFamilyNos);

      if (profilesError) throw profilesError;

      // Step 3: Group profiles by family_no and process them
      const familyGroups: Record<string, any[]> = {};

      // Group profiles by family_no
      profilesData?.forEach((profile) => {
        if (!profile.family_no) return;

        if (!familyGroups[profile.family_no]) {
          familyGroups[profile.family_no] = [];
        }
        familyGroups[profile.family_no].push(profile);
      });

      // Process each family group
      const processedFamilies = uniqueFamilyNos
        .filter((familyNo) => familyGroups[familyNo])
        .map((familyNo) => {
          const members = familyGroups[familyNo];

          // Find the head of the family (assuming it's the first member or one with relationship = "Self")
          const headMember =
            members.find((m) => m.relationship?.toLowerCase() === "self") ||
            members[0];

          // Create family members list
          const membersList: FamilyMember[] = members.map((member) => ({
            uuid: member.id.toString(),
            family_no: member.family_no || 0,
            surname: member.surname || "",
            name: member.name || "",
            fathers_or_husbands_name: member.fathers_or_husbands_name || "",
            father_in_laws_name: member.father_in_laws_name || "",
            gender: member.gender || "",
            relationship: member.relationship || "",
            marital_status: member.marital_status || "",
            marriage_date: member.marriage_date || "",
            date_of_birth: member.date_of_birth || "",
            education: member.education || "",
            stream: member.stream || "",
            qualification: member.qualification || "",
            occupation: member.occupation || "",
            email: member.email || "",
            profile_pic:
              member.profile_pic ||
              "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=300",
            family_cover_pic: member.family_cover_pic || "",
            blood_group: member.blood_group || "",
            native_place: member.native_place || "",
            residential_address_line1: member.residential_address_line1 || "",
            residential_address_state: member.residential_address_state || "",
            residential_address_city: member.residential_address_city || "",
            pin_code: member.pin_code || "",
            residential_landline: member.residential_landline || "",
            office_address: member.office_address || "",
            office_address_state: member.office_address_state || "",
            office_address_city: member.office_address_city || "",
            office_address_pin: member.office_address_pin || "",
            landline_office: member.landline_office || "",
            mobile_no1: member.mobile_no1 || "",
            mobile_no2: member.mobile_no2 || "",
            date_of_demise: member.date_of_demise || "",
            updated_at: member.updated_at || "",
          }));

          return {
            id: familyNo,
            name: `${headMember.surname || ""} Family`,
            headName: `${headMember.name} ${headMember.surname || ""}`.trim(),
            headImage:
              headMember.profile_pic ||
              "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=300",
            coverImage:
              headMember.family_cover_pic ||
              "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2000",
            address: headMember.residential_address_line1 || "",
            city: headMember.residential_address_city || "",
            state: headMember.residential_address_state || "",
            totalMembers: members.length,
            members: membersList,
          };
        });

      setResult({
        data: {
          families: processedFamilies.map((family) => ({
            ...family,
            pinCode: family.members[0]?.pin_code || "", // Add pinCode from the first member
          })),
          count: count || 0,
        },
        error: null,
        loading: false,
      });
    } catch (error) {
      setResult({
        data: null,
        error: error as Error,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, [page, pageSize, searchQuery]);

  return { ...result, refetch: fetchFamilies };
};

// Hook for adding a new profile
export const useAddProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const addProfile = async (profileData: Partial<Profile>) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Insert the profile data
      const { data, error } = await supabase
        .from("profiles")
        .insert([profileData])
        .select();

      if (error) throw error;

      setSuccess(true);
      return { success: true, data };
    } catch (err) {
      setError(err as Error);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  return { addProfile, loading, error, success };
};


// Add this hook with your other hooks
export const useEvents = () => {
  const [result, setResult] = useState<UseQueryResult<Event[]>>({
    data: null,
    error: null,
    loading: true,
  });

  const fetchEvents = async () => {
    try {
      setResult((prev) => ({ ...prev, loading: true }));
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('start_at', { ascending: true });

      if (error) throw error;

      // Transform events to include proper image URLs
      const eventsWithImages = events.map(event => {
        const { data: imageData } = supabase.storage
          .from('application-docs')
          .getPublicUrl(`${event.image_url}`);

        return {
          ...event,
          image_url: imageData.publicUrl
        };
      });

      console.log("Fetched events:", eventsWithImages);
      setResult({
        data: eventsWithImages,
        error: null,
        loading: false,
      });
    } catch (error) {
      setResult({
        data: null,
        error: error as Error,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return { ...result, refetch: fetchEvents };
};

// Add this hook with your other hooks
export const useDonations = () => {
  const [result, setResult] = useState<UseQueryResult<Donation[]>>({
    data: null,
    error: null,
    loading: true,
  });

  const fetchDonations = async () => {
    try {
      setResult((prev) => ({ ...prev, loading: true }));

      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      // Transform image URLs to include the full path
      const donationsWithFullImageUrls = data?.map(donation => {
        if (donation.image_url) {
          return {
            ...donation,
            image_url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/application-docs/${donation.image_url}`
          };
        }
        return donation;
      });

      setResult({
        data: donationsWithFullImageUrls || [],
        error: null,
        loading: false,
      });
    } catch (error) {
      setResult({
        data: null,
        error: error as Error,
        loading: false,
      });
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  return { ...result, refetch: fetchDonations };
};

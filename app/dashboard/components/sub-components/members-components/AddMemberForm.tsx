"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Member } from "./types";
import { Upload, X } from "lucide-react";
import { useAddProfile } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { Form } from "react-hook-form";

interface AddMemberFormProps {
  currentMember: Member | null;
  onSave: (member: Member) => void;
  onCancel: () => void;
  onFillDummyData: (fillFn: () => void) => void;
}

export function AddMemberForm({ currentMember, onSave, onCancel, onFillDummyData }: AddMemberFormProps) {
  // Add loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form data
  const [formData, setFormData] = useState({
    profile_pic: currentMember ? currentMember.profile_pic : "",
    family_cover_pic: currentMember ? currentMember.family_cover_pic : "",
    name: currentMember ? currentMember.name : "",
    surname: currentMember ? currentMember.surname : "",
    email: currentMember ? currentMember.email : "",
    mobile_no1: currentMember ? currentMember.mobile_no1 : "",
    mobile_no2: currentMember ? currentMember.mobile_no2 : "",
    gender: currentMember ? currentMember.gender : "",
    date_of_birth: currentMember ? currentMember.date_of_birth : "",
    marital_status: currentMember ? currentMember.marital_status : "",
    marriage_date: currentMember ? currentMember.marriage_date : "",
    blood_group: currentMember ? currentMember.blood_group : "",
    residential_address_line1: currentMember ? currentMember.residential_address_line1 : "",
    residential_address_city: currentMember ? currentMember.residential_address_city : "",
    residential_address_state: currentMember ? currentMember.residential_address_state : "",
    pin_code: currentMember ? currentMember.pin_code : "",
    residential_landline: currentMember ? currentMember.residential_landline : "",
    office_address: currentMember ? currentMember.office_address : "",
    office_address_state: currentMember ? currentMember.office_address_state : "",
    office_address_city: currentMember ? currentMember.office_address_city : "",
    office_address_pin: currentMember ? currentMember.office_address_pin : "",
    landline_office: currentMember ? currentMember.landline_office : "",
    family_no: currentMember ? currentMember.family_no : 0,
    fathers_or_husbands_name: currentMember ? currentMember.fathers_or_husbands_name : "",
    father_in_laws_name: currentMember ? currentMember.father_in_laws_name : "",
    relationship: currentMember ? currentMember.relationship : "",
    education: currentMember ? currentMember.education : "",
    stream: currentMember ? currentMember.stream : "",
    qualification: currentMember ? currentMember.qualification : "",
    occupation: currentMember ? currentMember.occupation : "",
    native_place: currentMember ? currentMember.native_place : "",
    date_of_demise: currentMember?.date_of_demise || null,
    updated_at: currentMember ? currentMember.updated_at : new Date().toISOString(),
  });

  // Profile picture state
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>("");

  // Function to fill dummy data
  const fillDummyData = useCallback(() => {
    setFormData({
      name: "John",
      surname: "Doe",
      email: "john.doe@example.com",
      mobile_no1: "9876543210",
      mobile_no2: "9876543211",
      gender: "Male",
      date_of_birth: "1990-01-01",
      marital_status: "Married",
      marriage_date: "2015-06-15",
      blood_group: "O+",
      residential_address_line1: "123 Main Street, Apartment 4B",
      residential_address_city: "Mumbai",
      residential_address_state: "Maharashtra",
      pin_code: "400001",
      residential_landline: "022-28574196",
      office_address: "456 Business Park, 5th Floor",
      office_address_state: "Maharashtra",
      office_address_city: "Mumbai",
      office_address_pin: "400051",
      landline_office: "022-28574197",
      family_no: 101,
      fathers_or_husbands_name: "James Doe",
      father_in_laws_name: "Robert Smith",
      relationship: "Self",
      education: "Bachelor's Degree",
      stream: "Computer Science",
      qualification: "B.Tech",
      occupation: "Software Engineer",
      native_place: "Delhi",
      date_of_demise: null,
      profile_pic: "",
      family_cover_pic: "",
      updated_at: new Date().toISOString(),
    });
  }, []);

  // Register the fillDummyData function with the parent
  useEffect(() => {
    onFillDummyData(fillDummyData);
  }, [onFillDummyData, fillDummyData]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    console.log(formData);
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile picture upload
  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePic(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear profile picture
  const clearProfilePic = () => {
    setProfilePic(null);
    setProfilePicPreview("");
  };

  // Handle date changes
  const handleDateChange = (date: Date | undefined, field: 'date_of_birth' | 'marriage_date' | 'date_of_demise') => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        [field]: date.toISOString().split("T")[0] // Format as YYYY-MM-DD
      }));
    }
  };

  // Create selectable years for dropdowns
  const years = Array.from({ length: 100 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate required fields
    if (!formData.name || !formData.family_no || !formData.gender || !formData.mobile_no1) {
      setError("Please fill in all required fields");
      setIsSubmitting(false);
      return;
    }

    try {
      // Handle profile picture upload if exists
      let profilePicUrl = formData.profile_pic;
      if (profilePic) {
        const fileName = `${formData.name.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;
        const fileExtension = profilePic.name.split(".").pop() || "jpg";
        const filePath = `${fileName}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("profile-pictures")
          .upload(filePath, profilePic);

        if (uploadError) throw uploadError;

        // Get the public URL of the uploaded image
        const { data: { publicUrl } } = supabase.storage
          .from("profile-pictures")
          .getPublicUrl(filePath);

        profilePicUrl = publicUrl;
      }

      // Prepare member data with updated profile picture
      const memberData = {
        ...formData,
        profile_pic: profilePicUrl
      };

      console.log("Final member data to save:", memberData);

      // Save member data using the onSave prop
      onSave(memberData as Member);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      {/* Profile Picture */}
      <div className="flex flex-col items-center gap-4 mb-4">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profilePicPreview || formData.profile_pic} />
            <AvatarFallback className="text-lg">
              {formData.name.charAt(0)}{formData.surname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {(profilePicPreview || formData.profile_pic) && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground"
              onClick={clearProfilePic}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="profile-pic" className="cursor-pointer bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-primary/90">
            <Upload className="h-4 w-4" />
            Upload Photo
          </Label>
          <Input
            id="profile-pic"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleProfilePicChange}
          />
        </div>
      </div>

      {/* Personal Information */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Personal Information</h3>
        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="family_no">Family Number</Label>
            <Input
              id="family_no"
              name="family_no"
              type="number"
              value={formData.family_no}
              onChange={handleInputChange}
              placeholder="Family number"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">First Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="First name"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="surname">Surname</Label>
            <Input
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              placeholder="Surname"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Family Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fathers_or_husbands_name">Father's/Husband's Name</Label>
            <Input
              id="fathers_or_husbands_name"
              name="fathers_or_husbands_name"
              value={formData.fathers_or_husbands_name}
              onChange={handleInputChange}
              placeholder="Father's or husband's name"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="father_in_laws_name">Father-in-law's Name</Label>
            <Input
              id="father_in_laws_name"
              name="father_in_laws_name"
              value={formData.father_in_laws_name}
              onChange={handleInputChange}
              placeholder="Father-in-law's name"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Personal Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleSelectChange("gender", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="relationship">Relationship</Label>
            <Input
              id="relationship"
              name="relationship"
              value={formData.relationship}
              onChange={handleInputChange}
              placeholder="Relationship"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="native_place">Native Place</Label>
            <Input
              id="native_place"
              name="native_place"
              value={formData.native_place}
              onChange={handleInputChange}
              placeholder="Native place"
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isSubmitting}
                >
                  {formData.date_of_birth || "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date_of_birth ? new Date(formData.date_of_birth) : undefined}
                  onSelect={(date) => handleDateChange(date, "date_of_birth")}
                  disabled={isSubmitting}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="marriage_date">Marriage Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isSubmitting}
                >
                  {formData.marriage_date || "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.marriage_date ? new Date(formData.marriage_date) : undefined}
                  onSelect={(date) => handleDateChange(date, "marriage_date")}
                  disabled={isSubmitting}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Status and Blood Group */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="marital_status">Marital Status</Label>
            <Select
              value={formData.marital_status}
              onValueChange={(value) => handleSelectChange("marital_status", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unmarried">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="Divorcee">Divorced</SelectItem>
                <SelectItem value="Widow">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="blood_group">Blood Group</Label>
            <Select
              value={formData.blood_group}
              onValueChange={(value) => handleSelectChange("blood_group", value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select blood group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Educational Information */}
      <div className="space-y-2 mt-4">
        <h3 className="text-sm font-medium">Educational Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="education">Education</Label>
            <Input
              id="education"
              name="education"
              value={formData.education}
              onChange={handleInputChange}
              placeholder="Education"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stream">Stream</Label>
            <Input
              id="stream"
              name="stream"
              value={formData.stream}
              onChange={handleInputChange}
              placeholder="Stream"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualification">Qualification</Label>
            <Input
              id="qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleInputChange}
              placeholder="Qualification"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <Label htmlFor="occupation">Occupation</Label>
          <Input
            id="occupation"
            name="occupation"
            value={formData.occupation}
            onChange={handleInputChange}
            placeholder="Occupation"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mt-4">
        <h3 className="text-sm font-medium">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email address"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="residential_landline">Residential Landline</Label>
            <Input
              id="residential_landline"
              name="residential_landline"
              value={formData.residential_landline}
              onChange={handleInputChange}
              placeholder="Residential landline"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="mobile_no1">Mobile Number 1</Label>
            <Input
              id="mobile_no1"
              name="mobile_no1"
              value={formData.mobile_no1}
              onChange={handleInputChange}
              placeholder="Primary mobile number"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile_no2">Mobile Number 2</Label>
            <Input
              id="mobile_no2"
              name="mobile_no2"
              value={formData.mobile_no2}
              onChange={handleInputChange}
              placeholder="Secondary mobile number"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <div className="space-y-2 mt-4">
          <Label htmlFor="landline_office">Office Landline</Label>
          <Input
            id="landline_office"
            name="landline_office"
            value={formData.landline_office}
            onChange={handleInputChange}
            placeholder="Office landline"
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Residential Address */}
      <div className="space-y-2 mt-4">
        <h3 className="text-sm font-medium">Residential Address</h3>
        <div className="space-y-2">
          <Label htmlFor="residential_address_line1">Address</Label>
          <Textarea
            id="residential_address_line1"
            name="residential_address_line1"
            value={formData.residential_address_line1}
            onChange={handleInputChange}
            placeholder="Street address"
            rows={2}
            disabled={isSubmitting}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="residential_address_city">City</Label>
            <Input
              id="residential_address_city"
              name="residential_address_city"
              value={formData.residential_address_city}
              onChange={handleInputChange}
              placeholder="City"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="residential_address_state">State</Label>
            <Input
              id="residential_address_state"
              name="residential_address_state"
              value={formData.residential_address_state}
              onChange={handleInputChange}
              placeholder="State"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pin_code">PIN Code</Label>
            <Input
              id="pin_code"
              name="pin_code"
              value={formData.pin_code}
              onChange={handleInputChange}
              placeholder="PIN code"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Office Address */}
      <div className="space-y-2 mt-4">
        <h3 className="text-sm font-medium">Office Address</h3>
        <div className="space-y-2">
          <Label htmlFor="office_address">Address</Label>
          <Textarea
            id="office_address"
            name="office_address"
            value={formData.office_address}
            onChange={handleInputChange}
            placeholder="Office address"
            rows={2}
            disabled={isSubmitting}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="office_address_city">City</Label>
            <Input
              id="office_address_city"
              name="office_address_city"
              value={formData.office_address_city}
              onChange={handleInputChange}
              placeholder="City"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="office_address_state">State</Label>
            <Input
              id="office_address_state"
              name="office_address_state"
              value={formData.office_address_state}
              onChange={handleInputChange}
              placeholder="State"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="office_address_pin">PIN Code</Label>
            <Input
              id="office_address_pin"
              name="office_address_pin"
              value={formData.office_address_pin}
              onChange={handleInputChange}
              placeholder="PIN code"
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-2 mt-4">
        <h3 className="text-sm font-medium">Additional Information</h3>
        <div className="space-y-2">
          <Label htmlFor="date_of_demise">Date of Demise (if applicable)</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                disabled={isSubmitting}
              >
                {formData.date_of_demise || "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.date_of_demise ? new Date(formData.date_of_demise) : undefined}
                onSelect={(date) => handleDateChange(date, "date_of_demise")}
                disabled={isSubmitting}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 justify-end mt-6">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : currentMember ? 'Update Member' : 'Add Member'}
        </Button>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mt-4">
          {error}
        </div>
      )}
    </form>
  );
}
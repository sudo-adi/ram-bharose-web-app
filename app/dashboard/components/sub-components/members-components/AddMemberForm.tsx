import { useState } from "react";
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

interface AddMemberFormProps {
  currentMember: Member | null;
  onSave: (member: Member) => void;
  onCancel: () => void;
}

export function AddMemberForm({ currentMember, onSave, onCancel }: AddMemberFormProps) {
  // Initialize form data
  const [formData, setFormData] = useState({
    name: currentMember ? currentMember.name.split(" ")[0] : "",
    surname: currentMember ? currentMember.name.split(" ").slice(1).join(" ") : "",
    email: currentMember ? currentMember.email : "",
    mobile_no1: currentMember ? currentMember.phone : "",
    gender: "",
    date_of_birth: "",
    marital_status: "",
    blood_group: "",
    residential_address_line1: "",
    residential_address_city: "",
    residential_address_state: "",
    pin_code: "",
  });

  // Profile picture state
  const [profilePic, setProfilePic] = useState<File | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string>("");

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date changes
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date_of_birth: date.toISOString().split("T")[0], // Format as YYYY-MM-DD
      }));
    }
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

  // Handle form submission
  const handleSubmit = () => {
    // Create member object from form data
    const member: Member = {
      id: currentMember ? currentMember.id : Date.now().toString(),
      name: `${formData.name} ${formData.surname}`.trim(),
      email: formData.email,
      phone: formData.mobile_no1,
      joinDate: formData.date_of_birth,
      // Additional fields would be included in the actual API call
      // but aren't shown in the Member interface
    };
    
    onSave(member);
  };

  return (
    <div className="grid gap-4 py-4">
      {/* Profile Picture */}
      <div className="flex flex-col items-center gap-4 mb-4">
        <div className="relative">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profilePicPreview} />
            <AvatarFallback className="text-lg">
              {formData.name.charAt(0)}{formData.surname.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {profilePicPreview && (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">First Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="First name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="surname">Last Name</Label>
            <Input
              id="surname"
              name="surname"
              value={formData.surname}
              onChange={handleInputChange}
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleSelectChange("gender", value)}
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
            <Label htmlFor="date_of_birth">Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  {formData.date_of_birth || "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="marital_status">Marital Status</Label>
            <Select
              value={formData.marital_status}
              onValueChange={(value) =>
                handleSelectChange("marital_status", value)
              }
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
              onValueChange={(value) =>
                handleSelectChange("blood_group", value)
              }
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mobile_no1">Phone</Label>
            <Input
              id="mobile_no1"
              name="mobile_no1"
              value={formData.mobile_no1}
              onChange={handleInputChange}
              placeholder="Phone number"
            />
          </div>
        </div>
      </div>

      {/* Address Information */}
      <div className="space-y-2 mt-4">
        <h3 className="text-sm font-medium">Address Information</h3>
        <div className="space-y-2">
          <Label htmlFor="residential_address_line1">Address</Label>
          <Textarea
            id="residential_address_line1"
            name="residential_address_line1"
            value={formData.residential_address_line1}
            onChange={handleInputChange}
            placeholder="Street address"
            rows={2}
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
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {currentMember ? "Update" : "Add"} Member
        </Button>
      </div>
    </div>
  );
}
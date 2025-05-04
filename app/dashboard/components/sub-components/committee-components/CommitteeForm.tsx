"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Image as ImageIcon, Upload } from "lucide-react";
import { CommitteeFormData, CommitteeWithMembers } from "./types";
import { supabase } from "@/lib/supabase";

type CommitteeFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isEditing: boolean;
  committee: CommitteeWithMembers | null;
  formData: CommitteeFormData;
  setFormData: (data: CommitteeFormData) => void;
  formError: string | null;
  setFormError: (error: string | null) => void;
  formLoading: boolean;
  setFormLoading: (loading: boolean) => void;
  onAddCommittee: (
    data: CommitteeFormData
  ) => Promise<{ success: boolean; error: Error | null }>;
  onUpdateCommittee: (
    committeeId: number,
    data: Partial<any>
  ) => Promise<{ success: boolean; error: Error | null }>;
  onRefresh: () => void;
};

export function CommitteeForm({
  isOpen,
  setIsOpen,
  isEditing,
  committee,
  formData,
  setFormData,
  formError,
  setFormError,
  formLoading,
  setFormLoading,
  onAddCommittee,
  onUpdateCommittee,
  onRefresh,
}: CommitteeFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setFileName(file.name);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadCommitteeImage = async (file: File, committeeName: string) => {
    try {
      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      // Convert ArrayBuffer to Uint8Array for Supabase storage
      const uint8Array = new Uint8Array(arrayBuffer);

      const fileExtension = file.name.split(".").pop() || "jpg";
      const filePath = `${committeeName
        .toLowerCase()
        .replace(/\s+/g, "-")}.${fileExtension}`;
      const contentType = file.type;

      const { data, error } = await supabase.storage
        .from("committee-pictures")
        .upload(filePath, uint8Array, { contentType, upsert: true });

      if (error) {
        console.error(error);
        throw error;
      }
      return data.path;
    } catch (error: any) {
      throw new Error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate form
    if (!formData.name || !formData.member_name || !formData.phone) {
      setFormError("Committee name, member name, and phone are required");
      return;
    }

    try {
      setFormLoading(true);

      // Upload image if provided
      if (formData.image) {
        // Just upload the image to storage, don't try to save path to database
        await uploadCommitteeImage(formData.image, formData.name);
      }

      if (isEditing && committee) {
        // Update existing committee - don't include image
        const result = await onUpdateCommittee(committee.id, {
          name: formData.name,
          location: formData.location,
          member_name: formData.member_name,
          phone: formData.phone,
        });

        if (!result.success) throw result.error;
      } else {
        // Add new committee - don't include image
        // Create a new object without the image property
        const committeeDataToSave = {
          name: formData.name,
          location: formData.location,
          member_name: formData.member_name,
          phone: formData.phone,
        };

        const result = await onAddCommittee(committeeDataToSave);
        if (!result.success) throw result.error;
      }

      // Reset form and close dialog
      setFormData({
        name: "",
        location: "",
        member_name: "",
        phone: "",
        image: undefined, // Make sure to reset the image property
      });
      setImagePreview(null);
      setFileName("");
      setIsOpen(false);
      onRefresh();
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Committee" : "Create New Committee"}
          </DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="bg-red-50 text-red-500 p-2 rounded text-sm mb-3">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Committee Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter committee name"
              disabled={formLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="Enter location"
              disabled={formLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="member_name">
              {isEditing ? "Head Member Name" : "First Member Name"}
            </Label>
            <Input
              id="member_name"
              name="member_name"
              value={formData.member_name}
              onChange={handleInputChange}
              placeholder="Enter member name"
              disabled={formLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              disabled={formLoading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Committee Image</Label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
                disabled={formLoading}
              />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-center gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={formLoading}
                >
                  <Upload className="h-4 w-4" />
                  {fileName ? "Change Image" : "Upload Image"}
                </Button>
                {fileName && (
                  <span className="text-xs text-gray-500 truncate max-w-[150px]">
                    {fileName}
                  </span>
                )}
              </div>
              {imagePreview && (
                <div className="mt-2 relative h-32 w-full rounded-md overflow-hidden border border-gray-200">
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${imagePreview})` }}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading
                ? "Saving..."
                : isEditing
                ? "Update Committee"
                : "Create Committee"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

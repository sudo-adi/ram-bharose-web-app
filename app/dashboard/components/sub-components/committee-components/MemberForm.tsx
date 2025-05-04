"use client";

import { useState } from "react";
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
import { MemberFormData, CommitteeWithMembers } from "./types";

type MemberFormProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  committee: CommitteeWithMembers | null;
  formData: MemberFormData;
  setFormData: (data: MemberFormData) => void;
  formError: string | null;
  setFormError: (error: string | null) => void;
  formLoading: boolean;
  setFormLoading: (loading: boolean) => void;
  onAddMember: (
    data: MemberFormData
  ) => Promise<{ success: boolean; error: Error | null }>;
  onRefresh: () => void;
};

export function MemberForm({
  isOpen,
  setIsOpen,
  committee,
  formData,
  setFormData,
  formError,
  setFormError,
  formLoading,
  setFormLoading,
  onAddMember,
  onRefresh,
}: MemberFormProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate form
    if (!formData.member_name || !formData.phone) {
      setFormError("Member name and phone are required");
      return;
    }

    try {
      setFormLoading(true);

      const result = await onAddMember(formData);
      if (!result.success) throw result.error;

      // Reset form and close dialog
      setFormData({
        member_name: "",
        phone: "",
        committee_name: committee?.name || "",
        name: "", // Add the missing 'name' property
      });
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
          <DialogTitle>Add Member to {committee?.name}</DialogTitle>
        </DialogHeader>

        {formError && (
          <div className="bg-red-50 text-red-500 p-2 rounded text-sm mb-3">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="member_name">Member Name</Label>
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
              {formLoading ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

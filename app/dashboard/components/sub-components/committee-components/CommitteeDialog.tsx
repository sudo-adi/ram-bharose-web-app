"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, Phone, MessageSquare, UserMinus } from "lucide-react";
import { CommitteeWithMembers } from "./types";

type CommitteeDialogProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  committee: CommitteeWithMembers | null;
  onEditCommittee: (committee: CommitteeWithMembers) => void;
  onDeleteCommittee: (
    committeeId: number
  ) => Promise<{ success: boolean; error: Error | null }>;
  onRefresh: () => void;
};

export function CommitteeDialog({
  isOpen,
  setIsOpen,
  committee,
  onEditCommittee,
  onDeleteCommittee,
  onRefresh,
}: CommitteeDialogProps) {
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    const formattedNumber = phoneNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${formattedNumber}`);
  };

  const handleDeleteCommittee = async (committeeId: number) => {
    try {
      setFormLoading(true);
      const result = await onDeleteCommittee(committeeId);

      if (!result.success) throw result.error;

      onRefresh();

      // Close the modal
      setIsOpen(false);
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleRemoveMember = async (committeeId: number, memberId: string) => {
    try {
      setFormLoading(true);
      const { error } = await supabase
        .from("committee")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      onRefresh();

      // Close the modal if all members are removed
      if (committee?.members.length === 1) {
        setIsOpen(false);
      }
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };

  if (!committee) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={committee.image}
                alt={committee.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-lg font-bold text-gray-800">
                {committee.name}
              </DialogTitle>
              <p className="text-sm text-gray-500">
                {committee.totalMembers} members
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-orange-500 hover:bg-orange-50 border-gray-200"
                onClick={() => onEditCommittee(committee)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 border-gray-200"
                onClick={() => handleDeleteCommittee(committee.id)}
                disabled={formLoading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {formError && (
          <div className="bg-red-50 text-red-500 p-2 rounded text-sm mb-3">
            {formError}
          </div>
        )}

        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3">
          {committee.members.map((member) => (
            <div
              key={member.id}
              className="flex items-center p-3 rounded-lg border border-gray-100"
            >
              <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-800 truncate">
                  {member.name}
                </h4>
                <div className="flex items-center mt-0.5">
                  <span className="text-xs text-gray-500 truncate">
                    {member.phone}
                  </span>
                  {member.position && (
                    <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px]">
                      {member.position}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => handleCall(member.phone)}
                >
                  <Phone className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-green-500 hover:bg-green-50 hover:text-green-600"
                  onClick={() => handleWhatsApp(member.phone)}
                >
                  <MessageSquare className="h-4 w-4" />
                </Button>
                {committee.members.length > 1 && member.position !== "Head" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleRemoveMember(committee.id, member.id)}
                    disabled={formLoading}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

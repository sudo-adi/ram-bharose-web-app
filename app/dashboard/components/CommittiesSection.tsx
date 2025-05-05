"use client";

import { useState, useEffect } from "react";
import { useCommittees, useCommitteeImages } from "@/hooks/useSupabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, X, RefreshCw, Plus } from "lucide-react";
import {
  CommitteeFormData,
  CommitteeWithMembers,
  MemberFormData,
} from "./sub-components/committee-components/types";
import { CommitteeDialog } from "./sub-components/committee-components/CommitteeDialog";
import { CommitteeList } from "./sub-components/committee-components/CommitteeList";
// Add this import at the top with your other imports
import { CommitteeForm } from "./sub-components/committee-components/CommitteeForm";
import { MemberForm } from "./sub-components/committee-components/MemberForm";

export default function CommittiesSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addMemberModalOpen, setAddMemberModalOpen] = useState(false);
  const [selectedCommittee, setSelectedCommittee] =
    useState<CommitteeWithMembers | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCommittees, setFilteredCommittees] = useState<
    CommitteeWithMembers[]
  >([]);
  const [processedCommittees, setProcessedCommittees] = useState<
    CommitteeWithMembers[]
  >([]);
  const [formData, setFormData] = useState<CommitteeFormData>({
    name: "",
    location: "",
    member_name: "",
    phone: "",
  });
  const [memberFormData, setMemberFormData] = useState<MemberFormData>({
    member_name: "",
    phone: "",
    committee_name: "",
    name: "", // Add this line
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const {
    data: committeesData,
    loading: committeesLoading,
    error: committeesError,
    refetch: refetchCommittees,
    addCommittee,
    updateCommittee,
    deleteCommittee,
    addCommitteeMember, // Add this
  } = useCommittees();

  // Then update your handleAddMemberSubmit function
  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedCommittee) return;

    // Validate form
    if (!memberFormData.member_name || !memberFormData.phone) {
      setFormError("Member name and phone are required");
      return;
    }

    try {
      setFormLoading(true);

      const result = await addCommitteeMember({
        committee_name: selectedCommittee.name,
        member_name: memberFormData.member_name,
        phone: memberFormData.phone,
        location: "", // You might want to add this
      });

      if (!result.success) throw result.error;

      // Reset and close
      setMemberFormData({
        member_name: "",
        phone: "",
        committee_name: "",
        name: "", // Add this line
      });
      setAddMemberModalOpen(false);
    } catch (error: any) {
      setFormError(error.message);
    } finally {
      setFormLoading(false);
    }
  };
  const {
    data: committeeImages,
    loading: imagesLoading,
    error: imagesError,
    refetch: refetchImages,
  } = useCommitteeImages();

  useEffect(() => {
    if (committeesData && committeeImages) {
      const committeeGroups: Record<string, any[]> = {};

      committeesData.forEach((committee) => {
        if (!committeeGroups[committee.name]) {
          committeeGroups[committee.name] = [];
        }
        committeeGroups[committee.name].push(committee);
      });

      const processed = Object.entries(committeeGroups).map(
        ([name, members]) => {
          const imageFile = committeeImages.find(
            (img) =>
              img.name.toLowerCase().replace(/\.[^/.]+$/, "") ===
              name.toLowerCase().trim()
          );

          const membersList = members.map((member, index) => ({
            id: `${member.id}`,
            name: member.member_name,
            phone: member.phone,
            image:
              "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg",
            position: index === 0 ? "Head" : "Member",
          }));

          return {
            id: members[0].id,
            name: name,
            image:
              imageFile?.url ||
              "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=300",
            totalMembers: members.length,
            members: membersList,
          };
        }
      );

      setProcessedCommittees(processed);
    }
  }, [committeesData, committeeImages]);

  useEffect(() => {
    if (processedCommittees.length > 0) {
      const filtered = processedCommittees.filter((committee) =>
        committee.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCommittees(filtered);
    }
  }, [searchQuery, processedCommittees]);

  const handleCommitteePress = (committee: CommitteeWithMembers) => {
    setSelectedCommittee(committee);
    setModalOpen(true);
  };

  const handleEditCommittee = (committee: CommitteeWithMembers) => {
    setSelectedCommittee(committee);
    setFormData({
      name: committee.name,
      location: "",
      member_name: committee.members[0]?.name || "",
      phone: committee.members[0]?.phone || "",
    });
    setEditModalOpen(true);
  };

  const handleAddMember = (committee: CommitteeWithMembers) => {
    setSelectedCommittee(committee);
    setMemberFormData({
      member_name: "",
      phone: "",
      committee_name: committee.name,
      name: committee.name, // Add this line
    });
    setAddMemberModalOpen(true);
  };

  const handleRefresh = () => {
    refetchCommittees();
    refetchImages();
  };

  if (committeesLoading || imagesLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 bg-white rounded-lg">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-sm text-gray-500 font-medium">
              Loading committees...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (committeesError || imagesError) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 bg-white rounded-lg">
        <div className="flex justify-center items-center h-64">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription className="space-y-4">
              <p>
                {committeesError?.message ||
                  imagesError?.message ||
                  "Error loading committees"}
              </p>
              <Button
                variant="outline"
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
                onClick={handleRefresh}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Committees</h2>
            <p className="text-sm text-gray-500">
              Explore our various committees and their members
            </p>
          </div>

          <div className="flex gap-2 mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateModalOpen(true)}
              className="border-gray-200 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs">New Committee</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={committeesLoading || imagesLoading}
              className="border-gray-200 hover:bg-gray-50 hover:text-orange-600"
            >
              {committeesLoading || imagesLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Refreshing</span>
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-xs">Refresh</span>
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <Input
            type="text"
            placeholder="Search committees..."
            className="pl-10 bg-white border-gray-200 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-700"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Committee List Component */}
        <CommitteeList
          committees={filteredCommittees}
          onViewCommittee={handleCommitteePress}
          onEditCommittee={handleEditCommittee}
          onAddMember={handleAddMember}
          searchQuery={searchQuery}
        />
      </div>

      {/* Committee Dialog Component */}
      <CommitteeDialog
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
        committee={selectedCommittee}
        onEditCommittee={handleEditCommittee}
        onDeleteCommittee={deleteCommittee}
        onRefresh={() => {
          refetchCommittees();
          refetchImages();
        }}
        onAddMember={handleAddMember} // Add this line
      />

      {/* Committee Form Component */}
      <CommitteeForm
        isOpen={createModalOpen || editModalOpen}
        setIsOpen={createModalOpen ? setCreateModalOpen : setEditModalOpen}
        isEditing={editModalOpen}
        committee={selectedCommittee}
        formData={formData}
        setFormData={setFormData}
        formError={formError}
        setFormError={setFormError}
        formLoading={formLoading}
        setFormLoading={setFormLoading}
        onAddCommittee={addCommittee}
        onUpdateCommittee={updateCommittee}
        onRefresh={() => {
          refetchCommittees();
          refetchImages();
        }}
      />

      {/* Member Form Component */}
      <MemberForm
        isOpen={addMemberModalOpen}
        setIsOpen={setAddMemberModalOpen}
        committee={selectedCommittee}
        formData={memberFormData}
        setFormData={setMemberFormData}
        formError={formError}
        setFormError={setFormError}
        formLoading={formLoading}
        setFormLoading={setFormLoading}
        onAddMember={addCommitteeMember}
        onRefresh={() => {
          refetchCommittees();
          refetchImages();
        }}
      />
    </>
  );
}

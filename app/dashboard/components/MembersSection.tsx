"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useProfiles, useMemberOperations } from '@/hooks/useSupabase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Import sub-components
import { MembersTable } from "./sub-components/members-components/MembersTable";
import { MembersSearchBar } from "./sub-components/members-components/MembersSearchBar";
import { MembersFilter } from "./sub-components/members-components/MembersFilter";
import { MembersPagination } from "./sub-components/members-components/MembersPagination";
import {
  Member,
  SortDirection,
  SortField,
  FilterOption,
} from "./sub-components/members-components/types";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

// Import the new AddMemberForm component
import { AddMemberForm } from "./sub-components/members-components/AddMemberForm";

export function MembersSection() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Search state
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [filterCount, setFilterCount] = useState(0);

  // Define available filters
  const filterOptions: FilterOption[] = [
    {
      id: "gender",
      label: "Gender",
      type: "select",
      field: "gender",
      options: [
        { value: "Male", label: "Male" },
        { value: "Female", label: "Female" },
        { value: "Other", label: "Other" },
      ],
    },
    {
      id: "marital_status",
      label: "Marital Status",
      type: "select",
      field: "marital_status",
      options: [
        { value: "Unmarried", label: "Single" },
        { value: "Married", label: "Married" },
        { value: "Divorcee", label: "Divorced" },
        { value: "Widow", label: "Widowed" },
      ],
    },
    {
      id: "blood_group",
      label: "Blood Group",
      type: "select",
      field: "blood_group",
      options: [
        { value: "A+", label: "A+" },
        { value: "A-", label: "A-" },
        { value: "B+", label: "B+" },
        { value: "B-", label: "B-" },
        { value: "AB+", label: "AB+" },
        { value: "AB-", label: "AB-" },
        { value: "O+", label: "O+" },
        { value: "O-", label: "O-" },
      ],
    },
    {
      id: "city",
      label: "City",
      type: "text",
      field: "city",
    },
    {
      id: "state",
      label: "State",
      type: "text",
      field: "state",
    },
    {
      id: "date_of_birth",
      label: "Date of Birth",
      type: "date",
      field: "date_of_birth",
    },
  ];

  // Fetch profiles and initialize member operations
  const {
    data: profilesResult,
    loading,
    error,
    refetch,
  } = useProfiles(currentPage, pageSize, debouncedSearch, activeFilters);

  const { saveMember: saveToSupabase, deleteMember: deleteFromSupabase, loading: memberOpLoading } = useMemberOperations();

  // State for members data
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Form data state
  const [formData, setFormData] = useState<Member>({
    id: "",
    family_no: 0,
    name: "",
    surname: "",
    fathers_or_husbands_name: "",
    father_in_laws_name: "",
    gender: "",
    relationship: "",
    marital_status: "",
    marriage_date: "",
    date_of_birth: "",
    education: "",
    stream: "",
    qualification: "",
    occupation: "",
    email: "",
    profile_pic: "",
    family_cover_pic: "",
    blood_group: "",
    native_place: "",
    residential_address_line1: "",
    residential_address_state: "",
    residential_address_city: "",
    pin_code: "",
    residential_landline: "",
    office_address: "",
    office_address_state: "",
    office_address_city: "",
    office_address_pin: "",
    landline_office: "",
    mobile_no1: "",
    mobile_no2: "",
    date_of_demise: "",
    updated_at: new Date().toISOString()
  });

  // Selection and sorting state
  const [selected, setSelected] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [openDialog, setOpenDialog] = useState<"view" | "edit" | "add" | null>(
    null
  );
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  // Add reference to form fill function
  const [fillFormData, setFillFormData] = useState<(() => void) | null>(null);

  // Handler for fill dummy data button
  const handleFillDummyData = useCallback((fillFn: () => void) => {
    setFillFormData(() => fillFn);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Update filter count
  useEffect(() => {
    setFilterCount(Object.keys(activeFilters).length);
  }, [activeFilters]);

  // Convert profiles to members format when data is loaded
  useEffect(() => {
    if (profilesResult?.data) {
      const formattedMembers: Member[] = profilesResult.data.map((profile) => ({
        id: profile.id.toString(),
        family_no: typeof profile.family_no === 'number' ? profile.family_no :
          typeof profile.family_no === 'string' ? parseInt(profile.family_no, 10) : 0,
        name: profile.name || "",
        surname: profile.surname || "",
        fathers_or_husbands_name: profile.fathers_or_husbands_name || "",
        father_in_laws_name: profile.father_in_laws_name || "",
        gender: profile.gender || "",
        relationship: profile.relationship || "",
        marital_status: profile.marital_status || "",
        marriage_date: profile.marriage_date || "",
        date_of_birth: profile.date_of_birth || "",
        education: profile.education || "",
        stream: profile.stream || "",
        qualification: profile.qualification || "",
        occupation: profile.occupation || "",
        email: profile.email || "",
        profile_pic: profile.profile_pic || "",
        family_cover_pic: profile.family_cover_pic || "",
        blood_group: profile.blood_group || "",
        native_place: profile.native_place || "",
        residential_address_line1: profile.residential_address_line1 || "",
        residential_address_state: profile.residential_address_state || "",
        residential_address_city: profile.residential_address_city || "",
        pin_code: profile.pin_code || "",
        residential_landline: profile.residential_landline || "",
        office_address: profile.office_address || "",
        office_address_state: profile.office_address_state || "",
        office_address_city: profile.office_address_city || "",
        office_address_pin: profile.office_address_pin || "",
        landline_office: profile.landline_office || "",
        mobile_no1: profile.mobile_no1 || "",
        mobile_no2: profile.mobile_no2 || "",
        date_of_demise: profile.date_of_demise || "",
        updated_at: new Date().toISOString()
      }));

      setMembers(formattedMembers);
      setTotalCount(profilesResult.count || 0);
    }
  }, [profilesResult]);



  // Apply a filter
  const applyFilter = (filterId: string, value: any) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };

      if (
        value === undefined ||
        value === null ||
        value === "" ||
        value === "all"
      ) {
        // Remove the filter if value is empty or 'all'
        delete newFilters[filterId];
      } else {
        // Add or update the filter
        newFilters[filterId] = value;
      }

      return newFilters;
    });

    // Reset to first page when filters change
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters({});
    setCurrentPage(1);
  };

  // Clear a specific filter
  const clearFilter = (filterId: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[filterId];
      return newFilters;
    });
  };

  // Sorting function
  const handleSort = (field: keyof Member) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection("asc");
    } else {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    }
  };

  // Get sort icon for column header
  const getSortIcon = (field: keyof Member) => {
    if (sortField !== field) return <ChevronsUpDown className="ml-1 h-4 w-4" />;
    if (sortDirection === "asc") return <ChevronUp className="ml-1 h-4 w-4" />;
    return <ChevronDown className="ml-1 h-4 w-4" />;
  };

  // Toggle select all
  const toggleSelectAll = () => {
    setSelected((prev) =>
      prev.length === members.length ? [] : members.map((m) => m.id)
    );
  };

  // Toggle single select
  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Delete selected members
  const deleteSelected = async () => {
    try {
      await Promise.all(selected.map(id => deleteFromSupabase(Number(id))));
      setMembers((prev) => prev.filter((m) => !selected.includes(m.id)));
      setSelected([]);
      setOpenDeleteDialog(false);
      alert('Selected members deleted successfully');
      refetch();
    } catch (err) {
      console.error('Error deleting members:', err);
      alert('Failed to delete some or all members. Please try again.');
    }
  };

  // Delete single member
  const deleteMember = async (id: string) => {
    try {
      await deleteFromSupabase(Number(id));
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setOpenDeleteDialog(false);
      alert('Member deleted successfully');
      refetch();
    } catch (err) {
      console.error('Error deleting member:', err);
      alert('Failed to delete member. Please try again.');
    }
  };  // Save member (add or edit)
  const saveMember = async (member: Member) => {
    try {
      const data = await saveToSupabase(member, !!currentMember);

      // Update local state
      if (currentMember) {
        setMembers(prev => prev.map(m => m.id === data.id ? data : m));
      } else {
        setMembers(prev => [...prev, data]);
      }

      // Close dialog and reset current member
      setOpenDialog(null);
      setCurrentMember(null);

      // Refetch the data to ensure we have latest state
      refetch();

      alert(currentMember ? 'Member updated successfully' : 'Member added successfully');
    } catch (error) {
      console.error('Error saving member:', error);
      alert('Failed to save member. Please try again.');
    }
  };

  // Sort members client-side
  const sortedMembers = [...members].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField] ?? "";
    const bValue = b[sortField] ?? "";

    return (sortDirection === "asc" ? 1 : -1) *
      (aValue < bValue ? -1 : aValue > bValue ? 1 : 0);
  });

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / pageSize);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // View, edit, and delete handlers
  const handleViewMember = (member: Member) => {
    setCurrentMember(member);
    setOpenDialog("view");
  };

  const handleEditMember = (member: Member) => {
    setCurrentMember(member);
    setOpenDialog("edit");
  };

  const handleDeleteMember = (id: string) => {
    const member = members.find((m) => m.id === id);
    if (member) {
      setCurrentMember(member);
      setOpenDeleteDialog(true);
    }
  };

  // Open add dialog
  const openAddDialog = () => {
    setCurrentMember(null);
    setOpenDialog("add");
  };

  // Show loading state
  if (loading) {
    return <div className="p-4 text-center">Loading members data...</div>;
  }

  // Show error state
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error loading members: {error.message}
        <Button onClick={refetch} className="ml-2">
          Retry
        </Button>
      </div>
    );
  }

  // Create the dialog content section
  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <MembersSearchBar
        search={search}
        setSearch={setSearch}
        selected={selected}
        openDeleteDialog={() => setOpenDeleteDialog(true)}
        openAddDialog={openAddDialog}
      />

      {/* Filters */}
      <MembersFilter
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        filterCount={filterCount}
        activeFilters={activeFilters}
        filterOptions={filterOptions}
        applyFilter={applyFilter}
        clearAllFilters={clearAllFilters}
        clearFilter={clearFilter}
      />

      {/* Members Table */}
      <MembersTable
        members={sortedMembers}
        selected={selected}
        sortField={sortField}
        sortDirection={sortDirection}
        toggleSelectAll={toggleSelectAll}
        toggleSelect={toggleSelect}
        handleSort={handleSort}
        getSortIcon={getSortIcon}
        onView={handleViewMember}
        onEdit={handleEditMember}
        onDelete={handleDeleteMember}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <MembersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
        />
      )}

      {/* View Member Dialog */}
      <Dialog
        open={openDialog === "view"}
        onOpenChange={(open) => {
          if (!open) setOpenDialog(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {currentMember && (
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Name
                </h4>
                <p>{currentMember.name} {currentMember.surname}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Family Number
                </h4>
                <p>{currentMember.family_no}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Contact Information
                </h4>
                <p>Email: {currentMember.email}</p>
                <p>Mobile: {currentMember.mobile_no1}</p>
                {currentMember.mobile_no2 && <p>Alternate Mobile: {currentMember.mobile_no2}</p>}
                {currentMember.residential_landline && <p>Residential: {currentMember.residential_landline}</p>}
                {currentMember.landline_office && <p>Office: {currentMember.landline_office}</p>}
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Personal Information
                </h4>
                <p>Gender: {currentMember.gender}</p>
                <p>Date of Birth: {currentMember.date_of_birth}</p>
                <p>Blood Group: {currentMember.blood_group}</p>
                <p>Marital Status: {currentMember.marital_status}</p>
                {currentMember.marriage_date && <p>Marriage Date: {currentMember.marriage_date}</p>}
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Educational & Professional Information
                </h4>
                {currentMember.education && <p>Education: {currentMember.education}</p>}
                {currentMember.stream && <p>Stream: {currentMember.stream}</p>}
                {currentMember.qualification && <p>Qualification: {currentMember.qualification}</p>}
                {currentMember.occupation && <p>Occupation: {currentMember.occupation}</p>}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpenDialog("edit");
              }}
            >
              Edit
            </Button>
            <Button onClick={() => setOpenDialog(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Member Dialog */}
      <Dialog
        open={openDialog === "edit" || openDialog === "add"}
        onOpenChange={(open) => {
          if (!open) setOpenDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px] h-[90vh] flex flex-col p-0">
          <div className="p-6 pb-4 border-b">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle>
                    {currentMember ? "Edit Member" : "Add New Member"}
                  </DialogTitle>
                  <DialogDescription>
                    {currentMember
                      ? "Update the member details below."
                      : "Fill in the details to add a new member."}
                  </DialogDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fillFormData && fillFormData()}
                >
                  Fill Test Data
                </Button>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <AddMemberForm
              currentMember={currentMember}
              onSave={saveMember}
              onCancel={() => setOpenDialog(null)}
              onFillDummyData={handleFillDummyData}
            />
          </div>

          <div className="p-6 pt-4 border-t">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpenDialog(null)}>
                Cancel
              </Button>
              <Button onClick={() => saveMember(formData)} disabled={memberOpLoading}>
                {currentMember ? "Update" : "Add"} Member
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selected.length > 1
                ? `Delete ${selected.length} members?`
                : "Delete member?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              member record from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                currentMember
                  ? deleteMember(currentMember.id)
                  : deleteSelected()
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

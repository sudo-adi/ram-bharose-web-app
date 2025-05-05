"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
import { useProfiles } from "@/hooks/useSupabase";

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

  // Fetch profiles from Supabase with pagination, search and filters
  const {
    data: profilesResult,
    loading,
    error,
    refetch,
  } = useProfiles(currentPage, pageSize, debouncedSearch, activeFilters);

  // State for members data
  const [members, setMembers] = useState<Member[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // Form data state
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    mobile_no1: "",
    gender: "",
    date_of_birth: "",
    marital_status: "",
    blood_group: "",
    residential_address_city: "",
    residential_address_state: "",
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
      const formattedMembers = profilesResult.data.map((profile) => ({
        id: profile.id.toString(),
        name: `${profile.name} ${profile.surname || ""}`.trim(),
        email: profile.email || "",
        phone: profile.mobile_no1 || "",
        joinDate: profile.date_of_birth || "", // You might want to use a different field for join date
      }));

      setMembers(formattedMembers);
      setTotalCount(profilesResult.count || 0);
    }
  }, [profilesResult]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  const deleteSelected = () => {
    setMembers((prev) => prev.filter((m) => !selected.includes(m.id)));
    setSelected([]);
    setOpenDeleteDialog(false);
  };

  // Delete single member
  const deleteMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
    setOpenDeleteDialog(false);
  };

  // Save member (add or edit)
  const saveMember = (member: Member) => {
    if (currentMember) {
      // Edit existing
      setMembers((prev) => prev.map((m) => (m.id === member.id ? member : m)));
    } else {
      // Add new
      setMembers((prev) => [...prev, { ...member, id: Date.now().toString() }]);
    }
    setOpenDialog(null);
    setCurrentMember(null);
  };

  // Sort members client-side
  const sortedMembers = [...members].sort((a, b) => {
    if (!sortField) return 0;

    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
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
                <p>{currentMember.name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Email
                </h4>
                <p>{currentMember.email}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Phone
                </h4>
                <p>{currentMember.phone}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Join Date
                </h4>
                <p>{currentMember.joinDate}</p>
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

      {/* Add/Edit Member Dialog - Now using our componentized AddMemberForm */}
      <Dialog
        open={openDialog === "edit" || openDialog === "add"}
        onOpenChange={(open) => {
          if (!open) setOpenDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {currentMember ? "Edit Member" : "Add New Member"}
            </DialogTitle>
            <DialogDescription>
              {currentMember
                ? "Update the member details below."
                : "Fill in the details to add a new member."}
            </DialogDescription>
          </DialogHeader>
          
          {/* Use our new AddMemberForm component */}
          <AddMemberForm 
            currentMember={currentMember}
            onSave={saveMember}
            onCancel={() => setOpenDialog(null)}
          />
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

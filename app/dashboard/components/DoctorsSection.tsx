"use client";

import { useState, useEffect } from "react";
import { useDoctors } from "@/hooks/useSupabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Clock,
  Award,
  AlertCircle,
  X,
  Eye,
  Edit,
  Plus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { supabase } from "@/lib/supabase";

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

export function DoctorsSection() {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // 3x3 grid

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [activeSpecialization, setActiveSpecialization] = useState("All");

  // Add form state for editing
  const [editForm, setEditForm] = useState<Partial<Doctor>>({
    name: "",
    specialization: "",
    qualification: "",
    experience_years: 0,
    clinic_address: "",
    contact_email: "",
    contact_phone: "",
    available_timings: "",
  });

  // Fetch doctors with pagination and search
  const {
    data: doctorsData,
    loading,
    error,
    updateDoctor,
    refetch,
  } = useDoctors(currentPage, pageSize, debouncedSearch);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const specializations = [
    "All",
    "Cardiologist",
    "Pediatrician",
    "Orthopedic",
    "Dermatologist",
    "Neurologist",
  ];

  // Filter doctors based on selected specialization (client-side filtering)
  const filteredDoctors = doctorsData?.data
    ? doctorsData.data.filter((doctor) => {
      const matchesSpecialization =
        activeSpecialization === "All" ||
        doctor.specialization === activeSpecialization;

      return matchesSpecialization;
    })
    : [];

  // Calculate total pages
  const totalCount = doctorsData?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  const handleViewDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsEditMode(false);
    setModalOpen(true);
  };

  const handleEditDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setEditForm({
      name: doctor.name,
      specialization: doctor.specialization,
      qualification: doctor.qualification,
      experience_years: doctor.experience_years,
      clinic_address: doctor.clinic_address,
      contact_email: doctor.contact_email,
      contact_phone: doctor.contact_phone,
      available_timings: doctor.available_timings,
    });
    setIsEditMode(true);
    setModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: name === "experience_years" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSaveChanges = async () => {
    if (!selectedDoctor) return;

    const { success, error } = await updateDoctor(selectedDoctor.id, editForm);

    if (success) {
      setModalOpen(false);
      setIsEditMode(false);
    } else {
      console.error("Error updating doctor:", error);
      // You could add error handling UI here
    }
  };

  const handleOpenAddDialog = () => {
    // Reset the form data to empty values
    setEditForm({
      name: "",
      specialization: "",
      qualification: "",
      experience_years: 0,
      clinic_address: "",
      contact_email: "",
      contact_phone: "",
      available_timings: "",
    });
    setSelectedDoctor(null);
    setIsAddMode(true);
    setIsEditMode(false);
    setModalOpen(true);
  };

  const handleAddDoctor = async () => {
    // Validate required fields
    if (!editForm.name || !editForm.specialization || !editForm.qualification) {
      // Show validation error
      return;
    }

    try {

      const { error } = await supabase.from("doctors").insert({
        name: editForm.name,
        specialization: editForm.specialization,
        qualification: editForm.qualification,
        experience_years: editForm.experience_years || 0,
        clinic_address: editForm.clinic_address || "",
        contact_email: editForm.contact_email || "",
        contact_phone: editForm.contact_phone || "",
        available_timings: editForm.available_timings || "",
      });
      if (!error) {
        setModalOpen(false);
        setIsAddMode(false);
        // Refetch the doctors list
        refetch();
      } else {
        console.error("Error adding doctor");
      }
    } catch (error) {
      console.error("Error adding doctor:", error);
    }
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">Error loading doctors</h3>
        <p className="text-sm text-gray-500 mt-2">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>

          <Button size="sm" onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        </div>

        <ScrollArea className="whitespace-nowrap pb-2">
          <div className="flex space-x-2">
            {specializations.map((specialization) => (
              <Badge
                key={specialization}
                variant={
                  activeSpecialization === specialization
                    ? "default"
                    : "outline"
                }
                className="cursor-pointer"
                onClick={() => setActiveSpecialization(specialization)}
              >
                {specialization}
              </Badge>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Doctor Cards */}
      {filteredDoctors.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-500 text-lg font-bold">
                        {doctor.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 line-clamp-1">
                        {doctor.name}
                      </h3>
                      <p className="text-orange-500 text-sm font-medium">
                        {doctor.specialization}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Award className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {doctor.qualification}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {doctor.clinic_address}
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between p-4 pt-0 gap-2">
                  <Button
                    variant="default"
                    className="flex-1 bg-orange-400 hover:bg-orange-300"
                    onClick={() => handleViewDoctor(doctor)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="default"
                    className="flex-1 bg-orange-400 hover:bg-orange-300"
                    onClick={() => handleEditDoctor(doctor)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {/* First page */}
                {currentPage > 2 && (
                  <PaginationItem>
                    <PaginationLink onClick={() => handlePageChange(1)}>
                      1
                    </PaginationLink>
                  </PaginationItem>
                )}

                {/* Ellipsis */}
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Previous page */}
                {currentPage > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      {currentPage - 1}
                    </PaginationLink>
                  </PaginationItem>
                )}

                {/* Current page */}
                <PaginationItem>
                  <PaginationLink
                    isActive
                    onClick={() => handlePageChange(currentPage)}
                  >
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>

                {/* Next page */}
                {currentPage < totalPages && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      {currentPage + 1}
                    </PaginationLink>
                  </PaginationItem>
                )}

                {/* Ellipsis */}
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {/* Last page */}
                {currentPage < totalPages - 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      handlePageChange(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-3 mb-4">
            <AlertCircle className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">No doctors found</h3>
          <p className="text-sm text-gray-500 mt-2">
            No doctors match your search criteria
          </p>
        </div>
      )}

      {/* Doctor Detail Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          {(selectedDoctor || isAddMode) && (
            <>
              <DialogHeader>
                <div className="flex flex-col items-center mb-4">
                  {!isAddMode && selectedDoctor && !isEditMode && (
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                      <span className="text-orange-500 text-xl font-bold">
                        {selectedDoctor.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <DialogTitle className="text-center">
                    {isAddMode ? "Add New Doctor" : isEditMode ? "Edit Doctor" : selectedDoctor!.name}
                  </DialogTitle>
                  {!isEditMode && !isAddMode && selectedDoctor && (
                    <>
                      <p className="text-orange-500 text-sm">
                        {selectedDoctor.specialization}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {selectedDoctor.qualification}
                      </p>
                    </>
                  )}
                </div>
              </DialogHeader>

              {!isEditMode && !isAddMode && selectedDoctor ? (
                <>
                  <div className="flex justify-center space-x-6 mb-6">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex flex-col items-center rounded-full h-12 w-12 p-0"
                      onClick={() => handleEmail(selectedDoctor.contact_email)}
                    >
                      <Mail className="h-5 w-5 text-orange-500" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">
                      Doctor Information
                    </h4>

                    <div className="space-y-3">
                      <div className="flex">
                        <Clock className="h-4 w-4 text-orange-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500">Experience</p>
                          <p className="text-sm">
                            {selectedDoctor.experience_years} years
                          </p>
                        </div>
                      </div>

                      <div className="flex">
                        <MapPin className="h-4 w-4 text-orange-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Clinic Address
                          </p>
                          <p className="text-sm">
                            {selectedDoctor.clinic_address}
                          </p>
                        </div>
                      </div>

                      <div className="flex">
                        <Phone className="h-4 w-4 text-orange-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500">Phone</p>
                          <p className="text-sm">
                            {selectedDoctor.contact_phone}
                          </p>
                        </div>
                      </div>

                      <div className="flex">
                        <Mail className="h-4 w-4 text-orange-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-sm">
                            {selectedDoctor.contact_email}
                          </p>
                        </div>
                      </div>

                      <div className="flex">
                        <Calendar className="h-4 w-4 text-orange-500 mt-0.5 mr-3" />
                        <div>
                          <p className="text-xs text-gray-500">
                            Available Timings
                          </p>
                          <p className="text-sm">
                            {selectedDoctor.available_timings}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditMode(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button onClick={() => setModalOpen(false)}>Close</Button>
                  </DialogFooter>
                </>
              ) : (
                <>
                  {/* Edit/Add form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        Name
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={editForm.name}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="specialization"
                        className="text-sm font-medium"
                      >
                        Specialization
                      </label>
                      <Input
                        id="specialization"
                        name="specialization"
                        value={editForm.specialization}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="qualification"
                        className="text-sm font-medium"
                      >
                        Qualification
                      </label>
                      <Input
                        id="qualification"
                        name="qualification"
                        value={editForm.qualification}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="experience_years"
                        className="text-sm font-medium"
                      >
                        Years of Experience
                      </label>
                      <Input
                        id="experience_years"
                        name="experience_years"
                        type="number"
                        value={editForm.experience_years}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="clinic_address"
                        className="text-sm font-medium"
                      >
                        Clinic Address
                      </label>
                      <Input
                        id="clinic_address"
                        name="clinic_address"
                        value={editForm.clinic_address}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="contact_phone"
                        className="text-sm font-medium"
                      >
                        Phone
                      </label>
                      <Input
                        id="contact_phone"
                        name="contact_phone"
                        value={editForm.contact_phone}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="contact_email"
                        className="text-sm font-medium"
                      >
                        Email
                      </label>
                      <Input
                        id="contact_email"
                        name="contact_email"
                        type="email"
                        value={editForm.contact_email}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="available_timings"
                        className="text-sm font-medium"
                      >
                        Available Timings
                      </label>
                      <Input
                        id="available_timings"
                        name="available_timings"
                        value={editForm.available_timings}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditMode(false);
                        setIsAddMode(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={isAddMode ? handleAddDoctor : handleSaveChanges}
                    >
                      {isAddMode ? "Add Doctor" : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

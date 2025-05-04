"use client";

import { useState, useEffect } from "react";
import { useFamilies } from "@/hooks/useSupabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  X,
  Users,
  Phone,
  MessageSquare,
  RefreshCw,
  Home,
  Mail,
  Briefcase,
  MapPin,
  Calendar,
  Droplets,
} from "lucide-react";
import Image from "next/image";

export function FamiliesSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFamily, setSelectedFamily] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12; // 12 distinct families per page

  const {
    data: familiesData,
    loading: familiesLoading,
    error: familiesError,
    refetch: refetchFamilies,
  } = useFamilies(currentPage, pageSize, searchQuery);

  const handleFamilyPress = (family: any) => {
    setSelectedFamily(family);
    setModalOpen(true);
  };

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`);
  };

  const handleWhatsApp = (phoneNumber: string) => {
    const formattedNumber = phoneNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${formattedNumber}`);
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`);
  };

  const handleRefresh = () => {
    refetchFamilies();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (familiesLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 bg-white rounded-lg">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-sm text-gray-500 font-medium">
              Loading families...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (familiesError) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 bg-white rounded-lg">
        <div className="flex justify-center items-center h-64">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription className="space-y-4">
              <p>{familiesError?.message || "Error loading families"}</p>
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

  const families = familiesData?.families || [];
  const totalFamilies = familiesData?.count || 0;
  const totalPages = Math.ceil(totalFamilies / pageSize);

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Families</h2>
            <p className="text-sm text-gray-500">
              Explore our community families and their members
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={familiesLoading}
            className="mt-2 sm:mt-0 border-gray-200 hover:bg-gray-50 hover:text-orange-600"
          >
            {familiesLoading ? (
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

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <Input
            type="text"
            placeholder="Search families..."
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

        {/* Families Grid - Shows 12 distinct families */}
        {families.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {families.map((family: any) => (
                <div
                  key={family.id}
                  className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  <div className="relative h-32 w-full overflow-hidden">
                    <Image
                      src={family.coverImage}
                      alt={family.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src =
                          "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2000";
                      }}
                    />
                    <div className="absolute -bottom-8 left-4">
                      <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-white z-10">
                        <Image
                          src={family.headImage}
                          alt={family.headName}
                          fill
                          className="object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=300";
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 pt-10 flex-1">
                    <h3 className="text-gray-800 font-medium text-sm line-clamp-1">
                      {family.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-1">
                      {family.headName}
                    </p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Users className="h-3 w-3 mr-1" />
                      {family.totalMembers} members
                    </div>
                    {family.city && (
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        {family.city}, {family.state}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleFamilyPress(family)}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium py-2 flex items-center justify-center gap-1"
                  >
                    View Family
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="sr-only">Previous</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Show first, last, current, and adjacent pages
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      if (!showPage) {
                        // Show ellipsis instead of hiding pages
                        if (
                          (page === currentPage - 2 && currentPage > 3) ||
                          (page === currentPage + 2 &&
                            currentPage < totalPages - 2)
                        ) {
                          return (
                            <span
                              key={`ellipsis-${page}`}
                              className="px-2 py-1 text-gray-400"
                            >
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md ${
                            page === currentPage
                              ? "bg-orange-500 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className={`p-2 rounded-md ${
                      currentPage >= totalPages
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className="sr-only">Next</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center bg-white rounded-lg border border-dashed border-gray-200">
            <Users className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500 text-base font-medium">
              {searchQuery
                ? "No families match your search"
                : "No families available"}
            </p>
            <p className="text-gray-400 mt-1 text-sm text-center max-w-md">
              {searchQuery
                ? "Try using different keywords or clear your search"
                : "Check back later for family updates"}
            </p>
          </div>
        )}
      </div>

      {/* Family Details Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
          {selectedFamily && (
            <>
              <DialogHeader>
                <div className="relative h-40 w-full overflow-hidden rounded-lg mb-4">
                  <Image
                    src={selectedFamily.coverImage}
                    alt={selectedFamily.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <DialogTitle className="text-xl font-bold">
                      {selectedFamily.name}
                    </DialogTitle>
                    <p className="text-sm opacity-90">
                      {selectedFamily.totalMembers} family members
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {selectedFamily.address && (
                    <div className="flex items-start gap-2">
                      <Home className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Address
                        </p>
                        <p className="text-sm text-gray-700">
                          {selectedFamily.address}, {selectedFamily.city},{" "}
                          {selectedFamily.state}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedFamily.members[0]?.mobile_no1 && (
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">
                          Primary Contact
                        </p>
                        <p className="text-sm text-gray-700">
                          {selectedFamily.members[0].mobile_no1}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </DialogHeader>

              <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">
                  Family Members
                </h3>
                {selectedFamily.members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-start p-3 rounded-lg border border-gray-100"
                  >
                    <div className="relative h-12 w-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                      <Image
                        src={member.profile_pic}
                        alt={member.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-800">
                            {member.name} {member.surname}
                          </h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                            {member.relationship && (
                              <span className="text-xs text-orange-600">
                                {member.relationship}
                              </span>
                            )}
                            {member.occupation && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {member.occupation}
                              </span>
                            )}
                            {member.date_of_birth && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {member.date_of_birth}
                              </span>
                            )}
                            {member.blood_group && (
                              <span className="text-xs text-gray-500 flex items-center">
                                <Droplets className="h-3 w-3 mr-1" />
                                {member.blood_group}
                              </span>
                            )}
                          </div>
                          {(member.education || member.qualification) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {[member.education, member.qualification]
                                .filter(Boolean)
                                .join(" - ")}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2 mt-1">
                          {member.mobile_no1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 bg-orange-500 text-white hover:bg-orange-600 border-orange-500"
                              onClick={() => handleCall(member.mobile_no1)}
                            >
                              <Phone className="h-3 w-3" />
                            </Button>
                          )}
                          {member.mobile_no1 && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 bg-green-500 text-white hover:bg-green-600 border-green-500"
                              onClick={() => handleWhatsApp(member.mobile_no1)}
                            >
                              <MessageSquare className="h-3 w-3" />
                            </Button>
                          )}
                          {member.email && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 w-7 p-0 bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                              onClick={() => handleEmail(member.email)}
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Import components
import { ApplicationList } from "./sub-components/application-components/ApplicationList";
import { ApplicationDetailDialog } from "./sub-components/application-components/ApplicationDetailDialog";
import {
  EventApplication,
  DonationApplication,
  ApplicationType,
  EducationLoanApplication,
  BusinessLoanApplication,
  GirlsHostelApplication,
  MulundHostelApplication,
  VatsalyadhamApplication,
  LoanApplicationType,
  HostelApplicationType
} from "./sub-components/application-components/types";

const ApplicationsSection = () => {
  // State for applications
  const [eventApplications, setEventApplications] = useState<EventApplication[]>([]);
  const [donationApplications, setDonationApplications] = useState<DonationApplication[]>([]);
  const [educationLoanApplications, setEducationLoanApplications] = useState<EducationLoanApplication[]>([]);
  const [businessLoanApplications, setBusinessLoanApplications] = useState<BusinessLoanApplication[]>([]);
  const [girlsHostelApplications, setGirlsHostelApplications] = useState<GirlsHostelApplication[]>([]);
  const [mulundHostelApplications, setMulundHostelApplications] = useState<MulundHostelApplication[]>([]);
  const [vatsalyadhamApplications, setVatsalyadhamApplications] = useState<VatsalyadhamApplication[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("events");
  const [activeLoanTab, setActiveLoanTab] = useState<string>("education_loan");
  const [activeHostelTab, setActiveHostelTab] = useState<string>("girls_hostel");

  // Filtered applications state
  const [filteredEventApplications, setFilteredEventApplications] = useState<EventApplication[]>([]);
  const [filteredDonationApplications, setFilteredDonationApplications] = useState<DonationApplication[]>([]);
  const [filteredEducationLoanApplications, setFilteredEducationLoanApplications] = useState<EducationLoanApplication[]>([]);
  const [filteredBusinessLoanApplications, setFilteredBusinessLoanApplications] = useState<BusinessLoanApplication[]>([]);
  const [filteredGirlsHostelApplications, setFilteredGirlsHostelApplications] = useState<GirlsHostelApplication[]>([]);
  const [filteredMulundHostelApplications, setFilteredMulundHostelApplications] = useState<MulundHostelApplication[]>([]);
  const [filteredVatsalyadhamApplications, setFilteredVatsalyadhamApplications] = useState<VatsalyadhamApplication[]>([]);

  // State for application detail dialog
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedApplicationType, setSelectedApplicationType] = useState<ApplicationType>("event");

  // Fetch applications
  const fetchApplications = async () => {
    try {
      setLoading(true);

      // Fetch event applications
      const { data: eventData, error: eventError } = await supabase
        .from("event_applications")
        .select("*");
      if (eventError) throw eventError;

      // Fetch donation applications
      const { data: donationData, error: donationError } = await supabase
        .from("donation_applications")
        .select("*");
      if (donationError) throw donationError;

      // Fetch education loan applications
      const { data: educationLoanData, error: educationLoanError } = await supabase
        .from("education_loan_applications")
        .select("*");
      if (educationLoanError) throw educationLoanError;

      // Fetch business loan applications
      const { data: businessLoanData, error: businessLoanError } = await supabase
        .from("business_loan_applications")
        .select("*");
      if (businessLoanError) throw businessLoanError;

      // Fetch girls hostel applications
      const { data: girlsHostelData, error: girlsHostelError } = await supabase
        .from("girls_hostel_form")
        .select("*");
      if (girlsHostelError) throw girlsHostelError;

      // Fetch mulund hostel applications
      const { data: mulundHostelData, error: mulundHostelError } = await supabase
        .from("mulund_hostel_form")
        .select("*");
      if (mulundHostelError) throw mulundHostelError;

      // Fetch vatsalyadham applications
      const { data: vatsalyadhamData, error: vatsalyadhamError } = await supabase
        .from("vatsalyadham_form")
        .select("*");
      if (vatsalyadhamError) throw vatsalyadhamError;

      setEventApplications(eventData || []);
      setDonationApplications(donationData || []);
      setEducationLoanApplications(educationLoanData || []);
      setBusinessLoanApplications(businessLoanData || []);
      setGirlsHostelApplications(girlsHostelData || []);
      setMulundHostelApplications(mulundHostelData || []);
      setVatsalyadhamApplications(vatsalyadhamData || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get table name based on application type
  const getTableName = (type: ApplicationType): string => {
    switch (type) {
      case "event": return "event_applications";
      case "donation": return "donation_applications";
      case "education_loan": return "education_loan_applications";
      case "business_loan": return "business_loan_applications";
      case "girls_hostel": return "girls_hostel_form";
      case "mulund_hostel": return "mulund_hostel_form";
      case "vatsalyadham": return "vatsalyadham_form";
      default: return "";
    }
  };

  // Get target table name for successful applications
  const getTargetTable = (type: ApplicationType): string | null => {
    switch (type) {
      case "event": return "events";
      case "donation": return "donations";
      default: return null;
    }
  };

  // Update application status
  const updateApplicationStatus = async (
    type: ApplicationType,
    id: string,
    status: "approved" | "rejected"
  ) => {
    try {
      const tableName = getTableName(type);

      // Only event and donation applications can be moved to main table when approved
      if ((type === "event" || type === "donation") && status === "approved") {
        // Get the application data
        const { data: applicationData, error: fetchError } = await supabase
          .from(tableName)
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError) throw fetchError;

        // Insert into target table
        const targetTable = getTargetTable(type);
        if (targetTable) {
          // Prepare the data for insertion by removing application-specific fields
          const dataToInsert = { ...applicationData };

          // Remove fields that shouldn't be transferred
          delete dataToInsert.status;

          // Insert into the target table
          const { error: insertError } = await supabase
            .from(targetTable)
            .insert([dataToInsert]);

          if (insertError) throw insertError;
        }

        // Delete from applications table after successful insertion
        const { error: deleteError } = await supabase
          .from(tableName)
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;
      } else {
        // Just update status for all other applications or when rejecting
        const { error } = await supabase
          .from(tableName)
          .update({ status })
          .eq("id", id);

        if (error) throw error;
      }

      // Refresh applications after update
      fetchApplications();
    } catch (err: any) {
      console.error(`Error updating ${type} application:`, err);
      setError(`Failed to update application: ${err.message}`);
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    }
  };

  // View application details
  const viewApplicationDetails = (
    type: ApplicationType,
    application: any
  ) => {
    setSelectedApplication(application);
    setSelectedApplicationType(type);
    setDetailDialogOpen(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Filter applications based on search query
  useEffect(() => {
    // Filter event applications
    if (eventApplications.length > 0) {
      const filtered = eventApplications.filter((app) =>
        app.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEventApplications(filtered);
    }

    // Filter donation applications
    if (donationApplications.length > 0) {
      const filtered = donationApplications.filter((app) =>
        app.cause?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDonationApplications(filtered);
    }

    // Filter education loan applications
    if (educationLoanApplications.length > 0) {
      const filtered = educationLoanApplications.filter((app) =>
        app.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.institution_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEducationLoanApplications(filtered);
    }

    // Filter business loan applications
    if (businessLoanApplications.length > 0) {
      const filtered = businessLoanApplications.filter((app) =>
        app.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.nature_of_business?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBusinessLoanApplications(filtered);
    }

    // Filter girls hostel applications
    if (girlsHostelApplications.length > 0) {
      const filtered = girlsHostelApplications.filter((app) =>
        app.applicant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.institution && app.institution.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredGirlsHostelApplications(filtered);
    }

    // Filter mulund hostel applications
    if (mulundHostelApplications.length > 0) {
      const filtered = mulundHostelApplications.filter((app) =>
        app.applicant_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (app.institution && app.institution.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredMulundHostelApplications(filtered);
    }

    // Filter vatsalyadham applications
    if (vatsalyadhamApplications.length > 0) {
      const filtered = vatsalyadhamApplications.filter((app) =>
        app.applicant_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredVatsalyadhamApplications(filtered);
    }
  }, [
    searchQuery,
    eventApplications,
    donationApplications,
    educationLoanApplications,
    businessLoanApplications,
    girlsHostelApplications,
    mulundHostelApplications,
    vatsalyadhamApplications
  ]);

  // Load applications on component mount
  useEffect(() => {
    fetchApplications();
  }, []);

  const handleRefresh = () => {
    fetchApplications();
  };

  if (loading && !eventApplications.length && !donationApplications.length) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 bg-white rounded-lg">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-sm text-gray-500 font-medium">
              Loading applications...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 bg-white rounded-lg">
        <div className="flex justify-center items-center h-64">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription className="space-y-4">
              <p>{error || "Error loading applications"}</p>
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
            <h2 className="text-xl font-bold text-gray-800">Applications</h2>
            <p className="text-sm text-gray-500">
              Manage event and donation applications
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="mt-2 sm:mt-0 border-gray-200 hover:bg-gray-50 hover:text-orange-600"
          >
            {loading ? (
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
            placeholder="Search applications..."
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

        <Tabs
          defaultValue="events"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="events" className="px-4 py-2">
              Event Applications
            </TabsTrigger>
            <TabsTrigger value="donations" className="px-4 py-2">
              Donation Applications
            </TabsTrigger>
            <TabsTrigger value="loans" className="px-4 py-2">
              Loan Applications
            </TabsTrigger>
            <TabsTrigger value="hostels" className="px-4 py-2">
              Hostel Applications
            </TabsTrigger>
          </TabsList>

          {/* Event Applications */}
          <TabsContent value="events" className="pt-2">
            <ApplicationList
              applications={
                searchQuery ? filteredEventApplications : eventApplications
              }
              type="event"
              onView={viewApplicationDetails}
              onUpdateStatus={updateApplicationStatus}
              formatDate={formatDate}
              searchQuery={searchQuery}
            />
          </TabsContent>

          {/* Donation Applications */}
          <TabsContent value="donations" className="pt-2">
            <ApplicationList
              applications={
                searchQuery
                  ? filteredDonationApplications
                  : donationApplications
              }
              type="donation"
              onView={viewApplicationDetails}
              onUpdateStatus={updateApplicationStatus}
              formatDate={formatDate}
              searchQuery={searchQuery}
            />
          </TabsContent>

          {/* Loan Applications */}
          <TabsContent value="loans" className="pt-2">
            <Tabs
              defaultValue="education_loan"
              value={activeLoanTab}
              onValueChange={setActiveLoanTab}
              className="w-full"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="education_loan" className="px-4 py-2">
                  Education Loans
                </TabsTrigger>
                <TabsTrigger value="business_loan" className="px-4 py-2">
                  Business Loans
                </TabsTrigger>
              </TabsList>

              {/* Education Loan Applications */}
              <TabsContent value="education_loan" className="pt-2">
                <ApplicationList
                  applications={
                    searchQuery
                      ? filteredEducationLoanApplications
                      : educationLoanApplications
                  }
                  type="education_loan"
                  onView={viewApplicationDetails}
                  onUpdateStatus={updateApplicationStatus}
                  formatDate={formatDate}
                  searchQuery={searchQuery}
                />
              </TabsContent>

              {/* Business Loan Applications */}
              <TabsContent value="business_loan" className="pt-2">
                <ApplicationList
                  applications={
                    searchQuery
                      ? filteredBusinessLoanApplications
                      : businessLoanApplications
                  }
                  type="business_loan"
                  onView={viewApplicationDetails}
                  onUpdateStatus={updateApplicationStatus}
                  formatDate={formatDate}
                  searchQuery={searchQuery}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Hostel Applications */}
          <TabsContent value="hostels" className="pt-2">
            <Tabs
              defaultValue="girls_hostel"
              value={activeHostelTab}
              onValueChange={setActiveHostelTab}
              className="w-full"
            >
              <TabsList className="mb-4">
                <TabsTrigger value="girls_hostel" className="px-4 py-2">
                  Girls Hostel
                </TabsTrigger>
                <TabsTrigger value="mulund_hostel" className="px-4 py-2">
                  Mulund Hostel
                </TabsTrigger>
                <TabsTrigger value="vatsalyadham" className="px-4 py-2">
                  Vatsalyadham
                </TabsTrigger>
              </TabsList>

              {/* Girls Hostel Applications */}
              <TabsContent value="girls_hostel" className="pt-2">
                <ApplicationList
                  applications={
                    searchQuery
                      ? filteredGirlsHostelApplications
                      : girlsHostelApplications
                  }
                  type="girls_hostel"
                  onView={viewApplicationDetails}
                  onUpdateStatus={updateApplicationStatus}
                  formatDate={formatDate}
                  searchQuery={searchQuery}
                />
              </TabsContent>

              {/* Mulund Hostel Applications */}
              <TabsContent value="mulund_hostel" className="pt-2">
                <ApplicationList
                  applications={
                    searchQuery
                      ? filteredMulundHostelApplications
                      : mulundHostelApplications
                  }
                  type="mulund_hostel"
                  onView={viewApplicationDetails}
                  onUpdateStatus={updateApplicationStatus}
                  formatDate={formatDate}
                  searchQuery={searchQuery}
                />
              </TabsContent>

              {/* Vatsalyadham Applications */}
              <TabsContent value="vatsalyadham" className="pt-2">
                <ApplicationList
                  applications={
                    searchQuery
                      ? filteredVatsalyadhamApplications
                      : vatsalyadhamApplications
                  }
                  type="vatsalyadham"
                  onView={viewApplicationDetails}
                  onUpdateStatus={updateApplicationStatus}
                  formatDate={formatDate}
                  searchQuery={searchQuery}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      <ApplicationDetailDialog
        isOpen={detailDialogOpen}
        setIsOpen={setDetailDialogOpen}
        selectedApplication={selectedApplication}
        onUpdateStatus={updateApplicationStatus}
        formatDate={formatDate}
        applicationType={selectedApplicationType}
      />
    </>
  );
};

export default ApplicationsSection;

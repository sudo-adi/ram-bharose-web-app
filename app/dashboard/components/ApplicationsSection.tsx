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
} from "./sub-components/application-components/types";

const ApplicationsSection = () => {
  // State for applications
  const [eventApplications, setEventApplications] = useState<
    EventApplication[]
  >([]);
  const [donationApplications, setDonationApplications] = useState<
    DonationApplication[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredEventApplications, setFilteredEventApplications] = useState<
    EventApplication[]
  >([]);
  const [filteredDonationApplications, setFilteredDonationApplications] =
    useState<DonationApplication[]>([]);

  // State for application detail dialog
  const [selectedEvent, setSelectedEvent] = useState<EventApplication | null>(
    null
  );
  const [selectedDonation, setSelectedDonation] =
    useState<DonationApplication | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

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

      setEventApplications(eventData || []);
      setDonationApplications(donationData || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  // Update application status
  const updateApplicationStatus = async (
    type: ApplicationType,
    id: number,
    status: "approved" | "rejected"
  ) => {
    try {
      const tableName =
        type === "event" ? "event_applications" : "donation_applications";

      const { error } = await supabase
        .from(tableName)
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      // Refresh applications after update
      fetchApplications();
    } catch (err: any) {
      console.error(`Error updating ${type} application:`, err);
    }
  };

  // View application details
  const viewApplicationDetails = (
    type: ApplicationType,
    application: EventApplication | DonationApplication
  ) => {
    if (type === "event") {
      setSelectedEvent(application as EventApplication);
      setSelectedDonation(null);
    } else {
      setSelectedDonation(application as DonationApplication);
      setSelectedEvent(null);
    }
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
    if (eventApplications.length > 0) {
      const filtered = eventApplications.filter((app) =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredEventApplications(filtered);
    }

    if (donationApplications.length > 0) {
      const filtered = donationApplications.filter((app) =>
        app.cause.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredDonationApplications(filtered);
    }
  }, [searchQuery, eventApplications, donationApplications]);

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

        <Tabs defaultValue="events" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="events" className="px-4 py-2">
              Event Applications
            </TabsTrigger>
            <TabsTrigger value="donations" className="px-4 py-2">
              Donation Applications
            </TabsTrigger>
          </TabsList>

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
        </Tabs>
      </div>

      <ApplicationDetailDialog
        isOpen={detailDialogOpen}
        setIsOpen={setDetailDialogOpen}
        selectedEvent={selectedEvent}
        selectedDonation={selectedDonation}
        onUpdateStatus={updateApplicationStatus}
        formatDate={formatDate}
      />
    </>
  );
};

export default ApplicationsSection;

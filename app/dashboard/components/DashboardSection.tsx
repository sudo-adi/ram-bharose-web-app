"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useProfiles, useBirthdays, useCommittees } from "@/hooks/useSupabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";

// Import sub-components
import { StatCard } from "./sub-components/dashboard-components/StatCard";
import { RecentApplications } from "./sub-components/dashboard-components/RecentApplications";
import { GenderDistribution } from "./sub-components/dashboard-components/GenderDistribution";
import { BirthdayList } from "./sub-components/dashboard-components/BirthdayList";

type DashboardSectionProps = {
  setActiveSection: (section: string) => void;
};

export function DashboardSection({ setActiveSection }: DashboardSectionProps) {
  // State for dashboard data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalFamilies: 0,
    totalDoctors: 0,
    totalCommittees: 0,
    totalEvents: 0,
    totalApplications: 0,
    totalDonations: 0,
    maleCount: 0,
    femaleCount: 0,
    otherCount: 0,
  });
  const [recentApplications, setRecentApplications] = useState<any[]>([]);

  // Fetch profiles with pagination
  const {
    data: profilesData,
    loading: profilesLoading,
    error: profilesError,
  } = useProfiles(1, 1); // Just to get the count

  // Fetch birthdays for today
  const {
    data: birthdaysToday,
    loading: birthdaysLoading,
    error: birthdaysError,
  } = useBirthdays("today");

  // Fetch committees
  const {
    data: committeesData,
    loading: committeesLoading,
    error: committeesError,
  } = useCommittees();

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Get gender distribution
      const {
        data: profileData,
        count: countRows,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Get gender distribution
      const { data: genderData, error: genderError } = await supabase
        .from("profiles")
        .select("gender");

      if (genderError) throw genderError;

      // Count by gender
      const maleCount =
        genderData?.filter((p) => p.gender?.toLowerCase() === "male").length ||
        0;
      const femaleCount =
        genderData?.filter((p) => p.gender?.toLowerCase() === "female")
          .length || 0;
      const otherCount =
        genderData?.filter(
          (p) =>
            p.gender &&
            p.gender.toLowerCase() !== "male" &&
            p.gender.toLowerCase() !== "female"
        ).length || 0;

      // Get distinct family numbers
      const { data: familyData, error: familyError } = await supabase
        .from("profiles")
        .select("family_no")
        .not("family_no", "is", null);

      if (familyError) throw familyError;

      // Count unique family numbers
      const uniqueFamilies = new Set(familyData?.map((p) => p.family_no));

      // Get doctors count
      const { count: doctorsCount, error: doctorsError } = await supabase
        .from("doctors")
        .select("*", { count: "exact", head: true });

      if (doctorsError) throw doctorsError;

      // Get events count
      const { count: eventsCount, error: eventsError } = await supabase
        .from("event_applications")
        .select("*", { count: "exact", head: true });

      if (eventsError) throw eventsError;

      // Get applications count
      const { count: applicationsCount, error: applicationsError } =
        await supabase
          .from("event_applications")
          .select("*", { count: "exact", head: true });

      if (applicationsError) throw applicationsError;

      // Get donations count
      const { count: donationsCount, error: donationsError } = await supabase
        .from("donation_applications")
        .select("*", { count: "exact", head: true });

      if (donationsError) throw donationsError;

      // Get recent applications
      const { data: recentApps, error: recentAppsError } = await supabase
        .from("event_applications")
        .select("*")
        .limit(5);

      if (recentAppsError) throw recentAppsError;

      // Update stats
      setStats({
        totalMembers: countRows || 0,
        totalFamilies: uniqueFamilies.size,
        totalDoctors: doctorsCount || 0,
        totalCommittees: committeesData?.length || 0,
        totalEvents: eventsCount || 0,
        totalApplications: applicationsCount || 0,
        totalDonations: donationsCount || 0,
        maleCount: maleCount,
        femaleCount: femaleCount,
        otherCount,
      });

      setRecentApplications(recentApps || []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching dashboard stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, [committeesData]);

  const handleRefresh = () => {
    fetchDashboardStats();
  };

  // Handler to navigate to Applications section
  const handleViewAllApplications = () => {
    setActiveSection("Applications");
  };

  if (loading && !stats.totalMembers) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 bg-white rounded-lg">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-sm text-gray-500 font-medium">
              Loading dashboard data...
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
              <p>{error || "Error loading dashboard data"}</p>
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
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Dashboard Overview
          </h2>
          <p className="text-sm text-gray-500">
            Key metrics and statistics at a glance
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Members"
          value={stats.totalMembers}
          description="Registered members"
          trend="up"
          trendValue="5%"
          icon="users"
        />
        <StatCard
          title="Total Families"
          value={stats.totalFamilies}
          description="Registered families"
          trend="up"
          trendValue="3%"
          icon="users2"
        />
        <StatCard
          title="Doctors"
          value={stats.totalDoctors}
          description="Medical professionals"
          trend="same"
          trendValue="0%"
          icon="stethoscope"
        />
        <StatCard
          title="Committees"
          value={stats.totalCommittees}
          description="Active committees"
          trend="up"
          trendValue="2%"
          icon="usersRound"
        />
      </div>

      {/* Second row of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          title="Events"
          value={stats.totalEvents}
          description="Upcoming & past events"
          trend="up"
          trendValue="10%"
          icon="calendar"
        />
        <StatCard
          title="Applications"
          value={stats.totalApplications}
          description="Pending review"
          trend="down"
          trendValue="8%"
          icon="clipboardList"
        />
        <StatCard
          title="Donations"
          value={stats.totalDonations}
          description="Total campaigns"
          trend="up"
          trendValue="15%"
          icon="handCoins"
        />
      </div>

      {/* Charts and detailed stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Gender Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <GenderDistribution
              maleCount={stats.maleCount}
              femaleCount={stats.femaleCount}
              otherCount={stats.otherCount}
            />
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Recent Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RecentApplications
              applications={recentApplications}
              onViewAll={handleViewAllApplications}
            />
          </CardContent>
        </Card>
      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Today's Birthdays */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">
              Today's Birthdays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BirthdayList
              birthdays={birthdaysToday || []}
              loading={birthdaysLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

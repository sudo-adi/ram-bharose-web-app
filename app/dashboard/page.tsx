"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Users2,
  Stethoscope,
  UsersRound,
  Calendar,
  Newspaper,
  HeartHandshake,
  ClipboardList,
  HandCoins,
  Shield,
  UserPlus,
  FilePlus,
  UserPlus2,
  PenLine,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import Image from "next/image";

// Import your section components
import { DashboardSection } from "./components/DashboardSection";
import { MembersSection } from "./components/MembersSection";
import { FamiliesSection } from "./components/FamiliesSection";
import { DoctorsSection } from "./components/DoctorsSection";
import { EventsSection } from "./components/EventsSection";
import { ShubhChintakSection } from "./components/ShubhChintakSection";
import { DonationsSection } from "./components/DonationsSection";
import CommittiesSection from "./components/CommittiesSection";
import ApplicationsSection from "./components/ApplicationsSection";
import NariSahasSection from "./components/NariSahasSection";
import NewsSection from "./components/NewsSection";

// Role permissions configuration
const ROLE_PERMISSIONS = {
  admin: [
    "Dashboard",
    "Members",
    "Families",
    "Doctors",
    "Committies",
    "Events",
    "News",
    "Shubh Chintak",
    "Applications",
    "Donations",
    "Nari Sahas",
  ],
  president: [
    "Dashboard",
    "Members",
    "Families",
    "Doctors",
    "Committies",
    "Events",
    "Shubh Chintak",
    "Applications",
    "Donations",
  ],
  editor: ["Dashboard", "News"],
};

// Quick actions permissions
const QUICK_ACTIONS_PERMISSIONS = {
  admin: ["Add Member", "Add Doctor", "Add Committee", "Post News"],
  president: ["Add Member", "Add Doctor", "Add Committee"],
  editor: ["Post News"],
};

// User session interface
interface UserSession {
  email: string;
  role: string;
  name: string;
  token: string;
  loginTime: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication and get user session
  useEffect(() => {
    const checkAuth = () => {
      try {
        const sessionData = localStorage.getItem("kms_user_session");

        if (!sessionData) {
          toast.error("Please login to access the dashboard");
          router.push("/");
          return;
        }

        const parsedSession: UserSession = JSON.parse(sessionData);

        // Validate session structure
        if (
          !parsedSession.role ||
          !parsedSession.name ||
          !parsedSession.token
        ) {
          toast.error("Invalid session. Please login again.");
          localStorage.removeItem("kms_user_session");
          router.push("/");
          return;
        }

        // Check if session is expired (optional - 24 hours)
        const loginTime = new Date(parsedSession.loginTime);
        const now = new Date();
        const hoursDiff =
          (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > 24) {
          toast.error("Session expired. Please login again.");
          localStorage.removeItem("kms_user_session");
          router.push("/");
          return;
        }

        setUserSession(parsedSession);
        setLoading(false);
      } catch (error) {
        console.error("Auth check failed:", error);
        toast.error("Authentication error. Please login again.");
        localStorage.removeItem("kms_user_session");
        router.push("/");
      }
    };

    checkAuth();
  }, [router]);

  // Get sections based on user role
  const getAvailableSections = () => {
    if (!userSession) return [];

    const allowedSections =
      ROLE_PERMISSIONS[userSession.role as keyof typeof ROLE_PERMISSIONS] || [];

    const allSections = [
      { name: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      { name: "Members", icon: <Users className="h-4 w-4" /> },
      { name: "Families", icon: <Users2 className="h-4 w-4" /> },
      { name: "Doctors", icon: <Stethoscope className="h-4 w-4" /> },
      { name: "Committies", icon: <UsersRound className="h-4 w-4" /> },
      { name: "Events", icon: <Calendar className="h-4 w-4" /> },
      { name: "News", icon: <Newspaper className="h-4 w-4" /> },
      { name: "Shubh Chintak", icon: <HeartHandshake className="h-4 w-4" /> },
      { name: "Applications", icon: <ClipboardList className="h-4 w-4" /> },
      { name: "Donations", icon: <HandCoins className="h-4 w-4" /> },
      { name: "Nari Sahas", icon: <Shield className="h-4 w-4" /> },
    ];

    return allSections.filter((section) =>
      allowedSections.includes(section.name)
    );
  };

  // Get quick actions based on user role
  const getAvailableQuickActions = () => {
    if (!userSession) return [];

    const allowedActions =
      QUICK_ACTIONS_PERMISSIONS[
        userSession.role as keyof typeof QUICK_ACTIONS_PERMISSIONS
      ] || [];

    const allQuickActions = [
      {
        name: "Add Member",
        icon: <UserPlus className="h-5 w-5" />,
        onClick: () => setActiveSection("Members"),
        bgColor: "from-blue-500 to-blue-600",
        hoverColor: "hover:from-blue-600 hover:to-blue-700",
      },
      {
        name: "Add Doctor",
        icon: <Stethoscope className="h-5 w-5" />,
        onClick: () => setActiveSection("Doctors"),
        bgColor: "from-green-500 to-green-600",
        hoverColor: "hover:from-green-600 hover:to-green-700",
      },
      {
        name: "Add Committee",
        icon: <UserPlus2 className="h-5 w-5" />,
        onClick: () => setActiveSection("Committies"),
        bgColor: "from-purple-500 to-purple-600",
        hoverColor: "hover:from-purple-600 hover:to-purple-700",
      },
      {
        name: "Post News",
        icon: <PenLine className="h-5 w-5" />,
        onClick: () => setActiveSection("News"),
        bgColor: "from-amber-500 to-amber-600",
        hoverColor: "hover:from-amber-600 hover:to-amber-700",
      },
    ];

    return allQuickActions.filter((action) =>
      allowedActions.includes(action.name)
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("kms_user_session");
    toast.success("Logged out successfully");
    router.push("/");
  };

  const handleSectionChange = (sectionName: string) => {
    if (!userSession) return;

    const allowedSections =
      ROLE_PERMISSIONS[userSession.role as keyof typeof ROLE_PERMISSIONS] || [];

    if (allowedSections.includes(sectionName)) {
      setActiveSection(sectionName);
    } else {
      toast.error("You don't have permission to access this section");
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no valid session, redirect to login
  if (!userSession) {
    return null;
  }

  const sections = getAvailableSections();
  const quickActions = getAvailableQuickActions();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="fixed top-4 left-4 z-50"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-4">
            <div className="space-y-4 py-4">
              <div className="px-3 py-2">
                <div className="mb-2 px-4 flex items-center gap-2">
                  <Image src="/icon.png" alt="KMS Logo" className="h-6 w-6" />
                  <h2 className="text-lg font-semibold tracking-tight">
                    KMS DASHBOARD
                  </h2>
                </div>
                <div className="mb-4 px-4">
                  <p className="text-sm text-gray-600">
                    Welcome, {userSession.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    Role: {userSession.role}
                  </p>
                  <p className="text-xs text-gray-400">{userSession.email}</p>
                </div>
                <div className="space-y-1">
                  {sections.map((section) => (
                    <Button
                      key={section.name}
                      variant={
                        activeSection === section.name ? "secondary" : "ghost"
                      }
                      className="w-full justify-start"
                      onClick={() => handleSectionChange(section.name)}
                    >
                      {section.icon}
                      <span className="ml-2">{section.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-[280px] border-r bg-white flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <div className="mb-2 px-4 flex items-center gap-2">
                <Image src="/icon.png" alt="KMS Logo" width={44} height={44} />
                <h2 className="text-lg font-semibold tracking-tight">
                  KMS DASHBOARD
                </h2>
              </div>
              <div className="mb-4 px-4">
                <p className="text-sm text-gray-600">
                  Welcome, {userSession.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  Role: {userSession.role}
                </p>
                <p className="text-xs text-gray-400">{userSession.email}</p>
              </div>
              <div className="space-y-1">
                {sections.map((section) => (
                  <Button
                    key={section.name}
                    variant={
                      activeSection === section.name ? "secondary" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => handleSectionChange(section.name)}
                  >
                    {section.icon}
                    <span className="ml-2">{section.name}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-auto p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-2">Log Out</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{activeSection}</h1>
          <div className="text-sm text-gray-500">
            Logged in as:{" "}
            <span className="font-medium capitalize">{userSession.role}</span>
          </div>
        </div>

        {/* Quick Actions Section - Only visible on Dashboard */}
        {activeSection === "Dashboard" && quickActions.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action) => (
                <button
                  key={action.name}
                  onClick={action.onClick}
                  className={`flex items-center p-4 rounded-lg shadow-sm bg-gradient-to-r ${action.bgColor} ${action.hoverColor} text-white transition-all duration-200 hover:shadow-md`}
                >
                  <div className="bg-white/20 rounded-full p-2 mr-3">
                    {action.icon}
                  </div>
                  <span className="font-medium">{action.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          {activeSection === "Dashboard" && (
            <DashboardSection setActiveSection={setActiveSection} />
          )}
          {activeSection === "Members" && <MembersSection />}
          {activeSection === "Families" && <FamiliesSection />}
          {activeSection === "Doctors" && <DoctorsSection />}
          {activeSection === "Committies" && <CommittiesSection />}
          {activeSection === "Events" && <EventsSection />}
          {activeSection === "News" && <NewsSection />}
          {activeSection === "Shubh Chintak" && <ShubhChintakSection />}
          {activeSection === "Applications" && <ApplicationsSection />}
          {activeSection === "Donations" && <DonationsSection />}
          {activeSection === "Nari Sahas" && <NariSahasSection />}
        </div>
      </div>
    </div>
  );
}

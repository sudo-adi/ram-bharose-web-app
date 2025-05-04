"use client";
import { useState } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { DashboardSection } from "./components/DashboardSection";
import { MembersSection } from "./components/MembersSection";
import { FamiliesSection } from "./components/FamiliesSection";
import { DoctorsSection } from "./components/DoctorsSection";
import { EventsSection } from "./components/EventsSection";
import { NewsSection } from "./components/NewsSection";
import { ShubhChintakSection } from "./components/ShubhChintakSection";
import { ApplicationsSection } from "./components/ApplicationsSection";
import { DonationsSection } from "./components/DonationsSection";
import { NariSahasSection } from "./components/NariSahasSection";
import { LogOut } from "lucide-react";
import CommittiesSection from "./components/CommittiesSection";

// Remove the section components from this file and keep the rest of the code
export default function Dashboard() {
  const [activeSection, setActiveSection] = useState("Dashboard");

  const sections = [
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

  const handleLogout = () => {
    // Add your logout logic here
    console.log("User logged out");
  };

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
                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                  Organization Dashboard
                </h2>
                <div className="space-y-1">
                  {sections.map((section) => (
                    <Button
                      key={section.name}
                      variant={
                        activeSection === section.name ? "secondary" : "ghost"
                      }
                      className="w-full justify-start"
                      onClick={() => setActiveSection(section.name)}
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
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                Organization Dashboard
              </h2>
              <div className="space-y-1">
                {sections.map((section) => (
                  <Button
                    key={section.name}
                    variant={
                      activeSection === section.name ? "secondary" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setActiveSection(section.name)}
                  >
                    {section.icon}
                    <span className="ml-2">{section.name}</span>
                  </Button>
                ))}
              </div>
              <div className="mt-auto pt-4 border-t">
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
        <h1 className="text-2xl font-bold mb-6">{activeSection}</h1>
        <div className="bg-white rounded-lg shadow p-6">
          {activeSection === "Dashboard" && <DashboardSection />}
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

import React from "react";
import { ApplicationCard } from "./ApplicationCard";
import {
  EventApplication,
  DonationApplication,
  ApplicationType,
} from "./types";
import { FileText } from "lucide-react";

type ApplicationListProps = {
  applications: EventApplication[] | DonationApplication[];
  type: ApplicationType;
  onView: (
    type: ApplicationType,
    application: EventApplication | DonationApplication
  ) => void;
  onUpdateStatus: (
    type: ApplicationType,
    id: number,
    status: "approved" | "rejected"
  ) => void;
  formatDate: (dateString: string) => string;
  searchQuery: string;
};

export const ApplicationList: React.FC<ApplicationListProps> = ({
  applications,
  type,
  onView,
  onUpdateStatus,
  formatDate,
  searchQuery,
}) => {
  if (applications.length === 0) {
    return (
      <div className="py-8 flex flex-col items-center justify-center bg-white rounded-lg border border-dashed border-gray-200">
        <FileText className="h-12 w-12 text-gray-400 mb-2" />
        <p className="text-gray-500 text-base font-medium">
          {searchQuery
            ? `No ${type} applications match your search`
            : `No ${type} applications available`}
        </p>
        <p className="text-gray-400 mt-1 text-sm text-center max-w-md">
          {searchQuery
            ? "Try using different keywords or clear your search"
            : "Check back later for new applications"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {applications.map((application) => (
        <ApplicationCard
          key={application.id}
          application={application}
          type={type}
          onView={onView}
          onUpdateStatus={onUpdateStatus}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

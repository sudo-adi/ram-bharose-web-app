import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Eye,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import {
  EventApplication,
  DonationApplication,
  ApplicationType,
} from "./types";

type ApplicationCardProps = {
  application: EventApplication | DonationApplication;
  type: ApplicationType;
  onView: (
    type: ApplicationType,
    application: EventApplication | DonationApplication
  ) => void;
  onUpdateStatus?: (
    type: ApplicationType,
    id: number,
    status: "approved" | "rejected"
  ) => void;
  formatDate: (dateString: string) => string;
};

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  type,
  onView,
  onUpdateStatus,
  formatDate,
}) => {
  // Determine if this is an event or donation application
  const isEvent = type === "event";
  const eventApp = isEvent ? (application as EventApplication) : null;
  const donationApp = !isEvent ? (application as DonationApplication) : null;

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Get image URL
  const imageUrl = application.image_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/application-pictures/${application.image_url}`
    : "https://via.placeholder.com/150";

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      <div className="relative h-40 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={
            isEvent
              ? eventApp?.name || "Event"
              : donationApp?.cause || "Donation"
          }
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          onError={() => console.log("Error loading image")}
        />
        <div className="absolute top-2 right-2">
          <Badge
            className={`${getStatusColor(
              application.status
            )} text-xs font-medium border px-2 py-1`}
          >
            {application.status?.toUpperCase() || "PENDING"}
          </Badge>
        </div>
      </div>

      <div className="p-3 flex-1">
        <h3 className="text-gray-800 font-medium text-sm line-clamp-1 mb-1">
          {isEvent ? eventApp?.name : donationApp?.cause}
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          Submitted on {formatDate(application.created_at)}
        </p>
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
          {application.description}
        </p>

        <div className="mt-auto text-xs text-gray-600 space-y-1">
          {isEvent ? (
            <>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1 text-orange-500" />
                <span className="truncate">
                  {formatDate(eventApp!.start_at)}
                </span>
              </div>
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1 text-orange-500" />
                <span className="truncate">{eventApp!.duration}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center">
                <DollarSign className="h-3 w-3 mr-1 text-orange-500" />
                <span className="truncate">
                  ₹{donationApp!.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1 text-orange-500" />
                <span className="truncate">
                  Till {formatDate(donationApp!.open_till)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-3 pt-0 border-t border-gray-100 mt-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full border-orange-200 text-white bg-orange-400 hover:bg-orange-500 hover:text-white text-xs"
            onClick={() => onView(type, application)}
          >
            <Eye className="h-3 w-3 mr-1" /> View
          </Button>

          {application.status === "pending" && onUpdateStatus && (
            <div className="flex gap-1 w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-1/2 text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 text-xs"
                onClick={() => onUpdateStatus(type, application.id, "approved")}
              >
                <Check className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-1/2 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 text-xs"
                onClick={() => onUpdateStatus(type, application.id, "rejected")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

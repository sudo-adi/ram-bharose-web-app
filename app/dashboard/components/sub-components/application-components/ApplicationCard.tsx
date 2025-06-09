import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  DollarSign,
  School,
  Briefcase,
  Home,
  Eye,
  Check,
  X,
} from "lucide-react";
import { ApplicationType } from "./types";

type ApplicationCardProps = {
  application: any;
  type: ApplicationType;
  onView: (type: ApplicationType, application: any) => void;
  onUpdateStatus?: (
    type: ApplicationType,
    id: string,
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
  // Only events and donations can be approved
  const canApprove = type === "event" || type === "donation";

  // Get application title based on type
  const getApplicationTitle = () => {
    switch (type) {
      case "event":
        return application.name;
      case "donation":
        return application.cause;
      case "education_loan":
      case "business_loan":
      case "girls_hostel":
      case "mulund_hostel":
      case "vatsalyadham":
        return application.full_name;
      default:
        return "Application";
    }
  };

  // Get icon based on application type
  const getCardIcon = () => {
    switch (type) {
      case "event":
        return <Calendar className="h-3 w-3 mr-1 text-orange-500" />;
      case "donation":
        return <DollarSign className="h-3 w-3 mr-1 text-orange-500" />;
      case "education_loan":
        return <School className="h-3 w-3 mr-1 text-orange-500" />;
      case "business_loan":
        return <Briefcase className="h-3 w-3 mr-1 text-orange-500" />;
      case "girls_hostel":
      case "mulund_hostel":
      case "vatsalyadham":
        return <Home className="h-3 w-3 mr-1 text-orange-500" />;
      default:
        return <Calendar className="h-3 w-3 mr-1 text-orange-500" />;
    }
  };

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
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/application-docs/${application.image_url}`
    : "https://via.placeholder.com/150";

  // Get first detail to show based on application type
  const getPrimaryDetail = () => {
    switch (type) {
      case "event":
        return (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-orange-500" />
            <span className="truncate">{formatDate(application.start_at)}</span>
          </div>
        );
      case "donation":
        return (
          <div className="flex items-center">
            <DollarSign className="h-3 w-3 mr-1 text-orange-500" />
            <span className="truncate">₹{application.amount.toLocaleString()}</span>
          </div>
        );
      case "education_loan":
        return (
          <div className="flex items-center">
            <DollarSign className="h-3 w-3 mr-1 text-orange-500" />
            <span className="truncate">₹{application.loan_amount.toLocaleString()}</span>
          </div>
        );
      case "business_loan":
        return (
          <div className="flex items-center">
            <DollarSign className="h-3 w-3 mr-1 text-orange-500" />
            <span className="truncate">₹{application.loan_amount.toLocaleString()}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-orange-500" />
            <span className="truncate">{formatDate(application.created_at)}</span>
          </div>
        );
    }
  };

  // Get second detail to show based on application type
  const getSecondaryDetail = () => {
    switch (type) {
      case "event":
        return (
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1 text-orange-500" />
            <span className="truncate">{application.duration}</span>
          </div>
        );
      case "donation":
        return (
          <div className="flex items-center">
            <Calendar className="h-3 w-3 mr-1 text-orange-500" />
            <span className="truncate">
              Till {formatDate(application.open_till)}
            </span>
          </div>
        );
      case "education_loan":
        return (
          <div className="flex items-center">
            <School className="h-3 w-3 mr-1 text-orange-500" />
            <span className="truncate">{application.institution_name}</span>
          </div>
        );
      case "business_loan":
        return (
          <div className="flex items-center">
            <Briefcase className="h-3 w-3 mr-1 text-orange-500" />
            <span className="truncate">{application.nature_of_business}</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Only show images for event and donation applications
  const showImage = type === "event" || type === "donation";

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full">
      <div className="relative h-40 w-full overflow-hidden">
        {showImage ? (
          <Image
            src={imageUrl}
            alt={getApplicationTitle()}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            onError={() => console.log("Error loading image")}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            {getCardIcon()}
            <span className="text-sm font-medium text-gray-500 ml-2">{getApplicationTitle()}</span>
          </div>
        )}
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
          {getApplicationTitle()}
        </h3>
        <p className="text-xs text-gray-500 mb-2">
          Submitted on {formatDate(application.created_at)}
        </p>
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
          {application.description}
        </p>

        <div className="mt-auto text-xs text-gray-600 space-y-1">
          {getPrimaryDetail()}
          {getSecondaryDetail()}
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

          {canApprove && application.status === "pending" && onUpdateStatus && (
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

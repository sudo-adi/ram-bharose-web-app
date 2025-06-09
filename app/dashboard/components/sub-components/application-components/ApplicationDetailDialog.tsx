import React, { useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Check,
  X
} from "lucide-react";
import { ApplicationType } from "./types";

type ApplicationDetailDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedApplication: any;
  applicationType: ApplicationType;
  onUpdateStatus: (
    type: ApplicationType,
    id: string,
    status: "approved" | "rejected"
  ) => void;
  formatDate: (dateString: string) => string;
};

export const ApplicationDetailDialog: React.FC<ApplicationDetailDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedApplication,
  applicationType,
  onUpdateStatus,
  formatDate,
}) => {
  if (!selectedApplication) return null;

  const fetchedImageUrl = (selectedApplication.image_url)
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/application-docs/${selectedApplication.image_url}`
    : "https://via.placeholder.com/150";

  const canApproveOrReject = applicationType === "event" || applicationType === "donation";

  // For non-event/donation applications, just show basic view with "Coming soon..." message for approval
  if (applicationType !== "event" && applicationType !== "donation") {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">
              Application Details
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Submitted on {formatDate(selectedApplication.created_at)}
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 mt-4 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="font-medium mb-2 text-gray-700">Application Information</h4>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Status:</span> {selectedApplication.status?.toUpperCase() || "PENDING"}
              </p>
              {/* Show some basic information based on application type */}
              {Object.keys(selectedApplication).map((key, index) => {
                // Skip showing some basic fields and complex objects
                if (['id', 'user_id', 'created_at', 'status', 'image_url'].includes(key) ||
                  typeof selectedApplication[key] === 'object') {
                  return null;
                }
                return (
                  <p key={index} className="text-sm text-gray-600">
                    <span className="font-semibold">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</span>{' '}
                    {selectedApplication[key]?.toString()}
                  </p>
                );
              }).filter(Boolean).slice(0, 10)} {/* Limit to 10 fields for simplicity */}
            </div>
          </div>

          {/* <div className="p-4 bg-yellow-50 rounded-md border border-yellow-200 mt-4">
            <p className="text-center text-yellow-700 font-medium">Approvals coming soon...</p>
          </div> */}
        </DialogContent>
      </Dialog>
    );
  }

  const isEvent = applicationType === "event";

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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            {isEvent
              ? selectedApplication.name
              : `Donation for ${selectedApplication.cause}`
            }
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Submitted on {formatDate(selectedApplication.created_at || selectedApplication.submitted_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Only show images for event and donation applications */}
          {selectedApplication.image_url && (applicationType === "event" || applicationType === "donation") && (
            <div className="w-full h-48 relative rounded-md overflow-hidden border border-gray-200">
              <Image
                src={fetchedImageUrl}
                alt={isEvent ? "Event image" : "Donation image"}
                fill
                className="object-cover hover:scale-105 transition-transform duration-300"
                onError={() => console.log("Error loading image")}
              />
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="font-medium mb-2 text-gray-700">Description</h4>
            <p className="text-sm text-gray-600">{selectedApplication.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isEvent ? (
              <>
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                    <h4 className="font-medium text-gray-700">Start Time</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedApplication.start_at)}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-orange-500" />
                    <h4 className="font-medium text-gray-700">Duration</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedApplication.duration}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-orange-500" />
                    <h4 className="font-medium text-gray-700">Location</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedApplication.location}, {selectedApplication.city}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 mr-2 text-orange-500" />
                    <h4 className="font-medium text-gray-700">Organizers</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedApplication.organizers.join(", ")}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Phone className="h-4 w-4 mr-2 text-orange-500" />
                    <h4 className="font-medium text-gray-700">Contact</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedApplication.contact_phone}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Mail className="h-4 w-4 mr-2 text-orange-500" />
                    <h4 className="font-medium text-gray-700">Email</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedApplication.contact_email}
                  </p>
                </div>
                {selectedApplication.website && (
                  <div className="p-3 bg-white rounded-md border border-gray-200">
                    <div className="flex items-center mb-2">
                      <Globe className="h-4 w-4 mr-2 text-orange-500" />
                      <h4 className="font-medium text-gray-700">Website</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      <a href={selectedApplication.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                        {selectedApplication.website}
                      </a>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 mr-2 text-orange-500" />
                    <h4 className="font-medium text-gray-700">Amount</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    ₹{selectedApplication.amount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                    <h4 className="font-medium text-gray-700">Open Till</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedApplication.open_till)}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="p-3 bg-white rounded-md border border-gray-200">
            <h4 className="font-medium mb-2 text-gray-700">Status</h4>
            <Badge className={`${getStatusColor(selectedApplication.status)}`}>
              {selectedApplication.status?.toUpperCase() || "PENDING"}
            </Badge>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-50"
            onClick={() => {
              onUpdateStatus(
                applicationType,
                selectedApplication.id,
                "approved"
              );
              setIsOpen(false);
            }}
          >
            <Check className="h-4 w-4 mr-1" /> Accept
          </Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={() => {
              onUpdateStatus(
                applicationType,
                selectedApplication.id,
                "rejected"
              );
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4 mr-1" /> Reject
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, DollarSign, Check, X } from "lucide-react";
import {
  EventApplication,
  DonationApplication,
  ApplicationType,
} from "./types";

type ApplicationDetailDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedEvent: EventApplication | null;
  selectedDonation: DonationApplication | null;
  onUpdateStatus: (
    type: ApplicationType,
    id: number,
    status: "approved" | "rejected"
  ) => void;
  formatDate: (dateString: string) => string;
};

export const ApplicationDetailDialog: React.FC<
  ApplicationDetailDialogProps
> = ({
  isOpen,
  setIsOpen,
  selectedEvent,
  selectedDonation,
  onUpdateStatus,
  formatDate,
}) => {
  const application = selectedEvent || selectedDonation;
  if (!application) return null;

  const isEvent = !!selectedEvent;

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
              ? selectedEvent?.name
              : `Donation for ${selectedDonation?.cause}`}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-500">
            Submitted on {formatDate(application.created_at)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {application.image_url && (
            <div className="w-full h-48 relative rounded-md overflow-hidden border border-gray-200">
              <img
                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/application-pictures/${application.image_url}`}
                alt={isEvent ? "Event image" : "Donation image"}
                className="object-cover w-full h-full"
              />
            </div>
          )}

          <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
            <h4 className="font-medium mb-2 text-gray-700">Description</h4>
            <p className="text-sm text-gray-600">{application.description}</p>
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
                    {formatDate(selectedEvent!.start_at)}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 mr-2 text-orange-500" />
                    <h4 className="font-medium text-gray-700">Duration</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedEvent!.duration}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md border border-gray-200 md:col-span-2">
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 mr-2 text-orange-500" />
                    <h4 className="font-medium text-gray-700">Organizers</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedEvent!.organizers.join(", ")}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center mb-2">
                    <DollarSign className="h-4 w-4 mr-2 text-orange-500" />
                    <h4 className="font-medium text-gray-700">Amount</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    ₹{selectedDonation!.amount.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                    <h4 className="font-medium text-gray-700">Open Till</h4>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(selectedDonation!.open_till)}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="p-3 bg-white rounded-md border border-gray-200">
            <h4 className="font-medium mb-2 text-gray-700">Status</h4>
            <Badge className={`${getStatusColor(application.status)}`}>
              {application.status?.toUpperCase() || "PENDING"}
            </Badge>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            className="text-green-600 border-green-600 hover:bg-green-50"
            onClick={() => {
              onUpdateStatus(
                isEvent ? "event" : "donation",
                application.id,
                "approved"
              );
              setIsOpen(false);
            }}
            disabled={application.status !== "pending"}
          >
            <Check className="h-4 w-4 mr-1" /> Accept
          </Button>
          <Button
            variant="outline"
            className="text-red-600 border-red-600 hover:bg-red-50"
            onClick={() => {
              onUpdateStatus(
                isEvent ? "event" : "donation",
                application.id,
                "rejected"
              );
              setIsOpen(false);
            }}
            disabled={application.status !== "pending"}
          >
            <X className="h-4 w-4 mr-1" /> Reject
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

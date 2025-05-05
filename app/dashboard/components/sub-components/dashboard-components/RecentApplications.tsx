import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

type Application = {
  id: number;
  name: string;
  description?: string;
  status?: string;
  created_at: string;
  user_id?: string;
};

type RecentApplicationsProps = {
  applications: Application[];
};

export function RecentApplications({ applications }: RecentApplicationsProps) {
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Get status badge color
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  if (applications.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No recent applications found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {applications.map((app) => (
        <div
          key={app.id}
          className="flex items-start space-x-3 border-b border-gray-100 pb-3"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt="" />
            <AvatarFallback className="bg-orange-100 text-orange-800">
              {app.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium truncate">{app.name}</p>
              <Badge
                variant="outline"
                className={`text-xs ${getStatusColor(app.status)}`}
              >
                {app.status || "pending"}
              </Badge>
            </div>
            <p className="text-xs text-gray-500 truncate">
              {app.description?.substring(0, 60) || "No description"}
              {app.description && app.description.length > 60 ? "..." : ""}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(app.created_at)}
            </p>
          </div>
        </div>
      ))}

      {applications.length > 0 && (
        <div className="pt-2 text-center">
          <a
            href="#"
            className="text-xs text-orange-600 hover:text-orange-800 font-medium"
          >
            View all applications
          </a>
        </div>
      )}
    </div>
  );
}

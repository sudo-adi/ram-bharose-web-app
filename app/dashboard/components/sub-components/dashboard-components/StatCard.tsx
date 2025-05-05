import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Users2,
  Stethoscope,
  UsersRound,
  Calendar,
  ClipboardList,
  HandCoins,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

type StatCardProps = {
  title: string;
  value: number;
  description: string;
  trend: "up" | "down" | "same";
  trendValue: string;
  icon: string;
};

export function StatCard({
  title,
  value,
  description,
  trend,
  trendValue,
  icon,
}: StatCardProps) {
  const renderIcon = () => {
    switch (icon) {
      case "users":
        return <Users className="h-8 w-8 text-orange-500" />;
      case "users2":
        return <Users2 className="h-8 w-8 text-blue-500" />;
      case "stethoscope":
        return <Stethoscope className="h-8 w-8 text-green-500" />;
      case "usersRound":
        return <UsersRound className="h-8 w-8 text-purple-500" />;
      case "calendar":
        return <Calendar className="h-8 w-8 text-indigo-500" />;
      case "clipboardList":
        return <ClipboardList className="h-8 w-8 text-red-500" />;
      case "handCoins":
        return <HandCoins className="h-8 w-8 text-yellow-500" />;
      default:
        return <Users className="h-8 w-8 text-gray-500" />;
    }
  };

  const renderTrend = () => {
    if (trend === "up") {
      return (
        <div className="flex items-center text-green-600">
          <TrendingUp className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">{trendValue}</span>
        </div>
      );
    } else if (trend === "down") {
      return (
        <div className="flex items-center text-red-600">
          <TrendingDown className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">{trendValue}</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-600">
          <Minus className="h-4 w-4 mr-1" />
          <span className="text-xs font-medium">{trendValue}</span>
        </div>
      );
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold mt-1">
              {value.toLocaleString()}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-full">{renderIcon()}</div>
        </div>
        <div className="mt-4">{renderTrend()}</div>
      </CardContent>
    </Card>
  );
}

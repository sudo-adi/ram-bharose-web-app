import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Phone, Mail } from "lucide-react";

type Birthday = {
  id: string;
  name: string;
  age: string;
  date: string;
  image: string;
  phone?: string;
  email?: string;
};

type BirthdayListProps = {
  birthdays: Birthday[];
  loading: boolean;
};

export function BirthdayList({ birthdays, loading }: BirthdayListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (birthdays.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No birthdays today</p>
      </div>
    );
  }

  const handleCall = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`);
  };

  return (
    <div className="space-y-4">
      {birthdays.map((birthday) => (
        <div
          key={birthday.id}
          className="flex items-center space-x-3 border-b border-gray-100 pb-3 last:border-0"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={birthday.image} alt={birthday.name} />
            <AvatarFallback className="bg-orange-100 text-orange-800">
              {birthday.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{birthday.name}</p>
            <p className="text-xs text-gray-500">
              Turning {birthday.age} today
            </p>
          </div>
          <div className="flex space-x-1">
            {birthday.phone && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-orange-600"
                onClick={() => handleCall(birthday.phone || "")}
              >
                <Phone className="h-4 w-4" />
              </Button>
            )}
            {birthday.email && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-orange-600"
                onClick={() => handleEmail(birthday.email || "")}
              >
                <Mail className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

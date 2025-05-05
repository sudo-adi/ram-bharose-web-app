import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

type Event = {
  id: number;
  name: string;
  description: string;
  start_at: string;
  duration: string;
  location?: string;
  organizers: string[];
  image_url?: string;
};

type UpcomingEventsProps = {
  limit?: number;
};

export function UpcomingEvents({ limit = 3 }: UpcomingEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        
        // Get current date in ISO format
        const now = new Date().toISOString();
        
        // Fetch upcoming events
        const { data, error } = await supabase
          .from("event_applications")
          .select("*")
          .gte("start_at", now)
          .order("start_at")
          .limit(limit);
          
        if (error) throw error;
        
        setEvents(data || []);
      } catch (err: any) {
        console.error("Error fetching upcoming events:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpcomingEvents();
  }, [limit]);
  
  // Format date for display
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };
  
  // Format time for display
  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>Error loading events</p>
      </div>
    );
  }
  
  if (events.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No upcoming events scheduled</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 text-orange-800 rounded-md p-2 text-center min-w-[60px]">
              <div className="text-xs font-semibold">
                {formatEventDate(event.start_at).split(", ")[0]}
              </div>
              <div className="text-lg font-bold">
                {new Date(event.start_at).getDate()}
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{event.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                {event.description}
              </p>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                <div className="flex items-center text-xs text-gray-600">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>{formatEventDate(event.start_at)}</span>
                </div>
                
                <div className="flex items-center text-xs text-gray-600">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatEventTime(event.start_at)}</span>
                </div>
                
                {event.location && (
                  <div className="flex items-center text-xs text-gray-600">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{event.location}</span>
                  </div>
                )}
                
                <div className="flex items-center text-xs text-gray-600">
                  <Users className="h-3 w-3 mr-1" />
                  <span>{event.organizers?.length || 0} organizers</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      
      <div className="pt-2 text-center">
        <Button 
          variant="link" 
          className="text-xs text-orange-600 hover:text-orange-800 font-medium"
          onClick={() => window.location.href = "/dashboard?section=Events"}
        >
          View all events
        </Button>
      </div>
    </div>
  );
}
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Event } from "./types";
import { formatDate } from "@/lib/utils";

interface EventListProps {
    events: Event[];
    searchQuery: string;
}

export function EventList({ events, searchQuery }: EventListProps) {
    if (events.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">
                    {searchQuery
                        ? `No events found matching "${searchQuery}"`
                        : "No events scheduled"}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {event.description}
                        </p>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4 text-orange-500" />
                                <span>{formatDate(event.event_date)}</span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4 text-orange-500" />
                                <span>
                                    {event.start_time} - {event.end_time}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4 text-orange-500" />
                                <span>{event.location}, {event.city}</span>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Badge variant="secondary" className="bg-orange-50 text-orange-600">
                                {event.organizer_name}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

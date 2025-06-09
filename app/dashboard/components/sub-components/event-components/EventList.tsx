"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin } from "lucide-react";
import { Event } from "./types";
import { formatDate } from "@/lib/utils";
import Image from "next/image";

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
                <Card key={event.id} className="overflow-hidden">
                    {event.image_url && (
                        <div className="relative h-48 w-full">
                            <Image
                                src={event.image_url}
                                alt={event.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    <CardContent className="p-4">
                        <h3 className="text-xl font-semibold mb-2">
                            {event.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {event.description}
                        </p>

                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span className="text-sm">
                                    {formatDate(event.start_at)} ({event.duration})
                                </span>
                            </div>

                            <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span className="text-sm">
                                    {event.location}, {event.city}
                                </span>
                            </div>

                            {event.organizers && event.organizers.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {event.organizers.map((organizer, index) => (
                                        <Badge key={index} variant="secondary">
                                            {organizer}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

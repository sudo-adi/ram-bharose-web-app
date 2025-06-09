"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign } from "lucide-react";
import { Donation } from "./types";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

interface DonationListProps {
    donations: Donation[];
    searchQuery: string;
}

export function DonationList({ donations, searchQuery }: DonationListProps) {
    // Filter donations by search query on title, cause, or description
    const filteredDonations = donations.filter(donation => {
        const searchString = searchQuery.toLowerCase();
        return (
            donation.cause.toLowerCase().includes(searchString) ||
            donation.description.toLowerCase().includes(searchString)
        );
    });

    if (filteredDonations.length === 0) {
        return (
            <div className="text-center py-10">
                <p className="text-gray-500">
                    {searchQuery
                        ? `No donations found matching "${searchQuery}"`
                        : "No donations available"}
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDonations.map((donation) => (
                <Card key={donation.id} className="overflow-hidden">
                    {donation.image_url && (
                        <div className="relative h-48 w-full">
                            <Image
                                src={donation.image_url}
                                alt={donation.cause}
                                fill
                                className="object-cover"
                            />
                        </div>
                    )}
                    <CardContent className="p-4">
                        <h3 className="text-xl font-semibold mb-2">
                            {donation.cause}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {donation.description}
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Target Amount</span>
                                <span className="text-sm font-bold">₹{donation.amount.toLocaleString()}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Collected</span>
                                <span className="text-sm font-bold">₹{donation.collected_amount?.toLocaleString() || 0}</span>
                            </div>

                            {/* Progress bar */}
                            <Progress
                                value={(donation.collected_amount / donation.amount) * 100}
                                className="h-2 bg-gray-100"
                            />

                            <div className="flex items-center mt-2">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span className="text-sm">
                                    Open till: {formatDate(donation.open_till)}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
                                    <DollarSign className="w-3 h-3 mr-1" />
                                    Donation
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

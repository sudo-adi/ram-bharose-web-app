"use client";

import React, { useState } from "react";
import { useBusiness } from "@/hooks/useSupabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from "lucide-react";

type Business = {
  id: string;
  user_id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  contact_email: string;
  contact_phone: string;
  website: string;
  created_at: string;
  images?: string[]; // Array of image URLs for the carousel
  logo?: string; // Business logoURL
  owner?: {
    name: string;
    image: string;
  };
  image_url?: string;
};

export default function NariSahasSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: businesses, loading, error } = useBusiness();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-pink-50">
        <p className="text-pink-600">Loading businesses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-pink-50">
        <p className="text-red-600">Error loading businesses</p>
      </div>
    );
  }

  // Fallback to sample data if no businesses are found


  // Fix 1: Add null check for businesses
  const displayBusinesses = businesses || [];

  // Fix 2: Ensure displayBusinesses is not null before filtering
  const filteredBusinesses = displayBusinesses.filter(
    (business) =>
      business.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      business.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBusinessClick = (business: Business) => {
    setSelectedBusiness(business);
    setCurrentImageIndex(0);
    setModalOpen(true);
  };

  const nextImage = () => {
    if (selectedBusiness?.images) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === selectedBusiness.images!.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedBusiness?.images) {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === 0 ? selectedBusiness.images!.length - 1 : prevIndex - 1
      );
    }
  };

  return (
    <div className="bg-pink-50 p-6 rounded-lg m-0">
      <h2 className="text-2xl font-bold text-pink-800 mb-6">
        Nari Sahas Businesses
      </h2>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex items-center bg-white rounded-xl px-4 py-3 border border-pink-100">
          <Search className="h-5 w-5 text-pink-700" />
          <Input
            className="flex-1 ml-2 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-800 placeholder:text-gray-400"
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex overflow-x-auto pb-2 mb-6 no-scrollbar">
        {[
          "All",
          "Food & Beverages",
          "Retail",
          "Technology",
          "Health & Beauty",
          "Arts & Crafts",
        ].map((category) => (
          <Button
            key={category}
            variant={category === "All" ? "default" : "outline"}
            className={`mr-2 whitespace-nowrap ${category === "All"
              ? "bg-pink-600 hover:bg-pink-700"
              : "border-pink-200 text-pink-700"
              }`}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Business Cards Grid */}
      {filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBusinesses.map((business) => (
            <Card
              key={business.id}
              className="overflow-hidden border border-pink-100 hover:shadow-md transition-shadow duration-200"
              onClick={() => handleBusinessClick(business)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  {business.images && business.images.length > 0 && (
                    <div className="relative w-full h-48">
                      <Image
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/application-docs/${business.image_url}` || business.images[0]}
                        alt={business.name}
                        fill
                        className="object-cover"
                      />
                      {business.logo && (
                        <div className="absolute top-2 right-2 w-10 h-10 rounded-full border-2 border-white overflow-hidden">
                          <Image
                            src={business.logo}
                            alt="Logo"
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-pink-800">
                    {business.name}
                  </h3>
                  <p className="text-pink-600 text-sm">{business.category}</p>

                  {business.owner && (
                    <div className="flex items-center mt-2 mb-2">
                      <div className="relative w-6 h-6 rounded-full overflow-hidden mr-2">
                        <Image
                          src={business.owner.image}
                          alt={business.owner.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <p className="text-gray-700 text-xs">
                        {business.owner.name}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center mb-2">
                    <MapPin className="h-3.5 w-3.5 text-pink-700" />
                    <p className="text-gray-600 text-xs ml-1">
                      {business.location}
                    </p>
                  </div>

                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {business.description}
                  </p>

                  {/* Contact Buttons */}
                  <div className="flex justify-between mt-2">
                    <Link
                      href={`tel:${business.contact_phone}`}
                      className="bg-pink-500 hover:bg-pink-600 py-2 px-3 rounded-lg flex items-center justify-center flex-1 mr-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="h-4 w-4 text-white" />
                    </Link>

                    <Link
                      href={`https://wa.me/${business.contact_phone.replace(
                        /\D/g,
                        ""
                      )}`}
                      className="bg-green-500 hover:bg-green-600 py-2 px-3 rounded-lg flex items-center justify-center flex-1 mr-2"
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                    >
                      <MessageCircle className="h-4 w-4 text-white" />
                    </Link>

                    <Link
                      href={
                        business.website.startsWith("http")
                          ? business.website
                          : `https://${business.website}`
                      }
                      className="bg-pink-700 hover:bg-pink-800 py-2 px-3 rounded-lg flex items-center justify-center flex-1"
                      onClick={(e) => e.stopPropagation()}
                      target="_blank"
                    >
                      <Globe className="h-4 w-4 text-white" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="bg-pink-100 p-4 rounded-full mb-4">
            <Search className="h-12 w-12 text-pink-400" />
          </div>
          <p className="text-pink-400 text-center">
            No businesses found matching your search
          </p>
        </div>
      )}

      {/* Business Detail Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Business Details</DialogTitle>
          </DialogHeader>

          {selectedBusiness && (
            <div className="space-y-6">
              {/* Image Carousel */}
              {selectedBusiness.images &&
                selectedBusiness.images.length > 0 && (
                  <div className="relative w-full h-64 md:h-80 rounded-xl overflow-hidden">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/application-docs/${selectedBusiness.image_url}` || selectedBusiness.images[0]}
                      alt={selectedBusiness.name}
                      fill
                      className="object-cover"
                    />

                    {/* Image Navigation */}
                    <div className="absolute inset-0 flex items-center justify-between px-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/30 hover:bg-black/40 text-white rounded-full h-10 w-10"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-black/30 hover:bg-black/40 text-white rounded-full h-10 w-10"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </Button>
                    </div>

                    {/* Image Indicators */}
                    <div className="absolute bottom-2 w-full flex justify-center space-x-1">
                      {selectedBusiness.images.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${index === currentImageIndex
                            ? "bg-white"
                            : "bg-white/50"
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

              {/* Business Header with Logo */}
              <div className="flex items-center justify-center">
                {selectedBusiness.logo && (
                  <div className="relative w-14 h-14 rounded-full border-2 border-pink-100 overflow-hidden mr-3">
                    <Image
                      src={selectedBusiness.logo}
                      alt={`${selectedBusiness.name} logo`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-pink-800">
                    {selectedBusiness.name}
                  </h2>
                  <p className="text-pink-600 text-base">
                    {selectedBusiness.category}
                  </p>
                </div>
              </div>
              {/* Owner Information */}
              {selectedBusiness.owner && (
                <div className="flex items-center bg-pink-50 p-3 rounded-lg">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
                    <Image
                      src={selectedBusiness.owner.image}
                      alt={selectedBusiness.owner.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Owner</p>
                    <p className="text-base font-medium text-pink-800">
                      {selectedBusiness.owner.name}
                    </p>
                  </div>
                </div>
              )}

              {/* Contact Actions */}
              <div className="flex justify-around">
                <Link
                  href={`tel:${selectedBusiness.contact_phone}`}
                  className="flex flex-col items-center"
                >
                  <div className="bg-pink-500 hover:bg-pink-600 w-12 h-12 rounded-full flex items-center justify-center mb-1">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-600">Call</span>
                </Link>

                <Link
                  href={`https://wa.me/${selectedBusiness.contact_phone.replace(
                    /\D/g,
                    ""
                  )}`}
                  className="flex flex-col items-center"
                  target="_blank"
                >
                  <div className="bg-green-500 hover:bg-green-600 w-12 h-12 rounded-full flex items-center justify-center mb-1">
                    <MessageCircle className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-600">WhatsApp</span>
                </Link>

                <Link
                  href={`mailto:${selectedBusiness.contact_email}`}
                  className="flex flex-col items-center"
                >
                  <div className="bg-pink-600 hover:bg-pink-700 w-12 h-12 rounded-full flex items-center justify-center mb-1">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-600">Email</span>
                </Link>

                <Link
                  href={
                    selectedBusiness.website.startsWith("http")
                      ? selectedBusiness.website
                      : `https://${selectedBusiness.website}`
                  }
                  className="flex flex-col items-center"
                  target="_blank"
                >
                  <div className="bg-pink-700 hover:bg-pink-800 w-12 h-12 rounded-full flex items-center justify-center mb-1">
                    <Globe className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs text-gray-600">Website</span>
                </Link>
              </div>

              {/* Business Description */}
              <div>
                <h3 className="text-lg font-semibold text-pink-800 mb-2">
                  About
                </h3>
                <p className="text-gray-700">{selectedBusiness.description}</p>
              </div>

              {/* Business Location */}
              <div>
                <h3 className="text-lg font-semibold text-pink-800 mb-2">
                  Location
                </h3>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-pink-600 mr-2 mt-0.5" />
                  <p className="text-gray-700">{selectedBusiness.location}</p>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-pink-800 mb-2">
                  Contact Information
                </h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-pink-600 mr-2 mt-0.5" />
                    <p className="text-gray-700">
                      {selectedBusiness.contact_phone}
                    </p>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-pink-600 mr-2 mt-0.5" />
                    <p className="text-gray-700">
                      {selectedBusiness.contact_email}
                    </p>
                  </div>
                  <div className="flex items-start">
                    <Globe className="h-5 w-5 text-pink-600 mr-2 mt-0.5" />
                    <p className="text-gray-700">{selectedBusiness.website}</p>
                  </div>
                </div>
              </div>

              {/* Created At Information */}
              <div>
                <h3 className="text-lg font-semibold text-pink-800 mb-2">
                  Additional Information
                </h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(selectedBusiness.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

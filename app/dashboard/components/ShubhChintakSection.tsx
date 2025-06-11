"use client";

import { useState, useEffect } from "react";
import { useShubhChintak } from "@/hooks/useSupabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, X, FileText, RefreshCw, ExternalLink } from "lucide-react";
import Image from "next/image";

export const ShubhChintakSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: magazines, loading, error, refetch } = useShubhChintak();

  // Filter magazines based on search query
  const filteredMagazines =
    magazines?.filter((magazine: any) =>
      magazine.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Handle opening the magazine PDF
  const handleOpenMagazine = (link: string) => {
    if (link) {
      window.open(link, "_blank");
    } else {
      console.error("No link available for this magazine");
      alert("This magazine is not available at the moment.");
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  if (loading && !magazines) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 bg-white rounded-lg">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-sm text-gray-500 font-medium">
              Loading magazines...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 bg-white rounded-lg">
        <div className="flex justify-center items-center h-64">
          <Alert variant="destructive" className="max-w-md">
            <AlertDescription className="space-y-4">
              <p>Error loading magazines: {error.message}</p>
              <Button
                variant="outline"
                className="w-full bg-orange-500 text-white hover:bg-orange-600"
                onClick={handleRefresh}
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Shubh Chintak Magazines
            </h2>
            <p className="text-sm text-gray-500">
              Browse and read our collection of digital magazines
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="mt-2 sm:mt-0 border-gray-200 hover:bg-gray-50 hover:text-orange-600"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span className="text-xs">Refreshing</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="text-xs">Refresh</span>
              </span>
            )}
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <Input
            type="text"
            placeholder="Search magazines..."
            className="pl-10 bg-white border-gray-200 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-700"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* Magazines Grid */}
        {filteredMagazines.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMagazines.map((magazine: any) => (
              <div
                key={magazine.id}
                className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={
                      magazine.cover_image_link ||
                      "https://via.placeholder.com/150"
                    }
                    alt={magazine.name}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    onError={() => console.log("Error loading cover image")}
                  />
                </div>
                <div className="p-2 flex-1">
                  <h3 className="text-gray-800 font-medium text-sm line-clamp-2">
                    {magazine.name}
                  </h3>
                </div>
                <button
                  onClick={() => handleOpenMagazine(magazine.link)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium py-2 flex items-center justify-center gap-1"
                >
                  <ExternalLink className="h-3 w-3" /> Read Now
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center bg-white rounded-lg border border-dashed border-gray-200">
            <FileText className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500 text-base font-medium">
              {searchQuery
                ? "No magazines match your search"
                : "No magazines available"}
            </p>
            <p className="text-gray-400 mt-1 text-sm text-center max-w-md">
              {searchQuery
                ? "Try using different keywords or clear your search"
                : "Check back later for new publications"}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ShubhChintakSection;

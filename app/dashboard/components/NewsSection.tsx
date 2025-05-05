"use client";

import { useState } from "react";
import Image from "next/image";
import { useNews } from "@/hooks/useSupabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Search,
  X,
  BookmarkIcon,
  ShareIcon,
  RefreshCw,
  Newspaper,
} from "lucide-react";

interface Article {
  id: string;
  user_id: string;
  title: string;
  body: string;
  image: string;
  created_at: string;
  userName: string;
}

const NewsSection = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);

  const {
    data: newsArticles,
    loading,
    error,
    refetch: refetchNews,
  } = useNews();

  // Filter articles based on search query
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!newsArticles) return;

    if (query.trim() === "") {
      setFilteredArticles([]);
      return;
    }

    const filtered = newsArticles.filter(
      (article) =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.body.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredArticles(filtered);
  };

  const handleArticlePress = (article: Article) => {
    setSelectedArticle(article);
    setModalOpen(true);
  };

  const handleRefresh = () => {
    refetchNews();
  };

  const displayArticles = searchQuery ? filteredArticles : newsArticles || [];

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 bg-white rounded-lg">
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
            <p className="text-sm text-gray-500 font-medium">
              Loading news articles...
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
              <p>{error?.message || "Error loading news articles"}</p>
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
            <h2 className="text-xl font-bold text-gray-800">News & Updates</h2>
            <p className="text-sm text-gray-500">
              Stay informed with the latest community news
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
            placeholder="Search news..."
            className="pl-10 bg-white border-gray-200 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <button
              className="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-700"
              onClick={() => handleSearch("")}
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>

        {/* News Categories */}
        <div className="flex overflow-x-auto mb-6 pb-2 no-scrollbar">
          {["All", "Events", "Education", "Health", "Culture"].map(
            (category) => (
              <button
                key={category}
                className={`mr-2 px-4 py-2 rounded-full ${
                  category === "All"
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700"
                } font-medium whitespace-nowrap`}
              >
                {category}
              </button>
            )
          )}
        </div>

        {/* News Articles Grid */}
        {displayArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {displayArticles.map((article) => (
              <div
                key={article.id}
                className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer"
                onClick={() => handleArticlePress(article)}
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1000";
                    }}
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-500 text-xs">
                      {formatDate(article.created_at)}
                    </p>
                  </div>
                  <h3 className="text-gray-800 font-medium text-lg line-clamp-2 mb-2">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-3 flex-grow">
                    {article.body}
                  </p>
                  <div className="flex items-center mt-auto pt-2 border-t border-gray-100">
                    <div className="w-6 h-6 bg-gray-200 rounded-full mr-2" />
                    <p className="text-gray-700 text-xs">{article.userName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center bg-white rounded-lg border border-dashed border-gray-200">
            <Newspaper className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-500 text-base font-medium">
              {searchQuery
                ? "No articles match your search"
                : "No articles available"}
            </p>
            <p className="text-gray-400 mt-1 text-sm text-center max-w-md">
              {searchQuery
                ? "Try using different keywords or clear your search"
                : "Check back later for news updates"}
            </p>
          </div>
        )}
      </div>

      {/* Article Detail Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
          {selectedArticle && (
            <>
              <DialogHeader>
                <DialogTitle className="sr-only">Article Details</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative w-full h-56 rounded-xl overflow-hidden">
                  <Image
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Article Content */}
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">
                    {selectedArticle.title}
                  </h1>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full mr-2" />
                      <p className="text-gray-700">
                        {selectedArticle.userName}
                      </p>
                    </div>
                    <p className="text-gray-500 text-sm">
                      {formatDate(selectedArticle.created_at)}
                    </p>
                  </div>

                  {/* Article Text */}
                  <p className="text-gray-800 leading-6 mb-6">
                    {selectedArticle.body}
                  </p>

                  {/* Share and Bookmark */}
                  <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                    <button className="flex items-center">
                      <ShareIcon size={20} className="text-gray-600" />
                      <span className="text-gray-700 ml-2">Share</span>
                    </button>
                    <button className="flex items-center">
                      <BookmarkIcon size={20} className="text-gray-600" />
                      <span className="text-gray-700 ml-2">Save</span>
                    </button>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                  onClick={() => setModalOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewsSection;

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

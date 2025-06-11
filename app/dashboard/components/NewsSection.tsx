"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useNews } from "@/hooks/useSupabase";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Search,
  X,
  BookmarkIcon,
  ShareIcon,
  RefreshCw,
  Newspaper,
  Plus,
  Upload,
  Loader2,
} from "lucide-react";

interface Article {
  id: string;
  title: string;
  body: string;
  header_image_url: string;
  created_at: string;
  userName: string;
}

const NewsSection = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);

  // Add news states
  const [isAddMode, setIsAddMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: "",
    body: "",
  });

  const {
    data: newsArticles,
    loading,
    error,
    refetch: refetchNews,
  } = useNews();

  // console.log("Rendering NewsSection with newsArticles:", newsArticles);
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

  const handleOpenAddDialog = () => {
    setNewsForm({ title: "", body: "" });
    setImageFile(null);
    setImagePreview(null);
    setIsSubmitting(false);
    setIsAddMode(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validate form
      if (!newsForm.title.trim() || !newsForm.body.trim()) {
        alert("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // 1. Create news article entry
      const { data: articleData, error: articleError } = await supabase
        .from("articles")
        .insert([
          {
            title: newsForm.title,
            body: newsForm.body,
            header_image_url: "", // Will be updated after image upload
          },
        ])
        .select()
        .single();

      if (articleError || !articleData) {
        throw new Error(articleError?.message || "Error creating article");
      }

      if (imageFile) {
        // 2. Upload image to storage
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${articleData.id}.${fileExt}`;
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("articles")
          .upload(fileName, imageFile);

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        // 3. Get public URL and update article
        const {
          data: { publicUrl },
        } = supabase.storage.from("articles").getPublicUrl(fileName);

        const { error: updateError } = await supabase
          .from("articles")
          .update({ header_image_url: publicUrl })
          .eq("id", articleData.id);

        if (updateError) {
          throw new Error(updateError.message);
        }
      }

      // Reset form and refresh articles
      setNewsForm({ title: "", body: "" });
      setImageFile(null);
      setImagePreview(null);
      setIsAddMode(false);
      await refetchNews();
    } catch (error) {
      console.error("Error submitting article:", error);
      alert(
        error instanceof Error ? error.message : "Error submitting article"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  const displayArticles = searchQuery ? filteredArticles : newsArticles || [];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewsForm((prev) => ({ ...prev, [name]: value }));
  };

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

          <div className="flex gap-2 mt-2 sm:mt-0">
            <Button
              onClick={handleOpenAddDialog}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Post News
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="border-gray-200 hover:bg-gray-50 hover:text-orange-600"
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
                    src={article.header_image_url}
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
                    src={selectedArticle.header_image_url}
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

      {/* Add/Edit News Dialog */}
      <Dialog open={isAddMode} onOpenChange={setIsAddMode}>
        <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedArticle ? "Edit Article" : "Post a New Article"}
            </DialogTitle>
            <DialogDescription>
              {selectedArticle
                ? "Edit the details of the article"
                : "Fill in the details to post a new article"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title Input */}
            <div>
              <Label htmlFor="title" className="font-medium">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                type="text"
                placeholder="Enter article title"
                className="mt-1 bg-white border-gray-200 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                value={newsForm.title}
                onChange={handleInputChange}
              />
            </div>

            {/* Body Textarea */}
            <div>
              <Label htmlFor="body" className="font-medium">
                Body
              </Label>
              <Textarea
                id="body"
                name="body"
                placeholder="Enter article body"
                className="mt-1 bg-white border-gray-200 focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                value={newsForm.body}
                onChange={handleInputChange}
                rows={4}
              />
            </div>

            {/* Image Upload */}
            <div>
              <Label className="font-medium">Header Image</Label>
              <div className="flex items-center gap-4 mt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center bg-orange-500 text-white rounded-md px-4 py-2 hover:bg-orange-600 transition-all duration-200"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Upload Image
                </button>
                {imagePreview && (
                  <div className="relative h-20 w-20 rounded-md overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Image preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsAddMode(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Post Article"
              )}
            </Button>
          </DialogFooter>
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

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Save, Eye, Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import { ImageUpload } from "@/components/image-upload";
import Link from "next/link";
import Image from "next/image";

interface EditArtworkPageProps {
  params: {
    id: string;
  };
}

export default function EditArtworkPage({ params }: EditArtworkPageProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [price, setPrice] = useState("");
  const [forSale, setForSale] = useState("no");
  const [medium, setMedium] = useState("");
  const [yearCreated, setYearCreated] = useState("");
  const [status, setStatus] = useState("PUBLISHED");
  const [files, setFiles] = useState<any[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  interface ArtworkData {
    id: string;
    title: string;
    description?: string;
    slug: string;
    artistId: string;
    categoryId?: string;
    tags: Array<{
      id: string;
      name: string;
      color?: string;
      usageCount: number;
    }>;
    images: Array<{
      id: string;
      artworkId: string;
      url: string;
      altText?: string;
      isPrimary: boolean;
      order: number;
      width?: number;
      height?: number;
      fileSize?: number;
      createdAt: Date;
    }>;
    price?: number;
    currency?: string;
    isForSale: boolean;
    licenseType?: "PERSONAL" | "COMMERCIAL" | "EXCLUSIVE";
    status: string;
    medium?: string;
    yearCreated?: number;
    dimensions?: any;
    views: number;
    likes: number;
    comments: number;
    createdAt: Date;
    updatedAt: Date;
    publishedAt?: Date;
  }

  const [artwork, setArtwork] = useState<ArtworkData | null>(null);

  useEffect(() => {
    if (user && user.role !== "ARTIST") {
      router.push("/");
    }
  }, [user, router]);

  // Fetch artwork data
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setFetchLoading(true);
        setError(null);

        const response = await apiClient.getArtwork(params.id);

        if (response.success && response.data) {
          const artworkData = response.data as ArtworkData;
          setArtwork(artworkData);

          // Populate form fields
          setTitle(artworkData.title || "");
          setDescription(artworkData.description || "");
          setCategory(artworkData.categoryId || "");
          setTags(artworkData.tags?.map((tag) => tag.name) || []);
          setPrice(artworkData.price ? artworkData.price.toString() : "");
          setForSale(artworkData.isForSale ? "yes" : "no");
          setMedium(artworkData.medium || "");
          setYearCreated(
            artworkData.yearCreated ? artworkData.yearCreated.toString() : ""
          );
          setStatus(artworkData.status || "PUBLISHED");

          // Convert artwork images to file format
          if (artworkData.images && artworkData.images.length > 0) {
            const imageFiles = artworkData.images.map(
              (img: any, index: number) => ({
                name: `image_${index}.jpg`,
                url: img.url,
                width: img.width,
                height: img.height,
                public_id: img.public_id || `artwork_${params.id}_${index}`,
              })
            );
            setFiles(imageFiles);
          }
        } else {
          setError(response.error || "Failed to fetch artwork");
        }
      } catch (error: any) {
        setError(error.message || "Failed to fetch artwork");
      } finally {
        setFetchLoading(false);
      }
    };

    if (params.id) {
      fetchArtwork();
    }
  }, [params.id]);

  const categories = [
    "Digital Art",
    "Photography",
    "Painting",
    "Sculpture",
    "Mixed Media",
    "Illustration",
    "Abstract",
    "Portrait",
    "Landscape",
    "Still Life",
  ];

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (
    e: React.FormEvent,
    saveStatus: string = "PUBLISHED"
  ) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const artworkData = {
        title,
        description,
        categoryId: category,
        tags,
        price: price ? Number.parseFloat(price) : undefined,
        isForSale: forSale !== "no",
        medium,
        yearCreated: yearCreated ? Number.parseInt(yearCreated) : undefined,
        status: saveStatus,
      };

      const response = await apiClient.updateArtwork(params.id, artworkData);

      if (response.success) {
        toast({
          title: "Success!",
          description: `Artwork ${
            saveStatus === "DRAFT" ? "saved as draft" : "updated"
          } successfully.`,
        });
        router.push("/artist/dashboard");
      } else {
        throw new Error(response.error || "Update failed");
      }
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error updating your artwork. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  if (!user || user.role !== "ARTIST") {
    return null;
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-32 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                Error: {error}
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button onClick={() => router.push("/artist/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button variant="ghost" asChild>
                <Link href="/artist/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Artwork
            </h1>
            <p className="text-gray-600">
              Update your artwork details and settings
            </p>
          </div>

          <form
            onSubmit={(e) => handleSubmit(e, "PUBLISHED")}
            className="space-y-8"
          >
            {/* Current Images */}
            <Card>
              <CardHeader>
                <CardTitle>Current Images</CardTitle>
                <CardDescription>
                  These are the current images for your artwork
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map((file, index) => (
                    <div key={index} className="relative aspect-square">
                      <Image
                        src={file.url}
                        alt={`Artwork image ${index + 1}`}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Note: Image management is currently not available in edit
                  mode. Please contact support if you need to change images.
                </p>
              </CardContent>
            </Card>

            {/* Artwork Details */}
            <Card>
              <CardHeader>
                <CardTitle>Artwork Details</CardTitle>
                <CardDescription>
                  Update information about your artwork
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter artwork title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={category}
                      onValueChange={setCategory}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="medium">Medium</Label>
                    <Input
                      id="medium"
                      placeholder="e.g., Oil on canvas, Digital, Acrylic"
                      value={medium}
                      onChange={(e) => setMedium(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="yearCreated">Year Created</Label>
                    <Input
                      id="yearCreated"
                      type="number"
                      placeholder="e.g., 2024"
                      value={yearCreated}
                      onChange={(e) => setYearCreated(e.target.value)}
                      min="1900"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your artwork, inspiration, techniques used..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="px-3 py-1"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tags (press Enter)"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Button type="button" variant="outline" onClick={addTag}>
                      Add
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Availability</CardTitle>
                <CardDescription>
                  Update pricing information for your artwork
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Is this artwork for sale?</Label>
                  <Select value={forSale} onValueChange={setForSale}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no">Not for sale</SelectItem>
                      <SelectItem value="yes">For sale</SelectItem>
                      <SelectItem value="prints">Prints available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {forSale !== "no" && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Publication Status</CardTitle>
                <CardDescription>
                  Set the visibility status of your artwork
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/artist/dashboard")}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || !title || !category}
                onClick={(e) => handleSubmit(e, "DRAFT")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !title || !category}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Artwork
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import type React from "react";

import { useState } from "react";
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
import { X, Save, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { ImageUpload } from "@/components/image-upload";

export default function UploadArtworkPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [price, setPrice] = useState("");
  const [forSale, setForSale] = useState("no");
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && user.role !== "ARTIST") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || user.role !== "ARTIST") {
    return null;
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const artworkData = {
        title,
        description,
        categoryId: category, // This should be the category name as selected
        tags,
        images: files.map((file, index) => ({
          url: file.url,
          altText: title,
          isPrimary: index === 0,
          width: file.width,
          height: file.height,
          fileSize: file.size,
          cloudinary_public_id: file.public_id,
        })),
        price: price ? Number.parseFloat(price) : undefined,
        isForSale: forSale !== "no",
        status: "PUBLISHED" as const,
      };

      const response = await fetch("/api/artist/artworks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(artworkData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Success!",
          description: "Your artwork has been published successfully.",
        });
        router.push("/artist/dashboard");
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "There was an error uploading your artwork. Please try again.",
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Upload Artwork
            </h1>
            <p className="text-gray-600">
              Share your creativity with the world
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Images</CardTitle>
                <CardDescription>
                  Upload high-quality images of your artwork. Supported formats:
                  JPG, PNG, GIF, WebP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  onUploadComplete={(images) => {
                    const newFiles = images.map((img) => ({
                      name: `image_${img.order || 0}.${img.format}`,
                      size: img.bytes,
                      type: `image/${img.format}`,
                      url: img.secure_url,
                      width: img.width,
                      height: img.height,
                      public_id: img.public_id,
                    }));
                    setFiles(newFiles); // Replace files instead of appending
                  }}
                  onUploadError={(error) => {
                    toast({
                      title: "Upload failed",
                      description: error,
                      variant: "destructive",
                    });
                  }}
                  folder={`artworks/${user?.id}`}
                  tags={["artwork", title || "untitled"]}
                  context={{
                    artist_id: user?.id || "",
                    artwork_title: title,
                  }}
                  maxFiles={10}
                  multiple={true}
                />
              </CardContent>
            </Card>

            {/* Artwork Details */}
            <Card>
              <CardHeader>
                <CardTitle>Artwork Details</CardTitle>
                <CardDescription>
                  Provide information about your artwork
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
                  Set pricing information for your artwork
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

            {files.length === 0 ? (
              <Alert>
                <AlertDescription>
                  Please upload at least one image to continue.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  ✅ {files.length} image{files.length > 1 ? "s" : ""} uploaded
                  successfully. You can now publish your artwork.
                </AlertDescription>
              </Alert>
            )}

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
                disabled={!title || !category || files.length === 0}
              >
                <Eye className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading || !title || !category || files.length === 0
                }
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publishing...
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Publish Artwork
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

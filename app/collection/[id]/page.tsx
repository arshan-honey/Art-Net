"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { useCollection, useCollections } from "@/hooks/use-user";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Heart,
  Eye,
  Calendar,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  Edit,
  Trash2,
  Share2,
  Users,
  Lock,
  Globe,
  Star,
  Plus,
  Download,
  Filter,
  Grid,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";

interface Artwork {
  id: string;
  title: string;
  primaryImage: string;
  imageUrl: string;
  views: number;
  createdAt: string;
  artist: {
    id: string;
    displayName: string;
    username: string;
    avatar?: string;
  };
  categories?: Array<{
    category: {
      id: string;
      name: string;
    };
  }>;
  tags?: Array<{
    tag: {
      id: string;
      name: string;
    };
  }>;
  _count?: {
    likes: number;
    comments: number;
  };
}

interface Collection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  userId: string;
  artworks: Array<{
    id: string;
    artwork: Artwork;
    addedAt: Date;
  }>;
  _count: {
    artworks: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface CollectionDetailPageProps {
  params: {
    id: string;
  };
}

export default function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    collection: rawCollection,
    isLoading,
    error,
    refetch: refetchCollection,
  } = useCollection(params.id);
  const { removeFromCollection } = useCollections();
  const collection = rawCollection as Collection | null;
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [filterCategory, setFilterCategory] = useState("all");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <Card className="mb-8 overflow-hidden">
              <div className="h-48 md:h-64 bg-gray-200 animate-pulse" />
              <CardContent className="p-6 md:p-8">
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
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
          <div className="max-w-7xl mx-auto">
            <Card className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Collection not found
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  // Extract categories from artworks
  const categories = [
    "all",
    ...Array.from(
      new Set(
        collection.artworks?.map(
          (item) =>
            item.artwork.categories?.[0]?.category?.name || "Uncategorized"
        ) || []
      )
    ),
  ];

  const filteredArtworks = (collection.artworks || []).filter((item) => {
    const categoryName =
      item.artwork.categories?.[0]?.category?.name || "Uncategorized";
    return filterCategory === "all" || categoryName === filterCategory;
  });

  const sortedArtworks = [...filteredArtworks].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      case "popular":
        return (b.artwork._count?.likes || 0) - (a.artwork._count?.likes || 0);
      case "views":
        return (b.artwork.views || 0) - (a.artwork.views || 0);
      case "title":
        return a.artwork.title.localeCompare(b.artwork.title);
      default:
        return 0;
    }
  });

  // Check if current user is the owner
  const isOwner = user && collection.userId === user.id;

  const handleRemoveFromCollection = async (artworkId: string) => {
    if (!collection) return;

    try {
      await removeFromCollection(collection.id, artworkId);
      // Refetch the collection to update the UI
      refetchCollection();
      toast({
        title: "Success",
        description: "Artwork removed from collection",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove artwork from collection",
        variant: "destructive",
      });
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? "Unfollowed collection" : "Following collection",
      description: isFollowing
        ? `You are no longer following "${collection.name}"`
        : `You are now following "${collection.name}"`,
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Removed from likes" : "Added to likes",
      description: isLiked
        ? "Collection removed from your likes"
        : "Collection added to your likes",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Collection link has been copied to your clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Collection Header */}
          <Card className="mb-8 overflow-hidden">
            <div
              className="h-48 md:h-64 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"
              style={{
                backgroundImage: `url(${collection.coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                      {collection.name}
                    </h1>
                    {collection.isPublic ? (
                      <Globe className="h-5 w-5 text-gray-500" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-500" />
                    )}
                  </div>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {collection.description || "No description provided."}
                  </p>

                  {/* Creator Info */}
                  <div className="flex items-center space-x-3 mb-4">
                    <Avatar>
                      <AvatarImage
                        src={user?.avatar || "/placeholder.svg"}
                        alt={user?.displayName || "User"}
                      />
                      <AvatarFallback>
                        {(user?.displayName || "U").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link href={`/profile`}>
                        <p className="font-medium hover:text-primary cursor-pointer">
                          {user?.displayName || "Your Collection"}
                        </p>
                      </Link>
                      <p className="text-sm text-gray-600">@{user?.username}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">
                        {collection._count?.artworks || 0}
                      </div>
                      <div className="text-sm text-gray-600">Artworks</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {/* <div className="flex items-center space-x-3 mt-6 md:mt-0">
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  {isOwner && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Collection
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Artworks
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Export Collection
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Collection
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div> */}
              </div>

              {/* Collection Meta */}
              <div className="flex items-center space-x-6 text-sm text-gray-600 pt-4 border-t">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {formatDate(collection.createdAt.toString())}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Updated {formatDate(collection.updatedAt.toString())}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Filters and Controls */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold">
                  Artworks ({sortedArtworks.length})
                </h2>
                {/* {isOwner && (
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Artwork
                  </Button>
                )} */}
              </div>

              <div className="flex items-center space-x-3">
                <Select
                  value={filterCategory}
                  onValueChange={setFilterCategory}
                >
                  <SelectTrigger className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === "all" ? "All Categories" : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recently Added</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="views">Most Viewed</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Artworks Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedArtworks.map((item) => (
                <Card
                  key={item.id}
                  className="group hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    <Link href={`/artwork/${item.artwork.id}`}>
                      <Image
                        src={
                          item.artwork.imageUrl ||
                          item.artwork.primaryImage ||
                          "/placeholder.svg"
                        }
                        alt={item.artwork.title}
                        width={600}
                        height={400}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="bg-white/90">
                        {item.artwork.categories?.[0]?.category?.name ||
                          "Uncategorized"}
                      </Badge>
                    </div>
                    {isOwner && (
                      <div className="absolute top-3 left-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleRemoveFromCollection(item.artwork.id)
                              }
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove from Collection
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Link href={`/artwork/${item.artwork.id}`}>
                      <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                        {item.artwork.title}
                      </h3>
                    </Link>
                    <Link href={`/artist/${item.artwork.artist.username}`}>
                      <p className="text-gray-600 text-sm mb-3 hover:text-primary transition-colors">
                        by {item.artwork.artist.displayName}
                      </p>
                    </Link>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {item.artwork._count?.likes || 0}
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {item.artwork.views || 0}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Added {formatDate(item.addedAt.toString())}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedArtworks.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-6">
                      <Link href={`/artwork/${item.artwork.id}`}>
                        <Image
                          src={
                            item.artwork.imageUrl ||
                            item.artwork.primaryImage ||
                            "/placeholder.svg"
                          }
                          alt={item.artwork.title}
                          width={120}
                          height={80}
                          className="w-24 h-16 object-cover rounded-lg"
                        />
                      </Link>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <Link href={`/artwork/${item.artwork.id}`}>
                              <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                {item.artwork.title}
                              </h3>
                            </Link>
                            <Link
                              href={`/artist/${item.artwork.artist.username}`}
                            >
                              <p className="text-gray-600 hover:text-primary transition-colors mb-2">
                                by {item.artwork.artist.displayName}
                              </p>
                            </Link>
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline">
                                {item.artwork.categories?.[0]?.category?.name ||
                                  "Uncategorized"}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Added {formatDate(item.addedAt.toString())}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center">
                              <Heart className="h-4 w-4 mr-1" />
                              {item.artwork._count?.likes || 0}
                            </span>
                            <span className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {item.artwork.views || 0}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              {item.artwork._count?.comments || 0}
                            </span>
                            {isOwner && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    className="text-red-600"
                                    onClick={() =>
                                      handleRemoveFromCollection(
                                        item.artwork.id,
                                        item.artwork.title
                                      )
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {sortedArtworks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Grid className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No artworks found
              </h3>
              <p className="text-gray-500">
                {filterCategory !== "all"
                  ? "Try adjusting your category filter"
                  : "This collection doesn't have any artworks yet"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

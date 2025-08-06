"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import Image from "next/image";
import {
  Heart,
  Eye,
  MessageCircle,
  Calendar,
  MapPin,
  ExternalLink,
  Share2,
  Flag,
  Grid,
  List,
  Filter,
  Users,
  ImageIcon,
  Award,
  Star,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useArtistDetail } from "@/hooks/use-artist-detail";
import { useFollow } from "@/hooks/use-follow";

interface ArtistDetailPageProps {
  params: {
    username: string;
  };
}

export default function ArtistDetailPage({ params }: ArtistDetailPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [filterCategory, setFilterCategory] = useState("all");

  const {
    artist,
    artworks,
    collections,
    loading,
    error,
    artworksLoading,
    collectionsLoading,
    fetchArtworks,
    fetchCollections,
  } = useArtistDetail(params.username);

  // Use follow hook when artist is loaded
  const {
    isFollowing,
    totalFollowers,
    loading: followLoading,
    toggleFollow,
  } = useFollow(
    artist?.id || "",
    artist?.isFollowing || false, // Use the follow status from API
    artist?.followers || 0
  );

  useEffect(() => {
    if (artist) {
      fetchArtworks({ limit: 20 });
      fetchCollections();
    }
  }, [artist]); // Dependencies are stable function references

  const categories = artist?.specialties || [];
  const allCategories = ["all", ...categories];

  const filteredArtworks = artworks.filter((artwork) => {
    return filterCategory === "all" || artwork.category === filterCategory;
  });

  const sortedArtworks = [...filteredArtworks].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "popular":
        return (b.likeCount || b.likes || 0) - (a.likeCount || a.likes || 0);
      case "views":
        return (b.viewCount || b.views || 0) - (a.viewCount || a.views || 0);
      case "comments":
        return (
          (b.commentCount || b.comments || 0) -
          (a.commentCount || a.comments || 0)
        );
      default:
        return 0;
    }
  });

  const featuredArtworks = artworks.filter(
    (artwork) => artwork.isFeatured || artwork.featured
  );

  const stats = artist
    ? [
        { label: "Artworks", value: artist.totalArtworks, icon: ImageIcon },
        { label: "Followers", value: totalFollowers, icon: Users },
        { label: "Total Likes", value: artist.totalLikes, icon: Heart },
        { label: "Total Views", value: artist.totalViews, icon: Eye },
      ]
    : [];

  const handleFollow = async () => {
    if (!artist) return;
    await toggleFollow();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Artist profile link has been copied to your clipboard",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <Card className="mb-8 overflow-hidden">
              <Skeleton className="h-48 md:h-64 w-full" />
              <CardContent className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16 md:-mt-20">
                  <Skeleton className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white" />
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-8 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                    <Skeleton className="h-20 w-full" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-18" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="text-center">
                          <Skeleton className="h-8 w-16 mx-auto mb-2" />
                          <Skeleton className="h-4 w-12 mx-auto" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <Card className="mb-8">
              <CardContent className="p-6 md:p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Artist Not Found
                </h1>
                <p className="text-gray-600 mb-4">{error}</p>
                <Button asChild>
                  <Link href="/artists">Browse Artists</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Artist not found
  if (!artist) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-6xl mx-auto">
            <Card className="mb-8">
              <CardContent className="p-6 md:p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Artist Not Found
                </h1>
                <p className="text-gray-600 mb-4">
                  The artist you're looking for doesn't exist or has been
                  deactivated.
                </p>
                <Button asChild>
                  <Link href="/artists">Browse Artists</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8 overflow-hidden">
            <div
              className="h-48 md:h-64 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"
              style={{
                backgroundImage: `url(${artist.coverImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-end space-y-4 md:space-y-0 md:space-x-6 -mt-16 md:-mt-20">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg">
                  <AvatarImage
                    src={artist.avatar || "/placeholder.svg"}
                    alt={artist.name}
                  />
                  <AvatarFallback className="text-2xl">
                    {artist.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                          {artist.name}
                        </h1>
                        {artist.verified && (
                          <Badge variant="secondary">✓ Verified</Badge>
                        )}
                        {artist.featured && (
                          <Badge variant="default">Featured Artist</Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-2">@{artist.username}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {artist.location}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Joined {formatDate(artist.joinDate)}
                        </span>
                        {artist.website && (
                          <a
                            href={artist.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center hover:text-primary"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                      <Button onClick={handleShare} variant="outline">
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      {user && user.id !== artist.id && (
                        <Button
                          onClick={handleFollow}
                          variant={isFollowing ? "outline" : "default"}
                          disabled={followLoading}
                        >
                          {followLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : isFollowing ? (
                            <Users className="h-4 w-4 mr-2" />
                          ) : (
                            <Users className="h-4 w-4 mr-2" />
                          )}
                          {followLoading
                            ? "Loading..."
                            : isFollowing
                            ? "Following"
                            : "Follow"}
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {artist.bio}
                  </p>

                  {/* Specialties */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {artist.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {stats.map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <stat.icon className="h-4 w-4 text-primary mr-1" />
                          <span className="text-xl font-bold text-gray-900">
                            {stat.value.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="artworks" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="artworks">Artworks</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="artworks" className="space-y-6">
              {/* Featured Artworks */}
              {featuredArtworks.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Featured Artworks
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {featuredArtworks.map((artwork) => (
                      <Card
                        key={artwork.id}
                        className="group hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="relative overflow-hidden rounded-t-lg">
                          <Link href={`/artwork/${artwork.id}`}>
                            <Image
                              src={artwork.primaryImage || "/placeholder.svg"}
                              alt={artwork.title}
                              width={600}
                              height={400}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          <div className="absolute top-3 right-3">
                            <Badge variant="default">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <Link href={`/artwork/${artwork.id}`}>
                            <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                              {artwork.title}
                            </h3>
                          </Link>
                          <p className="text-gray-600 text-sm mb-3">
                            {artwork.category}
                          </p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Heart className="h-4 w-4 mr-1" />
                                {artwork.likes}
                              </span>
                              <span className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {artwork.views}
                              </span>
                            </div>
                            <span className="text-xs">
                              {formatDate(artwork.createdAt)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* All Artworks */}
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                    All Artworks ({sortedArtworks.length})
                  </h2>

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
                        <SelectItem value="recent">Recent</SelectItem>
                        <SelectItem value="popular">Popular</SelectItem>
                        <SelectItem value="views">Most Viewed</SelectItem>
                        <SelectItem value="comments">Most Commented</SelectItem>
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

                {/* Artworks Grid/List */}
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {sortedArtworks.map((artwork) => (
                      <Card
                        key={artwork.id}
                        className="group hover:shadow-lg transition-shadow duration-300"
                      >
                        <div className="relative overflow-hidden rounded-t-lg">
                          <Link href={`/artwork/${artwork.id}`}>
                            <Image
                              src={artwork.primaryImage || "/placeholder.svg"}
                              alt={artwork.title}
                              width={600}
                              height={400}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </Link>
                          <div className="absolute top-3 right-3">
                            <Badge variant="outline" className="bg-white/90">
                              {artwork.category}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <Link href={`/artwork/${artwork.id}`}>
                            <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
                              {artwork.title}
                            </h3>
                          </Link>
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="flex items-center">
                                <Heart className="h-4 w-4 mr-1" />
                                {artwork.likes}
                              </span>
                              <span className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {artwork.views}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDate(artwork.createdAt)}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sortedArtworks.map((artwork) => (
                      <Card
                        key={artwork.id}
                        className="hover:shadow-md transition-shadow duration-300"
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center space-x-6">
                            <Link href={`/artwork/${artwork.id}`}>
                              <Image
                                src={artwork.primaryImage || "/placeholder.svg"}
                                alt={artwork.title}
                                width={120}
                                height={80}
                                className="w-24 h-16 object-cover rounded-lg"
                              />
                            </Link>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <Link href={`/artwork/${artwork.id}`}>
                                    <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                      {artwork.title}
                                    </h3>
                                  </Link>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Badge variant="outline">
                                      {artwork.category}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      {formatDate(artwork.createdAt)}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <Heart className="h-4 w-4 mr-1" />
                                    {artwork.likes}
                                  </span>
                                  <span className="flex items-center">
                                    <Eye className="h-4 w-4 mr-1" />
                                    {artwork.views}
                                  </span>
                                  <span className="flex items-center">
                                    <MessageCircle className="h-4 w-4 mr-1" />
                                    {artwork.comments}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="collections" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                  <Card
                    key={collection.id}
                    className="hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                  >
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Image
                        src={collection.preview || "/placeholder.svg"}
                        alt={collection.name}
                        width={300}
                        height={200}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-white/90">
                          {collection.count} items
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2">{collection.name}</h3>
                      <p className="text-gray-600 text-sm">
                        {collection.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="about" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    About {artist.name}
                  </h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {artist.bio}
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      With over{" "}
                      {new Date().getFullYear() -
                        new Date(artist.joinDate).getFullYear()}{" "}
                      years of experience in digital art, I have developed a
                      unique style that combines traditional artistic principles
                      with cutting-edge digital techniques. My work has been
                      featured in various online galleries and has garnered
                      recognition from the digital art community.
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Specialties</h4>
                      <div className="flex flex-wrap gap-2">
                        {artist.specialties.map((specialty) => (
                          <Badge key={specialty} variant="outline">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Contact</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          {artist.location}
                        </div>
                        {artist.website && (
                          <div className="flex items-center">
                            <ExternalLink className="h-4 w-4 mr-2 text-gray-500" />
                            <a
                              href={artist.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              {artist.website}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artist.achievements.map((achievement, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <Award className="h-8 w-8 text-yellow-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">
                            {achievement.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            {achievement.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            {achievement.date}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

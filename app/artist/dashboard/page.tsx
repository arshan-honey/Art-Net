"use client";

import { useAuth } from "@/components/auth-provider";
import { useArtistStats, useArtistArtworks } from "@/hooks/use-artist";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import Image from "next/image";
import {
  Upload,
  Eye,
  Heart,
  MessageCircle,
  TrendingUp,
  Users,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ArtistDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { stats, isLoading: statsLoading } = useArtistStats();
  const {
    artworks,
    isLoading: artworksLoading,
    deleteArtwork,
  } = useArtistArtworks({ limit: 6, includeStats: true });

  useEffect(() => {
    if (user && user.role !== "ARTIST") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || user.role !== "ARTIST") {
    return null;
  }

  const handleDeleteArtwork = async (id: string) => {
    if (confirm("Are you sure you want to delete this artwork?")) {
      await deleteArtwork(id);
    }
  };

  const statsCards = [
    {
      label: "Total Views",
      value: stats?.totalViews.toLocaleString() || "0",
      icon: Eye,
      change: "+12%",
    },
    {
      label: "Total Likes",
      value: stats?.totalLikes.toLocaleString() || "0",
      icon: Heart,
      change: "+8%",
    },
    {
      label: "Followers",
      value: stats?.totalFollowers.toLocaleString() || "0",
      icon: Users,
      change: "+15%",
    },
    {
      label: "Total Comments",
      value: stats?.totalComments.toLocaleString() || "0",
      icon: MessageCircle,
      change: "+5%",
    },
  ];

  const recentComments = [
    {
      id: "1",
      artwork: "Sunset Dreams",
      user: "Jane Smith",
      comment: "Absolutely stunning work! The colors are amazing.",
      avatar: "/placeholder.svg?height=40&width=40",
      time: "2 hours ago",
    },
    {
      id: "2",
      artwork: "Urban Reflections",
      user: "Mike Johnson",
      comment: "Love the composition and lighting in this piece.",
      avatar: "/placeholder.svg?height=40&width=40",
      time: "5 hours ago",
    },
    {
      id: "3",
      artwork: "Sunset Dreams",
      user: "Sarah Wilson",
      comment: "This is incredible! Do you sell prints?",
      avatar: "/placeholder.svg?height=40&width=40",
      time: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Artist Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.displayName || user.username}!
            </p>
          </div>
          <div className="flex space-x-3 mt-4 sm:mt-0">
            <Button asChild>
              <Link href="/artist/upload">
                <Upload className="h-4 w-4 mr-2" />
                Upload Artwork
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/profile">
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {statsLoading ? "..." : stat.value}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <stat.icon className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm text-green-600 font-medium">
                      {stat.change}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="artworks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="artworks">My Artworks</TabsTrigger>
            <TabsTrigger value="comments">Recent Comments</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="artworks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                My Artworks ({stats?.totalArtworks || 0})
              </h2>
              <Button asChild>
                <Link href="/artist/upload">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New
                </Link>
              </Button>
            </div>

            {artworksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-3"></div>
                      <div className="flex space-x-3">
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((artwork) => (
                  <Card key={artwork.id} className="group">
                    <div className="relative overflow-hidden rounded-t-lg">
                      <Image
                        src={artwork.images[0]?.url || "/placeholder.svg"}
                        alt={artwork.title}
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 right-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/artist/artworks/${artwork.id}/edit`}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteArtwork(artwork.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant={
                            artwork.status === "PUBLISHED"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {artwork.status.toLowerCase()}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{artwork.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {artwork.medium || "Digital Art"}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {artwork.likeCount}
                          </span>
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {artwork.viewCount}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            {artwork.commentCount}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Recent Comments</h2>
              <Button variant="outline">View All</Button>
            </div>

            <div className="space-y-4">
              {recentComments.map((comment) => (
                <Card key={comment.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <AvatarImage
                          src={comment.avatar || "/placeholder.svg"}
                          alt={comment.user}
                        />
                        <AvatarFallback>
                          {comment.user.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium">{comment.user}</p>
                            <p className="text-sm text-gray-600">
                              on {comment.artwork}
                            </p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {comment.time}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.comment}</p>
                        <div className="flex space-x-2 mt-3">
                          <Button variant="outline" size="sm">
                            Reply
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>
                    Your artwork performance this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Monthly Views</span>
                      <span className="text-2xl font-bold">
                        {stats?.monthlyViews.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Monthly Likes</span>
                      <span className="text-2xl font-bold">
                        {stats?.monthlyLikes.toLocaleString() || "0"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total Sales</span>
                      <span className="text-2xl font-bold">
                        {stats?.totalSales || "0"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Artworks</CardTitle>
                  <CardDescription>
                    Most popular artworks this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.topArtworks.map((artwork, index) => (
                      <div
                        key={artwork.id}
                        className="flex items-center space-x-3"
                      >
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{artwork.title}</p>
                          <p className="text-xs text-gray-600">
                            {artwork.views} views
                          </p>
                        </div>
                        <div className="flex items-center text-green-600">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            +{Math.floor(Math.random() * 20) + 5}%
                          </span>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-4">
                        No data available
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

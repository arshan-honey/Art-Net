"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  useUserProfile,
  useCollections,
  useUserActivity,
} from "@/hooks/use-user";
import { Navbar } from "@/components/navbar";
import { AvatarUpload } from "@/components/avatar-upload";
import { CreateCollectionDialog } from "@/components/create-collection-dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Save,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  MapPin,
  LinkIcon,
  Plus,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();
  const {
    profile,
    isLoading: profileLoading,
    updateProfile,
    refetch: refetchProfile,
  } = useUserProfile();
  const {
    collections,
    isLoading: collectionsLoading,
    createCollection,
  } = useCollections();
  const { activities, isLoading: activitiesLoading } = useUserActivity();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("collections");
  const [isSaving, setIsSaving] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    location: "",
    website: "",
  });

  // Initialize form data when profile is loaded or changes
  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
      });
    }
  }, [profile]);

  const handleCreateCollection = async (data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }) => {
    setIsCreatingCollection(true);
    try {
      await createCollection(data);
    } finally {
      setIsCreatingCollection(false);
    }
  };

  if (!user) {
    return null;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header Skeleton */}
            <Card className="mb-8">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                  <div className="relative">
                    <Skeleton className="w-32 h-32 rounded-full" />
                    <Skeleton className="absolute bottom-0 right-0 w-8 h-8 rounded-full" />
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                      <div className="space-y-2">
                        <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
                        <div className="flex items-center justify-center md:justify-start space-x-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-4 w-4 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-10 w-28 mt-4 md:mt-0" />
                    </div>
                    <Skeleton className="h-4 w-full max-w-md mx-auto md:mx-0" />
                    <Skeleton className="h-4 w-3/4 max-w-xs mx-auto md:mx-0" />
                    <div className="flex items-center justify-center md:justify-start space-x-6">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
                {/* Stats Skeleton */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center space-y-2">
                      <Skeleton className="h-8 w-12 mx-auto" />
                      <Skeleton className="h-4 w-16 mx-auto" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tabs Skeleton */}
            <div className="space-y-6">
              <div className="grid w-full grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <Skeleton className="h-32 w-full rounded-t-lg" />
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile(formData);
      setIsEditing(false);
      setActiveTab("collections"); // Switch back to collections after saving
    } catch (error) {
      // Error is handled by the hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setActiveTab("edit");
    setIsEditing(true);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "edit") {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile values
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        bio: profile.bio || "",
        location: profile.location || "",
        website: profile.website || "",
      });
    }
    setIsEditing(false);
    setActiveTab("collections");
  };

  const handleAvatarUpdate = (newAvatarUrl: string) => {
    // Refetch the profile to ensure we have the latest data
    refetchProfile();
  };

  const formatActivityTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return "Just now";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <AvatarUpload
                  currentAvatar={profile?.avatar}
                  userName={profile?.displayName || "User"}
                  size="xl"
                  onAvatarUpdate={handleAvatarUpdate}
                />

                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {profile?.displayName}
                      </h1>
                      <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                        <Badge variant="outline">{profile?.role}</Badge>
                        <span className="text-gray-600">•</span>
                        <span className="text-gray-600 flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Joined{" "}
                          {new Date(
                            profile?.createdAt || ""
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <Button onClick={handleEdit} variant="outline">
                      Edit Profile
                    </Button>
                  </div>

                  <p className="text-gray-600 mb-4">
                    {profile?.bio || "No bio available yet."}
                  </p>

                  <div className="flex items-center justify-center md:justify-start space-x-6 text-sm text-gray-600">
                    <span className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {profile?.location || "Location not set"}
                    </span>
                    <span className="flex items-center">
                      <LinkIcon className="h-4 w-4 mr-1" />
                      {profile?.website || "No website"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {profile?.stats?.collectionsCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Collections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {profile?.stats?.followingCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {profile?.stats?.followersCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {profile?.stats?.likesGivenCount || 0}
                  </div>
                  <div className="text-sm text-gray-600">Likes Given</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="edit">Edit Profile</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="edit" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your profile information and settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        placeholder="Your first name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        placeholder="Your last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profile?.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          bio: e.target.value,
                        }))
                      }
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            location: e.target.value,
                          }))
                        }
                        placeholder="Your location"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            website: e.target.value,
                          }))
                        }
                        placeholder="https://your-website.com"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="collections" className="space-y-6">
              {collectionsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <Skeleton className="h-32 w-full rounded-t-lg" />
                      <CardContent className="p-4">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-3 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : collections.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-gray-400 mb-4">
                      <Plus className="h-12 w-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Collections Yet
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Start organizing your favorite artworks by creating your
                      first collection.
                    </p>
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Collection
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collections.map((collection) => (
                    <Link
                      key={collection.id}
                      href={`/collection/${collection.id}`}
                    >
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <div className="relative overflow-hidden rounded-t-lg">
                          <Image
                            src={collection.coverImage || "/placeholder.svg"}
                            alt={collection.name}
                            width={200}
                            height={200}
                            className="w-full h-32 object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-1">
                            {collection.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {collection._count?.artworks || 0} artworks
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}

                  <Card
                    className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <CardContent className="p-8 text-center">
                      <div className="text-gray-400 mb-2">
                        <Plus className="h-8 w-8 mx-auto" />
                      </div>
                      <p className="text-gray-600 font-medium">
                        Create New Collection
                      </p>
                      <p className="text-sm text-gray-500">
                        Organize your favorite artworks
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent interactions on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-start space-x-3 pb-4 border-b"
                        >
                          <Skeleton className="h-4 w-4 mt-1" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-3 pb-4 border-b last:border-b-0"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {activity.type === "LIKE" && (
                              <Heart className="h-4 w-4 text-red-500" />
                            )}
                            {activity.type === "FOLLOW" && (
                              <Eye className="h-4 w-4 text-blue-500" />
                            )}
                            {activity.type === "COMMENT" && (
                              <MessageCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              {activity.type === "LIKE" &&
                                `Liked "${activity.artwork?.title}" by ${activity.artwork?.artist.displayName}`}
                              {activity.type === "FOLLOW" &&
                                `Started following ${activity.artist?.displayName}`}
                              {activity.type === "COMMENT" &&
                                `Commented on "${activity.artwork?.title}"`}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatActivityTime(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertDescription>
                        No recent activity. Start exploring artworks and
                        following artists to see your activity here.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <CreateCollectionDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateCollection={handleCreateCollection}
        isLoading={isCreatingCollection}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";
import type {
  UserProfile,
  Collection,
  UserActivity,
  Notification,
} from "@/lib/types/user";

// User Profile Hook
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchProfile = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.getUserProfile();
      setProfile(response.data as UserProfile);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const response = await apiClient.updateUserProfile(data);
      setProfile(response.data as UserProfile);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
      setError(null);
    }
  }, [user]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}

// Collections Hook
export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchCollections = async (includeArtworks = false) => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.getUserCollections(includeArtworks);
      setCollections(response.data as Collection[]);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch collections"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const createCollection = async (data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }) => {
    try {
      const response = await apiClient.createCollection(data);
      setCollections((prev) => [response.data as Collection, ...prev]);
      toast({
        title: "Success",
        description: "Collection created successfully",
      });
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create collection";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateCollection = async (id: string, data: Partial<Collection>) => {
    try {
      const response = await apiClient.updateCollection(id, data);
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? (response.data as Collection) : c))
      );
      toast({
        title: "Success",
        description: "Collection updated successfully",
      });
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update collection";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteCollection = async (id: string) => {
    try {
      await apiClient.deleteCollection(id);
      setCollections((prev) => prev.filter((c) => c.id !== id));
      toast({
        title: "Success",
        description: "Collection deleted successfully",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete collection";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const addToCollection = async (collectionId: string, artworkId: string) => {
    try {
      await apiClient.addToCollection(collectionId, artworkId);
      toast({
        title: "Success",
        description: "Artwork added to collection",
      });
      // Refetch collections to update counts and saved status
      fetchCollections(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add to collection";

      // Handle already saved case differently
      if (errorMessage.includes("already in this collection")) {
        toast({
          title: "Already saved",
          description: "This artwork is already in the selected collection",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      throw err;
    }
  };

  const removeFromCollection = async (
    collectionId: string,
    artworkId: string
  ) => {
    try {
      await apiClient.removeFromCollection(collectionId, artworkId);
      toast({
        title: "Success",
        description: "Artwork removed from collection",
      });
      // Refetch collections to update counts and saved status
      fetchCollections(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove from collection";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchCollections(true); // Always include artworks for checking saved status
    } else {
      setCollections([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user]);

  return {
    collections,
    isLoading,
    error,
    createCollection,
    updateCollection,
    deleteCollection,
    addToCollection,
    removeFromCollection,
    refetch: fetchCollections,
  };
}

// Single Collection Hook
export function useCollection(id: string) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCollection = async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.getCollection(id);
      setCollection(response.data as Collection);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch collection"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, [id]);

  return {
    collection,
    isLoading,
    error,
    refetch: fetchCollection,
  };
}

// Social Actions Hook
export function useSocialActions() {
  const { toast } = useToast();

  const followArtist = async (artistId: string) => {
    try {
      await apiClient.followArtist(artistId);
      toast({
        title: "Success",
        description: "Artist followed successfully",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to follow artist";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const unfollowArtist = async (artistId: string) => {
    try {
      await apiClient.unfollowArtist(artistId);
      toast({
        title: "Success",
        description: "Artist unfollowed successfully",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to unfollow artist";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  const likeArtwork = async (artworkId: string) => {
    try {
      await apiClient.likeArtwork(artworkId);
      toast({
        title: "Success",
        description: "Artwork liked",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to like artwork";
      if (!errorMessage.includes("Already liked")) {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
      throw err;
    }
  };

  const unlikeArtwork = async (artworkId: string) => {
    try {
      await apiClient.unlikeArtwork(artworkId);
      toast({
        title: "Success",
        description: "Artwork unliked",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to unlike artwork";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  return {
    followArtist,
    unfollowArtist,
    likeArtwork,
    unlikeArtwork,
  };
}

// Comments Hook
export function useComments(artworkId: string) {
  const [comments, setComments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getComments(artworkId);
      setComments(response.data as any[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch comments");
    } finally {
      setIsLoading(false);
    }
  };

  const addComment = async (content: string, parentId?: string) => {
    try {
      const response = await apiClient.addComment(artworkId, content, parentId);
      if (parentId) {
        // Handle reply - would need more complex state management
        fetchComments();
      } else {
        setComments((prev) => [response.data, ...prev]);
      }
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      return response.data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add comment";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    if (artworkId) {
      fetchComments();
    }
  }, [artworkId]);

  return {
    comments,
    isLoading,
    error,
    addComment,
    refetch: fetchComments,
  };
}

// User Activity Hook
export function useUserActivity() {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchActivity = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.getUserActivity();
      setActivities(response.data as UserActivity[]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch activity");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchActivity();
    } else {
      setActivities([]);
      setIsLoading(false);
      setError(null);
    }
  }, [user]);

  return {
    activities,
    isLoading,
    error,
    refetch: fetchActivity,
  };
}

// Search Hook
export function useSearch() {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (filters: any, limit = 20, offset = 0) => {
    try {
      setIsLoading(true);
      const response = await apiClient.searchContent(filters, limit, offset);
      setResults(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    isLoading,
    error,
    search,
  };
}

// Notifications Hook
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getNotifications();
      setNotifications(response.data as Notification[]);
      setUnreadCount(
        (response.data as Notification[]).filter((n: Notification) => !n.isRead)
          .length
      );
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await apiClient.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to mark as read";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to mark all as read";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}

// Recommendations Hook
export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getRecommendations();
      setRecommendations(response.data as any[]);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch recommendations"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return {
    recommendations,
    isLoading,
    error,
    refetch: fetchRecommendations,
  };
}

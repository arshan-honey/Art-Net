import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";

export interface FollowStatus {
  isFollowing: boolean;
  totalFollowers: number;
  loading: boolean;
  error: string | null;
}

export function useFollow(
  userId: string,
  initialFollowing = false,
  initialFollowersCount = 0
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [totalFollowers, setTotalFollowers] = useState(initialFollowersCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update state when initial values change
  useEffect(() => {
    setIsFollowing(initialFollowing);
    setTotalFollowers(initialFollowersCount);
  }, [initialFollowing, initialFollowersCount]);

  const toggleFollow = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to follow artists",
        variant: "destructive",
      });
      return;
    }

    if (user.id === userId) {
      toast({
        title: "Invalid action",
        description: "You cannot follow yourself",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const method = isFollowing ? "DELETE" : "POST";
      const response = await fetch(`/api/user/${userId}/follow`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update follow status");
      }

      const data = await response.json();

      setIsFollowing(data.isFollowing);
      setTotalFollowers(data.totalFollowers);

      toast({
        title: data.isFollowing ? "Following artist" : "Unfollowed artist",
        description: data.isFollowing
          ? "You are now following this artist"
          : "You have unfollowed this artist",
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, isFollowing, user, toast]);

  return {
    isFollowing,
    totalFollowers,
    loading,
    error,
    toggleFollow,
  };
}

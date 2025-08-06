import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth-provider";

export interface LikeStatus {
  isLiked: boolean;
  totalLikes: number;
  loading: boolean;
  error: string | null;
}

export function useLike(
  artworkId: string,
  initialLiked = false,
  initialCount = 0
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [totalLikes, setTotalLikes] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update state when artwork data changes
  useEffect(() => {
    setIsLiked(initialLiked);
    setTotalLikes(initialCount);
  }, [initialLiked, initialCount]);

  const toggleLike = useCallback(async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like artworks",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const method = isLiked ? "DELETE" : "POST";
      const response = await fetch(`/api/artwork/${artworkId}/like`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update like status");
      }

      const data = await response.json();

      setIsLiked(data.liked);
      setTotalLikes(data.likeCount);

      toast({
        title: data.liked ? "Added to likes" : "Removed from likes",
        description: data.liked
          ? "Artwork added to your likes"
          : "Artwork removed from your likes",
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
  }, [artworkId, isLiked, user, toast]);

  return {
    isLiked,
    totalLikes,
    loading,
    error,
    toggleLike,
  };
}

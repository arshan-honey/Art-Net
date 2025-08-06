import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  replies: Comment[];
  replyCount: number;
}

interface CreateCommentData {
  content: string;
  parentId?: string;
}

export function useComments(artworkId: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get(`/artwork/${artworkId}/comments`);

      if (response.error) {
        setError(response.error);
        return;
      }

      setComments(response as unknown as Comment[]);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [artworkId]);

  const createComment = useCallback(
    async (data: CreateCommentData) => {
      try {
        setError(null);

        const response = await apiClient.post(
          `/artwork/${artworkId}/comments`,
          data
        );

        if (response.error) {
          setError(response.error);
          return null;
        }

        const newComment = response as unknown as Comment;

        // If it's a reply, update the parent comment
        if (data.parentId) {
          setComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === data.parentId
                ? { ...comment, replies: [...comment.replies, newComment] }
                : comment
            )
          );
        } else {
          // If it's a top-level comment, add it to the beginning
          setComments((prevComments) => [newComment, ...prevComments]);
        }

        return newComment;
      } catch (err) {
        console.error("Error creating comment:", err);
        setError("Failed to create comment");
        return null;
      }
    },
    [artworkId]
  );

  const updateComment = useCallback(
    async (commentId: string, content: string) => {
      try {
        setError(null);

        const response = await apiClient.put(
          `/artwork/${artworkId}/comments/${commentId}`,
          {
            content,
          }
        );

        if (response.error) {
          setError(response.error);
          return null;
        }

        const updatedComment = response as unknown as Comment;

        // Update the comment in the state
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? updatedComment
              : {
                  ...comment,
                  replies: comment.replies.map((reply) =>
                    reply.id === commentId ? updatedComment : reply
                  ),
                }
          )
        );

        return updatedComment;
      } catch (err) {
        console.error("Error updating comment:", err);
        setError("Failed to update comment");
        return null;
      }
    },
    [artworkId]
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        setError(null);

        const response = await apiClient.delete(
          `/artwork/${artworkId}/comments/${commentId}`
        );

        if (response.error) {
          setError(response.error);
          return false;
        }

        // Remove the comment from the state
        setComments((prevComments) =>
          prevComments
            .filter((comment) => comment.id !== commentId)
            .map((comment) => ({
              ...comment,
              replies: comment.replies.filter(
                (reply) => reply.id !== commentId
              ),
            }))
        );

        return true;
      } catch (err) {
        console.error("Error deleting comment:", err);
        setError("Failed to delete comment");
        return false;
      }
    },
    [artworkId]
  );

  return {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  };
}

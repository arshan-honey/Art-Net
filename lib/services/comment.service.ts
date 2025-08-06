import { PrismaClient } from "@prisma/client";
import type { Comment, User } from "@prisma/client";

const prisma = new PrismaClient();

export interface CommentData {
  content: string;
  userId: string;
  artworkId: string;
  parentId?: string;
}

export interface FormattedComment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isEdited: boolean;
  user: {
    id: string;
    name: string;
    username: string;
    avatar: string | null;
  };
  replies: FormattedComment[];
  replyCount: number;
}

export class CommentService {
  static async createComment(data: CommentData): Promise<FormattedComment> {
    try {
      // Verify artwork exists
      const artwork = await prisma.artwork.findUnique({
        where: { id: data.artworkId },
      });

      if (!artwork) {
        throw new Error("Artwork not found");
      }

      // If parentId is provided, verify parent comment exists and belongs to the same artwork
      if (data.parentId) {
        const parentComment = await prisma.comment.findUnique({
          where: { id: data.parentId },
        });

        if (!parentComment) {
          throw new Error("Parent comment not found");
        }

        if (parentComment.artworkId !== data.artworkId) {
          throw new Error("Parent comment does not belong to this artwork");
        }
      }

      // Create the comment
      const comment = await prisma.comment.create({
        data: {
          content: data.content,
          userId: data.userId,
          artworkId: data.artworkId,
          parentId: data.parentId,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      return CommentService.formatComment(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error;
    }
  }

  static async getCommentsByArtwork(
    artworkId: string
  ): Promise<FormattedComment[]> {
    try {
      const comments = await prisma.comment.findMany({
        where: {
          artworkId,
          parentId: null, // Only get top-level comments
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return comments.map(CommentService.formatComment);
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  }

  static async updateComment(
    commentId: string,
    userId: string,
    content: string
  ): Promise<FormattedComment> {
    try {
      // Verify comment exists and belongs to the user
      const existingComment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!existingComment) {
        throw new Error("Comment not found");
      }

      if (existingComment.userId !== userId) {
        throw new Error("Unauthorized to edit this comment");
      }

      // Update the comment
      const comment = await prisma.comment.update({
        where: { id: commentId },
        data: {
          content,
          isEdited: true,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          replies: {
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });

      return CommentService.formatComment(comment);
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  }

  static async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      // Verify comment exists and belongs to the user
      const existingComment = await prisma.comment.findUnique({
        where: { id: commentId },
      });

      if (!existingComment) {
        throw new Error("Comment not found");
      }

      if (existingComment.userId !== userId) {
        throw new Error("Unauthorized to delete this comment");
      }

      // Delete the comment (cascade will handle replies)
      await prisma.comment.delete({
        where: { id: commentId },
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  private static formatComment(comment: any): FormattedComment {
    return {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      isEdited: comment.isEdited,
      user: {
        id: comment.user.id,
        name:
          comment.user.displayName ||
          `${comment.user.firstName} ${comment.user.lastName}`.trim() ||
          comment.user.username,
        username: comment.user.username,
        avatar: comment.user.avatar,
      },
      replies: comment.replies
        ? comment.replies.map(CommentService.formatComment)
        : [],
      replyCount: comment.replies ? comment.replies.length : 0,
    };
  }
}

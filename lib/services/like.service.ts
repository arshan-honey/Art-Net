import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface LikeData {
  userId: string;
  artworkId: string;
}

export interface LikeResponse {
  isLiked: boolean;
  totalLikes: number;
}

export class LikeService {
  static async toggleArtworkLike(data: LikeData): Promise<LikeResponse> {
    try {
      // Verify artwork exists
      const artwork = await prisma.artwork.findUnique({
        where: { id: data.artworkId },
        select: { id: true },
      });

      if (!artwork) {
        throw new Error("Artwork not found");
      }

      // Check if like already exists
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_artworkId: {
            userId: data.userId,
            artworkId: data.artworkId,
          },
        },
      });

      let isLiked: boolean;

      if (existingLike) {
        // Unlike: Remove the like
        await prisma.like.delete({
          where: {
            id: existingLike.id,
          },
        });
        isLiked = false;
      } else {
        // Like: Create new like
        await prisma.like.create({
          data: {
            userId: data.userId,
            artworkId: data.artworkId,
          },
        });
        isLiked = true;
      }

      // Get updated total likes count
      const totalLikes = await prisma.like.count({
        where: {
          artworkId: data.artworkId,
        },
      });

      return {
        isLiked,
        totalLikes,
      };
    } catch (error) {
      console.error("Error toggling artwork like:", error);
      throw error;
    }
  }

  static async getUserLikeStatus(
    userId: string,
    artworkId: string
  ): Promise<boolean> {
    try {
      const like = await prisma.like.findUnique({
        where: {
          userId_artworkId: {
            userId,
            artworkId,
          },
        },
      });

      return !!like;
    } catch (error) {
      console.error("Error getting user like status:", error);
      throw error;
    }
  }

  static async getArtworkLikes(artworkId: string): Promise<{
    totalLikes: number;
    likedUsers: Array<{
      id: string;
      username: string;
      displayName: string | null;
      firstName: string | null;
      lastName: string | null;
      avatar: string | null;
    }>;
  }> {
    try {
      const likes = await prisma.like.findMany({
        where: {
          artworkId,
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
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return {
        totalLikes: likes.length,
        likedUsers: likes.map((like) => like.user),
      };
    } catch (error) {
      console.error("Error getting artwork likes:", error);
      throw error;
    }
  }

  static async getUserLikedArtworks(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{
    artworks: Array<{
      id: string;
      title: string;
      primaryImage: string;
      artist: {
        id: string;
        username: string;
        displayName: string | null;
        firstName: string | null;
        lastName: string | null;
      };
      likedAt: Date;
    }>;
    total: number;
  }> {
    try {
      const likes = await prisma.like.findMany({
        where: {
          userId,
        },
        include: {
          artwork: {
            select: {
              id: true,
              title: true,
              primaryImage: true,
              artist: {
                select: {
                  id: true,
                  username: true,
                  displayName: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });

      const total = await prisma.like.count({
        where: {
          userId,
        },
      });

      return {
        artworks: likes.map((like) => ({
          ...like.artwork,
          likedAt: like.createdAt,
        })),
        total,
      };
    } catch (error) {
      console.error("Error getting user liked artworks:", error);
      throw error;
    }
  }
}

import { PrismaClient } from "@prisma/client";
import type {
  UserProfile,
  Collection,
  SearchFilters,
  SearchResult,
} from "@/lib/types/user";

const prisma = new PrismaClient();

export class UserService {
  // Profile Management
  static async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            following: true,
            followers: true,
            collections: true,
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      displayName: user.displayName || user.username,
      bio: user.bio || undefined,
      avatar: user.avatar || undefined,
      location: user.location || undefined,
      website: user.website || undefined,
      role: user.role as "ENTHUSIAST" | "ARTIST",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      stats: {
        followingCount: user._count.following,
        followersCount: user._count.followers,
        collectionsCount: user._count.collections,
        likesGivenCount: user._count.likes,
        commentsCount: user._count.comments,
        artworksViewedCount: 0, // This would need to be tracked separately
        joinedDate: user.createdAt,
      },
    };
  }

  static async updateUserProfile(userId: string, data: Partial<UserProfile>) {
    // Remove preferences and stats from data as they don't exist in the User model
    const { preferences, stats, ...userData } = data;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: userData,
      include: {
        _count: {
          select: {
            following: true,
            followers: true,
            collections: true,
            likes: true,
            comments: true,
          },
        },
      },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      firstName: updatedUser.firstName || undefined,
      lastName: updatedUser.lastName || undefined,
      displayName: updatedUser.displayName || updatedUser.username,
      bio: updatedUser.bio || undefined,
      avatar: updatedUser.avatar || undefined,
      location: updatedUser.location || undefined,
      website: updatedUser.website || undefined,
      role: updatedUser.role as "ENTHUSIAST" | "ARTIST",
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      stats: {
        followingCount: updatedUser._count.following,
        followersCount: updatedUser._count.followers,
        collectionsCount: updatedUser._count.collections,
        likesGivenCount: updatedUser._count.likes,
        commentsCount: updatedUser._count.comments,
        artworksViewedCount: 0,
        joinedDate: updatedUser.createdAt,
      },
    };
  }

  // Collections Management
  static async getUserCollections(userId: string, includeArtworks = false) {
    return await prisma.collection.findMany({
      where: { userId },
      include: {
        _count: {
          select: { artworks: true },
        },
        artworks: includeArtworks
          ? {
              include: {
                artwork: {
                  include: {
                    artist: {
                      select: {
                        id: true,
                        displayName: true,
                        username: true,
                      },
                    },
                  },
                },
              },
              take: 4, // Preview images
            }
          : false,
      },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async createCollection(
    userId: string,
    data: { name: string; description?: string; isPublic?: boolean }
  ) {
    // Generate a slug from the name
    const slug =
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Replace multiple hyphens with single
        .trim() +
      "-" +
      Date.now(); // Add timestamp to ensure uniqueness

    return await prisma.collection.create({
      data: {
        ...data,
        slug,
        userId,
        isPublic: data.isPublic ?? true,
      },
    });
  }

  static async updateCollection(
    collectionId: string,
    userId: string,
    data: { name?: string; description?: string; isPublic?: boolean }
  ) {
    return await prisma.collection.update({
      where: {
        id: collectionId,
        userId: userId, // Ensure user owns the collection
      },
      data,
    });
  }

  static async deleteCollection(collectionId: string, userId: string) {
    return await prisma.collection.delete({
      where: {
        id: collectionId,
        userId,
      },
    });
  }

  static async addToCollection(
    collectionId: string,
    artworkId: string,
    userId: string
  ) {
    // Verify collection ownership
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      throw new Error("Collection not found or access denied");
    }

    // Check if artwork is already in collection
    const existingEntry = await prisma.collectionArtwork.findUnique({
      where: {
        collectionId_artworkId: {
          collectionId,
          artworkId,
        },
      },
    });

    if (existingEntry) {
      throw new Error("Artwork is already in this collection");
    }

    return await prisma.collectionArtwork.create({
      data: {
        collectionId,
        artworkId,
      },
    });
  }

  static async removeFromCollection(
    collectionId: string,
    artworkId: string,
    userId: string
  ) {
    // Verify collection ownership
    const collection = await prisma.collection.findFirst({
      where: { id: collectionId, userId },
    });

    if (!collection) {
      throw new Error("Collection not found or access denied");
    }

    return await prisma.collectionArtwork.delete({
      where: {
        collectionId_artworkId: {
          collectionId,
          artworkId,
        },
      },
    });
  }

  // Social Features
  static async followArtist(userId: string, artistId: string) {
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: artistId,
        },
      },
    });

    if (existingFollow) {
      throw new Error("Already following this artist");
    }

    const follow = await prisma.follow.create({
      data: {
        followerId: userId,
        followingId: artistId,
      },
    });

    // Create notification for the artist
    await this.createNotification(artistId, {
      type: "FOLLOW",
      title: "New Follower",
      message: "Someone started following you",
      fromUserId: userId,
    });

    return follow;
  }

  static async unfollowArtist(userId: string, artistId: string) {
    return await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: artistId,
        },
      },
    });
  }

  static async likeArtwork(userId: string, artworkId: string) {
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_artworkId: {
          userId,
          artworkId,
        },
      },
    });

    if (existingLike) {
      throw new Error("Already liked this artwork");
    }

    const like = await prisma.like.create({
      data: {
        userId,
        artworkId,
      },
    });

    // Get artwork details for notification
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      include: { artist: true },
    });

    if (artwork) {
      await this.createNotification(artwork.artist.id, {
        type: "LIKE",
        title: "Artwork Liked",
        message: `Someone liked your artwork "${artwork.title}"`,
        fromUserId: userId,
        actionUrl: `/artwork/${artworkId}`,
      });
    }

    return like;
  }

  static async unlikeArtwork(userId: string, artworkId: string) {
    return await prisma.like.delete({
      where: {
        userId_artworkId: {
          userId,
          artworkId,
        },
      },
    });
  }

  // Comments
  static async addComment(
    userId: string,
    artworkId: string,
    content: string,
    parentId?: string
  ) {
    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        artworkId,
        parentId,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // Create notification for artwork owner
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      include: { artist: true },
    });

    if (artwork && artwork.artist.id !== userId) {
      await this.createNotification(artwork.artist.id, {
        type: "COMMENT",
        title: "New Comment",
        message: `Someone commented on your artwork "${artwork.title}"`,
        fromUserId: userId,
        actionUrl: `/artwork/${artworkId}`,
      });
    }

    return comment;
  }

  static async getComments(artworkId: string, limit = 20, offset = 0) {
    return await prisma.comment.findMany({
      where: {
        artworkId,
        parentId: null, // Only top-level comments
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatar: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        _count: {
          select: { replies: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  // Activity Feed
  static async getUserActivity(userId: string, limit = 20, offset = 0) {
    try {
      // Get recent likes with artwork and artist info
      const likes = await prisma.like.findMany({
        where: { userId },
        include: {
          artwork: {
            include: {
              artist: {
                select: {
                  id: true,
                  displayName: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: Math.floor(limit / 2), // Split the limit between likes and follows
      });

      // Get recent follows with user info
      const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        include: {
          following: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: Math.floor(limit / 2),
      });

      // Transform to unified activity format
      const likeActivities = likes.map((like) => ({
        id: like.id,
        type: "LIKE" as const,
        createdAt: like.createdAt,
        artwork: {
          id: like.artwork.id,
          title: like.artwork.title,
          primaryImage: like.artwork.primaryImage,
          artist: like.artwork.artist,
        },
        artist: null,
      }));

      const followActivities = follows.map((follow) => ({
        id: follow.id,
        type: "FOLLOW" as const,
        createdAt: follow.createdAt,
        artwork: null,
        artist: follow.following,
      }));

      // Combine and sort by date
      const allActivities = [...likeActivities, ...followActivities]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(offset, offset + limit);

      return allActivities;
    } catch (error) {
      console.error("Get activity error:", error);
      return [];
    }
  }

  // Search
  static async searchContent(
    filters: SearchFilters,
    limit = 20,
    offset = 0
  ): Promise<SearchResult> {
    const whereClause: any = {
      status: "PUBLISHED",
    };

    if (filters.query) {
      whereClause.OR = [
        { title: { contains: filters.query, mode: "insensitive" } },
        { description: { contains: filters.query, mode: "insensitive" } },
        { tags: { hasSome: [filters.query] } },
      ];
    }

    if (filters.categories?.length) {
      whereClause.categories = {
        some: {
          categoryId: { in: filters.categories },
        },
      };
    }

    if (filters.mediums?.length) {
      whereClause.medium = { in: filters.mediums };
    }

    if (filters.priceRange) {
      whereClause.price = {};
      if (filters.priceRange.min)
        whereClause.price.gte = filters.priceRange.min;
      if (filters.priceRange.max)
        whereClause.price.lte = filters.priceRange.max;
    }

    if (filters.isForSale !== undefined) {
      whereClause.isForSale = filters.isForSale;
    }

    if (filters.artistId) {
      whereClause.artistId = filters.artistId;
    }

    let orderBy: any = { createdAt: "desc" };

    switch (filters.sortBy) {
      case "RECENT":
        orderBy = { createdAt: "desc" };
        break;
      case "POPULAR":
        orderBy = { likes: { _count: "desc" } };
        break;
      case "PRICE_LOW":
        orderBy = { price: "asc" };
        break;
      case "PRICE_HIGH":
        orderBy = { price: "desc" };
        break;
    }

    const [artworks, total] = await Promise.all([
      prisma.artwork.findMany({
        where: whereClause,
        include: {
          artist: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatar: true,
            },
          },
          categories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.artwork.count({ where: whereClause }),
    ]);

    // Also search artists if there's a query
    let artists: any[] = [];
    if (filters.query) {
      artists = await prisma.user.findMany({
        where: {
          role: "ARTIST",
          OR: [
            { displayName: { contains: filters.query, mode: "insensitive" } },
            { username: { contains: filters.query, mode: "insensitive" } },
            { bio: { contains: filters.query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          displayName: true,
          username: true,
          bio: true,
          avatar: true,
          artistProfile: {
            select: {
              specialties: true,
            },
          },
          _count: {
            select: {
              artworks: true,
              followers: true,
            },
          },
        },
        take: 10,
      });
    }

    return {
      artworks: artworks.map((artwork) => ({
        id: artwork.id,
        title: artwork.title,
        description: artwork.description || undefined,
        imageUrl: artwork.primaryImage,
        price: artwork.price ? Number(artwork.price) : undefined,
        isForSale: artwork.isForSale,
        createdAt: artwork.createdAt,
        artist: {
          id: artwork.artist.id,
          displayName: artwork.artist.displayName || artwork.artist.username,
          username: artwork.artist.username,
          avatar: artwork.artist.avatar || undefined,
        },
        category: artwork.categories[0]?.category || null,
        _count: artwork._count,
      })),
      artists: artists.map((artist) => ({
        ...artist,
        specialties: artist.artistProfile?.specialties || [],
      })),
      total,
      hasMore: offset + limit < total,
    };
  }

  // Notifications
  static async createNotification(
    userId: string,
    data: {
      type: string;
      title: string;
      message: string;
      fromUserId?: string;
      actionUrl?: string;
      metadata?: any;
    }
  ) {
    return await prisma.notification.create({
      data: {
        userId,
        ...data,
      },
    });
  }

  static async getUserNotifications(userId: string, limit = 20, offset = 0) {
    return await prisma.notification.findMany({
      where: { userId },
      include: {
        fromUser: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
  }

  static async markNotificationAsRead(notificationId: string, userId: string) {
    return await prisma.notification.update({
      where: {
        id: notificationId,
        userId, // Ensure user owns the notification
      },
      data: { isRead: true },
    });
  }

  static async markAllNotificationsAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
  }

  // Recommendations
  static async getRecommendedArtworks(userId: string, limit = 20) {
    // Simple recommendation based on user's liked categories and followed artists
    const userLikes = await prisma.like.findMany({
      where: { userId },
      include: {
        artwork: {
          include: { category: true },
        },
      },
      take: 50,
    });

    const likedCategories = [
      ...new Set(userLikes.map((like) => like.artwork.categoryId)),
    ];

    const followedArtists = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });

    const followedArtistIds = followedArtists.map((f) => f.followingId);

    return await prisma.artwork.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { categoryId: { in: likedCategories } },
          { artistId: { in: followedArtistIds } },
        ],
        NOT: {
          likes: {
            some: { userId },
          },
        },
      },
      include: {
        artist: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatar: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: [{ likes: { _count: "desc" } }, { createdAt: "desc" }],
      take: limit,
    });
  }

  static async getCollectionById(collectionId: string, userId: string) {
    return await prisma.collection.findFirst({
      where: {
        id: collectionId,
        userId: userId, // Ensure user owns the collection
      },
      include: {
        _count: {
          select: { artworks: true },
        },
        artworks: {
          include: {
            artwork: {
              include: {
                artist: {
                  select: {
                    id: true,
                    displayName: true,
                    username: true,
                    avatar: true,
                  },
                },
                categories: {
                  include: {
                    category: true,
                  },
                },
                tags: {
                  include: {
                    tag: true,
                  },
                },
                _count: {
                  select: {
                    likes: true,
                    comments: true,
                  },
                },
              },
            },
          },
          orderBy: { addedAt: "desc" },
        },
      },
    });
  }
}

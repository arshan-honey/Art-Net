import { Prisma, PrismaClient } from "@prisma/client";
import type {
  ArtistProfile,
  Artwork,
  Commission,
  ArtistStats,
} from "@/lib/types/artist";

const prisma = new PrismaClient();

export class ArtistService {
  // Artist Profile Management
  static async getAllArtists(params?: {
    searchQuery?: string;
    specialty?: string;
    sortBy?: "popular" | "recent" | "artworks" | "likes";
    page?: number;
    limit?: number;
  }): Promise<{
    artists: Array<{
      id: string;
      name: string;
      username: string;
      bio: string | null;
      avatar: string | null;
      coverImage: string | null;
      specialties: string[];
      location: string | null;
      joinDate: Date;
      followers: number;
      artworks: number;
      totalLikes: number;
      featured: boolean;
      verified: boolean;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    try {
      const {
        searchQuery,
        specialty,
        sortBy = "popular",
        page = 1,
        limit = 12,
      } = params || {};

      const skip = (page - 1) * limit;

      // Build where clause for filtering
      const whereClause: any = {
        role: "ARTIST",
        status: "ACTIVE",
        AND: [
          {
            artistProfile: {
              isNot: null,
            },
          },
          {
            artistProfile: {
              isPublic: true,
            },
          },
        ],
      };

      // Add search filter
      if (searchQuery) {
        whereClause.OR = [
          { displayName: { contains: searchQuery, mode: "insensitive" } },
          { username: { contains: searchQuery, mode: "insensitive" } },
          { bio: { contains: searchQuery, mode: "insensitive" } },
        ];
      }

      // Add specialty filter
      if (specialty && specialty !== "all") {
        whereClause.AND.push({
          artistProfile: {
            specialties: {
              has: specialty,
            },
          },
        });
      }

      // Build order clause
      let orderBy: any = { createdAt: "desc" }; // Default fallback
      switch (sortBy) {
        case "popular":
          // Sort by follower count
          orderBy = { createdAt: "desc" }; // We'll sort in application code since _count in orderBy is complex
          break;
        case "recent":
          orderBy = { createdAt: "desc" };
          break;
        case "artworks":
          // Sort by artwork count
          orderBy = { createdAt: "desc" }; // We'll sort in application code
          break;
        case "likes":
          // Sort by total likes
          orderBy = { createdAt: "desc" }; // We'll sort in application code
          break;
        default:
          orderBy = { createdAt: "desc" };
      }

      const [artists, total] = await Promise.all([
        prisma.user.findMany({
          where: whereClause,
          include: {
            artistProfile: {
              select: {
                specialties: true,
                totalViews: true,
                totalLikes: true,
                totalFollowers: true,
                isPublic: true,
              },
            },
            _count: {
              select: {
                followers: true,
                artworks: true,
              },
            },
          },
          orderBy,
          skip,
          take: limit,
        }),
        prisma.user.count({ where: whereClause }),
      ]);

      return {
        artists: artists
          .map((artist) => ({
            id: artist.id,
            name:
              artist.displayName ||
              `${artist.firstName || ""} ${artist.lastName || ""}`.trim() ||
              artist.username,
            username: artist.username,
            bio: artist.bio,
            avatar: artist.avatar,
            coverImage: artist.coverImage,
            specialties: artist.artistProfile?.specialties || [],
            location: artist.location,
            joinDate: artist.createdAt,
            followers: artist._count.followers,
            artworks: artist._count.artworks,
            totalLikes: artist.artistProfile?.totalLikes || 0,
            featured: false, // TODO: Add featured field to schema
            verified: artist.isVerified,
          }))
          .sort((a, b) => {
            // Apply sorting in application code
            switch (sortBy) {
              case "popular":
                return b.followers - a.followers;
              case "recent":
                return (
                  new Date(b.joinDate).getTime() -
                  new Date(a.joinDate).getTime()
                );
              case "artworks":
                return b.artworks - a.artworks;
              case "likes":
                return b.totalLikes - a.totalLikes;
              default:
                return (
                  new Date(b.joinDate).getTime() -
                  new Date(a.joinDate).getTime()
                );
            }
          }),
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error("Error fetching artists:", error);
      const { page = 1, limit = 12 } = params || {};
      return {
        artists: [],
        total: 0,
        page,
        limit,
      };
    }
  }

  static async getArtistProfile(userId: string): Promise<ArtistProfile | null> {
    try {
      const profile = await prisma.artistProfile.findUnique({
        where: { userId },
        include: {
          user: {
            select: {
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });

      if (!profile) return null;

      return {
        id: profile.id,
        userId: profile.userId,
        artistStatement: profile.artistStatement || undefined,
        specialties: profile.specialties,
        website: profile.website || undefined,
        socialLinks: profile.socialLinks as Record<string, string>,
        acceptCommissions: profile.acceptCommissions,
        commissionInfo: profile.commissionInfo || undefined,
        minCommissionPrice: profile.minCommissionPrice || undefined,
        maxCommissionPrice: profile.maxCommissionPrice || undefined,
        isPublic: profile.isPublic,
        isVerified: profile.isVerified,
        verificationDate: profile.verificationDate || undefined,
        portfolioLayout: profile.portfolioLayout,
        showPrices: profile.showPrices,
        contactEmail: profile.contactEmail || undefined,
        location: profile.location || undefined,
        experience: profile.experience || undefined,
        education: profile.education || undefined,
        exhibitions: profile.exhibitions || undefined,
        awards: profile.awards || undefined,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      console.error("Error fetching artist profile:", error);
      return null;
    }
  }

  static async updateArtistProfile(
    userId: string,
    data: Partial<
      Omit<ArtistProfile, "id" | "userId" | "createdAt" | "updatedAt">
    >
  ): Promise<ArtistProfile | null> {
    try {
      const profile = await prisma.artistProfile.update({
        where: { userId },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return this.getArtistProfile(userId);
    } catch (error) {
      console.error("Error updating artist profile:", error);
      return null;
    }
  }

  // Artwork Management
  static async getArtistArtworks(
    artistId: string,
    options: {
      status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
      limit?: number;
      offset?: number;
      includeStats?: boolean;
    } = {}
  ): Promise<{ artworks: Artwork[]; total: number }> {
    try {
      const { status, limit = 20, offset = 0, includeStats = false } = options;

      const where = {
        artistId,
        ...(status && { status }),
      };

      const [artworks, total] = await Promise.all([
        prisma.artwork.findMany({
          where,
          include: {
            images: {
              orderBy: { sortOrder: "asc" },
            },
            tags: {
              include: {
                tag: true,
              },
            },
            categories: { include: { category: true } },
            ...(includeStats && {
              likes: { select: { id: true } },
              comments: { select: { id: true } },
            }),
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
        }),
        prisma.artwork.count({ where }),
      ]);

      const formattedArtworks: Artwork[] = artworks.map((artwork) => ({
        id: artwork.id,
        title: artwork.title,
        description: artwork.description || undefined,
        slug: artwork.slug,
        artistId: artwork.artistId,
        categoryId: artwork.categories[0]?.category?.id || undefined,
        tags: artwork.tags.map((t) => ({
          id: t.tag.id,
          name: t.tag.name,
          color: t.tag.color || undefined,
          usageCount: t.tag.usageCount,
        })),
        images: artwork.images.map((img) => ({
          id: img.id,
          artworkId: img.artworkId,
          url: img.url,
          altText: img.altText || undefined,
          isPrimary: img.url === artwork.primaryImage,
          order: img.sortOrder,
          width: undefined,
          height: undefined,
          fileSize: undefined,
          createdAt: img.createdAt,
        })),
        price: artwork.price ? Number(artwork.price) : undefined,
        currency: artwork.currency || "USD",
        isForSale: artwork.isForSale,
        licenseType: artwork.licenseType as
          | "PERSONAL"
          | "COMMERCIAL"
          | "EXCLUSIVE"
          | undefined,
        dimensions: artwork.dimensions || undefined,
        medium: artwork.medium || undefined,
        yearCreated: artwork.yearCreated || undefined,
        status: artwork.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        isFeatured: artwork.isFeatured,
        viewCount: artwork.views,
        likeCount: includeStats ? artwork.likes?.length || 0 : 0,
        commentCount: includeStats ? artwork.comments?.length || 0 : 0,
        createdAt: artwork.createdAt,
        updatedAt: artwork.updatedAt,
        publishedAt: artwork.publishedAt || undefined,
      }));

      return { artworks: formattedArtworks, total };
    } catch (error) {
      console.error("Error fetching artist artworks:", error);
      return { artworks: [], total: 0 };
    }
  }

  static async createArtwork(
    artistId: string,
    data: {
      title: string;
      description?: string;
      categoryId?: string;
      tags?: string[];
      images: Array<{
        url: string;
        altText?: string;
        isPrimary?: boolean;
        width?: number;
        height?: number;
        fileSize?: number;
      }>;
      price?: number;
      currency?: string;
      isForSale?: boolean;
      licenseType?: "PERSONAL" | "COMMERCIAL" | "EXCLUSIVE";
      dimensions?: string;
      medium?: string;
      yearCreated?: number;
      status?: "DRAFT" | "PUBLISHED";
    }
  ): Promise<Artwork | null> {
    try {
      const slug = this.generateSlug(data.title);

      // Find the primary image URL
      const primaryImageUrl =
        data.images.find((img) => img.isPrimary)?.url || data.images[0]?.url;

      if (!primaryImageUrl) {
        throw new Error("At least one image is required to create an artwork");
      }

      // Look up category first (outside transaction)
      let categoryId = null;
      if (data.categoryId) {
        const category = await prisma.category.findFirst({
          where: {
            OR: [
              { id: data.categoryId },
              { name: data.categoryId },
              { slug: data.categoryId.toLowerCase().replace(/\s+/g, "-") },
            ],
          },
        });
        if (category) {
          categoryId = category.id;
        }
      }

      // Process tags first (outside transaction)
      const tagIds: string[] = [];
      if (data.tags && data.tags.length > 0) {
        for (const tagName of data.tags) {
          const tag = await prisma.tag.upsert({
            where: { name: tagName },
            update: { usageCount: { increment: 1 } },
            create: {
              name: tagName,
              slug: tagName.toLowerCase().replace(/\s+/g, "-"),
              usageCount: 1,
            },
          });
          tagIds.push(tag.id);
        }
      }

      // Create artwork with a simpler transaction
      const artwork = await prisma.$transaction(async (tx) => {
        // Create artwork
        const newArtwork = await tx.artwork.create({
          data: {
            title: data.title,
            description: data.description,
            slug,
            artistId,
            primaryImage: primaryImageUrl,
            price: data.price,
            currency: data.currency || "USD",
            isForSale: data.isForSale || false,
            licenseType: data.licenseType
              ? this.mapLicenseType(data.licenseType)
              : "ALL_RIGHTS_RESERVED",
            medium: data.medium,
            yearCreated: data.yearCreated,
            status: data.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
            publishedAt: data.status === "PUBLISHED" ? new Date() : null,
          },
        });

        // Create images
        if (data.images.length > 0) {
          await tx.artworkImage.createMany({
            data: data.images.map((img, index) => ({
              artworkId: newArtwork.id,
              url: img.url,
              altText: img.altText,
              sortOrder: index,
            })),
          });
        }

        // Link category
        if (categoryId) {
          await tx.artworkCategory.create({
            data: {
              artworkId: newArtwork.id,
              categoryId: categoryId,
            },
          });
        }

        // Link tags
        if (tagIds.length > 0) {
          await tx.artworkTag.createMany({
            data: tagIds.map((tagId) => ({
              artworkId: newArtwork.id,
              tagId: tagId,
            })),
          });
        }

        return newArtwork;
      });

      return this.getArtworkById(artwork.id);
    } catch (error) {
      console.error("Error creating artwork:", error);
      return null;
    }
  }

  // Helper method to map license types
  private static mapLicenseType(type: "PERSONAL" | "COMMERCIAL" | "EXCLUSIVE") {
    switch (type) {
      case "PERSONAL":
        return "PERSONAL_USE";
      case "COMMERCIAL":
        return "COMMERCIAL_USE";
      case "EXCLUSIVE":
        return "EXCLUSIVE_LICENSE";
      default:
        return "ALL_RIGHTS_RESERVED";
    }
  }

  static async updateArtwork(
    artworkId: string,
    artistId: string,
    data: Partial<{
      title: string;
      description: string;
      categoryId: string;
      tags: string[];
      price: number;
      isForSale: boolean;
      licenseType: "PERSONAL" | "COMMERCIAL" | "EXCLUSIVE";
      dimensions: string;
      medium: string;
      yearCreated: number;
      status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    }>
  ): Promise<Artwork | null> {
    try {
      const artwork = await prisma.artwork.findFirst({
        where: { id: artworkId, artistId },
      });

      if (!artwork) return null;

      const updatedArtwork = await prisma.$transaction(async (tx) => {
        // Extract categoryId and tags from data, create clean update object
        const { categoryId, tags, ...cleanData } = data;

        // Map license type if provided
        if (cleanData.licenseType) {
          cleanData.licenseType = this.mapLicenseType(
            cleanData.licenseType
          ) as any;
        }

        // Update artwork with clean data (no categoryId or tags)
        const updated = await tx.artwork.update({
          where: { id: artworkId },
          data: {
            ...cleanData,
            publishedAt:
              data.status === "PUBLISHED" && artwork.status !== "PUBLISHED"
                ? new Date()
                : artwork.publishedAt,
            updatedAt: new Date(),
          },
        });

        // Handle category if provided
        if (categoryId) {
          // Remove existing categories
          await tx.artworkCategory.deleteMany({
            where: { artworkId },
          });

          // Find category by name (since we're passing category name, not ID)
          const category = await tx.category.findFirst({
            where: { name: categoryId },
          });

          if (category) {
            // Add new category
            await tx.artworkCategory.create({
              data: {
                artworkId,
                categoryId: category.id,
              },
            });
          }
        }

        // Handle tags if provided
        if (tags) {
          // Remove existing tags
          await tx.artworkTag.deleteMany({
            where: { artworkId },
          });

          // Add new tags
          for (const tagName of tags) {
            const tag = await tx.tag.upsert({
              where: { name: tagName },
              update: { usageCount: { increment: 1 } },
              create: {
                name: tagName,
                slug: tagName
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, ""),
                usageCount: 1,
              },
            });

            await tx.artworkTag.create({
              data: {
                artworkId,
                tagId: tag.id,
              },
            });
          }
        }

        return updated;
      });

      return this.getArtworkById(artworkId);
    } catch (error) {
      console.error("Error updating artwork:", error);
      return null;
    }
  }

  static async deleteArtwork(
    artworkId: string,
    artistId: string
  ): Promise<boolean> {
    try {
      const artwork = await prisma.artwork.findFirst({
        where: { id: artworkId, artistId },
      });

      if (!artwork) return false;

      await prisma.artwork.delete({
        where: { id: artworkId },
      });

      return true;
    } catch (error) {
      console.error("Error deleting artwork:", error);
      return false;
    }
  }

  static async getArtworkById(artworkId: string): Promise<Artwork | null> {
    try {
      const artwork = await prisma.artwork.findUnique({
        where: { id: artworkId },
        include: {
          images: { orderBy: { sortOrder: "asc" } },
          tags: { include: { tag: true } },
          categories: { include: { category: true } },
        },
      });

      if (!artwork) return null;

      return {
        id: artwork.id,
        title: artwork.title,
        description: artwork.description || undefined,
        slug: artwork.slug,
        artistId: artwork.artistId,
        categoryId: artwork.categories[0]?.category?.id || undefined,
        tags: artwork.tags.map((t) => ({
          id: t.tag.id,
          name: t.tag.name,
          color: t.tag.color || undefined,
          usageCount: t.tag.usageCount,
        })),
        images: artwork.images.map((img) => ({
          id: img.id,
          artworkId: img.artworkId,
          url: img.url,
          altText: img.altText || undefined,
          isPrimary: img.url === artwork.primaryImage,
          order: img.sortOrder,
          width: undefined,
          height: undefined,
          fileSize: undefined,
          createdAt: img.createdAt,
        })),
        price: artwork.price ? Number(artwork.price) : undefined,
        currency: artwork.currency || "USD",
        isForSale: artwork.isForSale,
        licenseType: artwork.licenseType as
          | "PERSONAL"
          | "COMMERCIAL"
          | "EXCLUSIVE"
          | undefined,
        dimensions: artwork.dimensions || undefined,
        medium: artwork.medium || undefined,
        yearCreated: artwork.yearCreated || undefined,
        status: artwork.status as "DRAFT" | "PUBLISHED" | "ARCHIVED",
        isFeatured: artwork.isFeatured,
        viewCount: artwork.views,
        likeCount: 0, // We'll calculate this separately if needed
        commentCount: 0, // We'll calculate this separately if needed
        createdAt: artwork.createdAt,
        updatedAt: artwork.updatedAt,
        publishedAt: artwork.publishedAt || undefined,
      };
    } catch (error) {
      console.error("Error fetching artwork:", error);
      return null;
    }
  }

  // Artist Statistics
  static async getArtistStats(artistId: string): Promise<ArtistStats | null> {
    try {
      const [
        totalArtworks,
        totalViews,
        totalLikes,
        totalComments,
        totalFollowers,
        totalSales,
        monthlyStats,
        topArtworks,
      ] = await Promise.all([
        prisma.artwork.count({ where: { artistId, status: "PUBLISHED" } }),
        prisma.artwork.aggregate({
          where: { artistId, status: "PUBLISHED" },
          _sum: { views: true },
        }),
        // For likes, we need to count the actual Like records
        prisma.like.count({
          where: { artwork: { artistId, status: "PUBLISHED" } },
        }),
        // For comments, we need to count the actual Comment records
        prisma.comment.count({
          where: { artwork: { artistId, status: "PUBLISHED" } },
        }),
        prisma.follow.count({ where: { followingId: artistId } }),
        0, // Total sales - would need Transaction model
        this.getMonthlyStats(artistId),
        this.getTopArtworks(artistId),
      ]);

      return {
        totalArtworks,
        totalViews: totalViews._sum.views || 0,
        totalLikes: totalLikes,
        totalComments: totalComments,
        totalFollowers,
        totalSales,
        monthlyViews: monthlyStats.views,
        monthlyLikes: monthlyStats.likes,
        topArtworks,
      };
    } catch (error) {
      console.error("Error fetching artist stats:", error);
      return null;
    }
  }

  private static async getMonthlyStats(
    artistId: string
  ): Promise<{ views: number; likes: number }> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    try {
      const [likes] = await Promise.all([
        prisma.like.count({
          where: {
            artwork: { artistId },
            createdAt: { gte: startOfMonth },
          },
        }),
      ]);

      return { views: 0, likes }; // Views would need a separate tracking system
    } catch (error) {
      return { views: 0, likes: 0 };
    }
  }

  private static async getTopArtworks(
    artistId: string
  ): Promise<ArtistStats["topArtworks"]> {
    try {
      const artworks = await prisma.artwork.findMany({
        where: { artistId, status: "PUBLISHED" },
        select: {
          id: true,
          title: true,
          views: true,
          likes: {
            select: {
              id: true,
            },
          },
        },
        orderBy: [{ views: "desc" }, { createdAt: "desc" }],
        take: 5,
      });

      return artworks.map((artwork) => ({
        id: artwork.id,
        title: artwork.title,
        views: artwork.views,
        likes: artwork.likes.length,
      }));
    } catch (error) {
      return [];
    }
  }

  // Commission Management
  static async getArtistCommissions(
    artistId: string,
    status?: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  ): Promise<Commission[]> {
    try {
      const commissions = await prisma.commission.findMany({
        where: {
          artistId,
          ...(status && { status }),
        },
        include: {
          client: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return commissions.map((commission) => ({
        id: commission.id,
        artistId: commission.artistId,
        clientId: commission.clientId,
        title: commission.title,
        description: commission.description,
        budget: commission.budget || undefined,
        deadline: commission.deadline || undefined,
        status: commission.status as Commission["status"],
        createdAt: commission.createdAt,
        updatedAt: commission.updatedAt,
      }));
    } catch (error) {
      console.error("Error fetching commissions:", error);
      return [];
    }
  }

  static async updateCommissionStatus(
    commissionId: string,
    artistId: string,
    status: "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  ): Promise<Commission | null> {
    try {
      const commission = await prisma.commission.findFirst({
        where: { id: commissionId, artistId },
      });

      if (!commission) return null;

      const updated = await prisma.commission.update({
        where: { id: commissionId },
        data: { status, updatedAt: new Date() },
        include: {
          client: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatar: true,
            },
          },
        },
      });

      return {
        id: updated.id,
        artistId: updated.artistId,
        clientId: updated.clientId,
        title: updated.title,
        description: updated.description,
        budget: updated.budget || undefined,
        deadline: updated.deadline || undefined,
        status: updated.status as Commission["status"],
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    } catch (error) {
      console.error("Error updating commission status:", error);
      return null;
    }
  }

  // Utility methods
  private static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .substring(0, 50);
  }

  static async getArtistByUsername(username: string): Promise<{
    id: string;
    name: string;
    username: string;
    bio: string | null;
    avatar: string | null;
    coverImage: string | null;
    location: string | null;
    website: string | null;
    joinDate: Date;
    verified: boolean;
    featured: boolean;
    followers: number;
    following: number;
    totalArtworks: number;
    totalLikes: number;
    totalViews: number;
    specialties: string[];
    achievements: Array<{
      title: string;
      description: string;
      date: string;
    }>;
    profile: ArtistProfile | null;
  } | null> {
    try {
      // First find the user by username
      const user = await prisma.user.findUnique({
        where: { username },
        include: {
          artistProfile: true,
          artworks: {
            select: {
              id: true,
              views: true,
              likes: {
                select: {
                  id: true,
                },
              },
            },
          },
          followers: true,
          following: true,
        },
      });

      if (!user) return null;

      // Calculate stats
      const totalArtworks = user.artworks.length;
      const totalLikes = user.artworks.reduce(
        (sum, artwork) => sum + artwork.likes.length,
        0
      );
      const totalViews = user.artworks.reduce(
        (sum, artwork) => sum + artwork.views,
        0
      );

      // Format achievements from awards and exhibitions strings
      const achievements = [];
      if (user.artistProfile?.awards) {
        achievements.push({
          title: "Awards",
          description: user.artistProfile.awards,
          date: user.artistProfile.createdAt.toISOString().split("T")[0],
        });
      }
      if (user.artistProfile?.exhibitions) {
        achievements.push({
          title: "Exhibitions",
          description: user.artistProfile.exhibitions,
          date: user.artistProfile.createdAt.toISOString().split("T")[0],
        });
      }

      return {
        id: user.id,
        name: user.displayName || user.username,
        username: user.username,
        bio: user.bio,
        avatar: user.avatar,
        coverImage: user.coverImage,
        location: user.location,
        website: user.website,
        joinDate: user.createdAt,
        verified: user.isVerified,
        featured: false, // This would need to be implemented in the schema
        followers: user.followers.length,
        following: user.following.length,
        totalArtworks,
        totalLikes,
        totalViews,
        specialties: user.artistProfile?.specialties || [],
        achievements,
        profile: user.artistProfile
          ? {
              id: user.artistProfile.id,
              userId: user.artistProfile.userId,
              artistStatement: user.artistProfile.artistStatement || undefined,
              specialties: user.artistProfile.specialties,
              website: user.website || undefined,
              socialLinks: user.artistProfile.socialLinks as Record<
                string,
                string
              >,
              acceptCommissions: user.artistProfile.acceptCommissions,
              commissionInfo: user.artistProfile.commissionInfo || undefined,
              minCommissionPrice: undefined,
              maxCommissionPrice: undefined,
              isPublic: user.artistProfile.isPublic,
              isVerified: user.isVerified,
              verificationDate: undefined,
              portfolioLayout: "GRID" as const,
              showPrices: false,
              contactEmail: user.artistProfile.businessEmail || undefined,
              location: user.location || undefined,
              experience: user.artistProfile.experience || undefined,
              education: user.artistProfile.education || undefined,
              exhibitions: user.artistProfile.exhibitions || undefined,
              awards: user.artistProfile.awards || undefined,
              createdAt: user.artistProfile.createdAt,
              updatedAt: user.artistProfile.updatedAt,
            }
          : null,
      };
    } catch (error) {
      console.error("Error fetching artist by username:", error);
      return null;
    }
  }
}

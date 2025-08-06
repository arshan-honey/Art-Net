import { PrismaClient } from "@prisma/client";
import type {
  AdminStats,
  UserManagement,
  ArtworkManagement,
  ContentReport,
  SystemSettings,
  AuditLog,
  CategoryManagement,
  BulkAction,
  AnalyticsData,
} from "@/lib/types/admin";

const prisma = new PrismaClient();

export class AdminService {
  // Dashboard Stats
  static async getDashboardStats(): Promise<AdminStats> {
    const [
      totalUsers,
      totalArtists,
      totalArtworks,
      totalCollections,
      pendingReports,
      flaggedContent,
      lastMonthUsers,
      lastMonthArtworks,
      lastMonthArtists,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "ARTIST" } }),
      prisma.artwork.count(),
      prisma.collection.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.artwork.count({ where: { status: "UNDER_REVIEW" } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.artwork.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.user.count({
        where: {
          role: "ARTIST",
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalUsers,
      totalArtists,
      totalArtworks,
      totalCollections,
      pendingReports,
      flaggedContent,
      monthlyGrowth: {
        users: lastMonthUsers,
        artworks: lastMonthArtworks,
        artists: lastMonthArtists,
      },
    };
  }

  // User Management
  static async getUsers(
    filters: {
      role?: string;
      status?: string;
      search?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
    limit = 20,
    offset = 0
  ): Promise<{ users: UserManagement[]; total: number }> {
    const whereClause: any = {};

    if (filters.role) {
      whereClause.role = filters.role;
    }

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.search) {
      whereClause.OR = [
        { email: { contains: filters.search, mode: "insensitive" } },
        { username: { contains: filters.search, mode: "insensitive" } },
        { displayName: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          artistProfile: {
            select: {
              id: true,
              specialties: true,
              acceptCommissions: true,
            },
          },
          _count: {
            select: {
              artworks: true,
              followers: true,
              following: true,
              collections: true,
              comments: true,
              likes: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const formattedUsers: UserManagement[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName || user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: user.role,
      status: user.status as any,
      avatar: user.avatar || undefined,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt || undefined,
      isVerified: user.isVerified,
      artworksCount: user._count.artworks,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      collectionsCount: user._count.collections,
      commentsCount: user._count.comments,
      likesCount: user._count.likes,
      artistProfile: user.artistProfile
        ? {
            id: user.artistProfile.id,
            specialties: user.artistProfile.specialties,
            acceptCommissions: user.artistProfile.acceptCommissions,
          }
        : undefined,
      reportCount: 0, // Would need separate query
      warningCount: 0, // Would need separate query
    }));

    return { users: formattedUsers, total };
  }

  static async updateUserStatus(
    userId: string,
    status: string,
    reason?: string,
    adminId?: string
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
    });

    // Create audit log
    if (adminId) {
      await this.createAuditLog({
        action: `USER_STATUS_CHANGED_TO_${status}`,
        entityType: "USER",
        entityId: userId,
        adminId,
        reason,
        newValues: { status },
      });
    }

    return user;
  }

  static async deleteUser(userId: string, adminId: string, reason?: string) {
    // Soft delete - update status instead of actual deletion
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        status: "DEACTIVATED" as any, // Use DEACTIVATED instead of BANNED
        email: `deleted_${Date.now()}_${user.email}`, // Prevent email conflicts
      },
    });

    await this.createAuditLog({
      action: "USER_DELETED",
      entityType: "USER",
      entityId: userId,
      adminId,
      reason,
    });

    return updatedUser;
  }

  static async updateUser(
    userId: string,
    data: {
      displayName?: string;
      email?: string;
      role?: string;
      status?: string;
      firstName?: string;
      lastName?: string;
    },
    adminId: string
  ) {
    const oldUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!oldUser) {
      throw new Error("User not found");
    }

    // Filter out undefined values
    const updateData: any = {};
    if (data.displayName !== undefined) updateData.displayName = data.displayName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Create audit log
    await this.createAuditLog({
      action: "USER_UPDATED",
      entityType: "USER",
      entityId: userId,
      adminId,
      oldValues: {
        displayName: oldUser.displayName,
        email: oldUser.email,
        role: oldUser.role,
        status: oldUser.status,
        firstName: oldUser.firstName,
        lastName: oldUser.lastName,
      },
      newValues: updateData,
    });

    return updatedUser;
  }

  // Artwork Management
  static async getArtworks(
    filters: {
      status?: string;
      category?: string;
      artist?: string;
      search?: string;
      flagged?: boolean;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
    limit = 20,
    offset = 0
  ): Promise<{ artworks: ArtworkManagement[]; total: number }> {
    const whereClause: any = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.category) {
      whereClause.categoryId = filters.category;
    }

    if (filters.artist) {
      whereClause.artistId = filters.artist;
    }

    if (filters.flagged) {
      whereClause.status = "UNDER_REVIEW";
    }

    if (filters.search) {
      whereClause.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { tags: { hasSome: [filters.search] } },
      ];
    }

    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
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
              email: true,
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

    const formattedArtworks: ArtworkManagement[] = artworks.map((artwork) => ({
      id: artwork.id,
      title: artwork.title,
      description: artwork.description || undefined,
      imageUrl: artwork.primaryImage, // Use primaryImage from schema
      status: artwork.status as any,
      isForSale: artwork.isForSale,
      price: artwork.price ? Number(artwork.price) : undefined,
      createdAt: artwork.createdAt,
      updatedAt: artwork.updatedAt,
      artist: {
        id: artwork.artist.id,
        displayName: artwork.artist.displayName || artwork.artist.username,
        username: artwork.artist.username,
        email: artwork.artist.email,
        avatar: artwork.artist.avatar || undefined,
      },
      category: artwork.categories[0]?.category || null, // Use first category from categories array
      tags: [], // Tags would need separate query from ArtworkTag relationship
      medium: artwork.medium || undefined,
      dimensions: artwork.dimensions
        ? JSON.stringify(artwork.dimensions)
        : undefined,
      yearCreated: artwork.yearCreated || undefined,
      viewCount: artwork.views || 0, // Use views field directly
      likeCount: artwork._count.likes,
      commentCount: artwork._count.comments,
      shareCount: 0, // Would need separate tracking
      reportCount: 0, // Would need separate query
    }));

    return { artworks: formattedArtworks, total };
  }

  static async updateArtworkStatus(
    artworkId: string,
    status: string,
    adminId: string,
    reason?: string,
    notes?: string
  ) {
    const artwork = await prisma.artwork.update({
      where: { id: artworkId },
      data: {
        status: status as any,
        // moderatedAt, moderatedBy, and moderationNotes don't exist in schema
      },
    });

    await this.createAuditLog({
      action: `ARTWORK_STATUS_CHANGED_TO_${status}`,
      entityType: "ARTWORK",
      entityId: artworkId,
      adminId,
      reason,
      notes,
      newValues: { status },
    });

    return artwork;
  }

  static async deleteArtwork(
    artworkId: string,
    adminId: string,
    reason?: string
  ) {
    const artwork = await prisma.artwork.delete({
      where: { id: artworkId },
    });

    await this.createAuditLog({
      action: "ARTWORK_DELETED",
      entityType: "ARTWORK",
      entityId: artworkId,
      adminId,
      reason,
    });

    return artwork;
  }

  // Content Reports
  static async getReports(
    filters: {
      status?: string;
      type?: string;
      priority?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    } = {},
    limit = 20,
    offset = 0
  ): Promise<{ reports: ContentReport[]; total: number }> {
    const whereClause: any = {};

    if (filters.status) {
      whereClause.status = filters.status;
    }

    if (filters.type) {
      whereClause.type = filters.type;
    }

    if (filters.priority) {
      whereClause.priority = filters.priority;
    }

    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: whereClause,
        include: {
          reportedBy: {
            select: {
              id: true,
              displayName: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.report.count({ where: whereClause }),
    ]);

    // Format reports with target information
    const formattedReports: ContentReport[] = await Promise.all(
      reports.map(async (report) => {
        let target: any = {
          id: report.contentId || report.reportedUserId || "",
          type: report.contentType || "USER",
        };

        // Fetch target details based on contentType
        if (report.contentId && report.contentType) {
          switch (report.contentType.toUpperCase()) {
            case "ARTWORK":
              const artwork = await prisma.artwork.findUnique({
                where: { id: report.contentId },
                select: { title: true },
              });
              target = {
                ...target,
                title: artwork?.title,
                url: `/artwork/${report.contentId}`,
              };
              break;
            case "USER":
              const user = await prisma.user.findUnique({
                where: { id: report.contentId },
                select: { displayName: true, username: true },
              });
              target = {
                ...target,
                title: user?.displayName,
                url: `/user/${user?.username}`,
              };
              break;
            // Add other cases as needed
          }
        } else if (report.reportedUserId) {
          // This is a user report
          const user = await prisma.user.findUnique({
            where: { id: report.reportedUserId },
            select: { displayName: true, username: true },
          });
          target = {
            ...target,
            title: user?.displayName,
            url: `/user/${user?.username}`,
            type: "USER",
          };
        }

        return {
          id: report.id,
          type: (report.contentType?.toUpperCase() || "USER") as any,
          targetId: report.contentId || report.reportedUserId || "",
          reason: report.reason as any,
          description: report.description || undefined,
          status: report.status as any,
          priority: "MEDIUM" as any, // Default priority since it's not in schema
          createdAt: report.createdAt,
          resolvedAt: undefined, // Not available in current schema
          reporter: {
            id: report.reportedBy.id,
            displayName:
              report.reportedBy.displayName || report.reportedBy.username,
            username: report.reportedBy.username,
            email: report.reportedBy.email,
          },
          target,
          resolution: report.resolution as any,
          resolutionNotes: report.resolution || undefined,
          resolvedBy: undefined, // Not available in current schema
        };
      })
    );

    return { reports: formattedReports, total };
  }

  static async resolveReport(
    reportId: string,
    resolution: string,
    notes: string,
    adminId: string
  ) {
    const report = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: "RESOLVED",
        resolution: notes, // Use resolution field for notes since resolutionNotes doesn't exist
        reviewedBy: adminId, // Use reviewedBy instead of resolvedById
      },
    });

    await this.createAuditLog({
      action: "REPORT_RESOLVED",
      entityType: "REPORT",
      entityId: reportId,
      adminId,
      notes,
      newValues: { status: "RESOLVED", resolution },
    });

    return report;
  }

  // System Settings - Commented out as SystemSetting model doesn't exist
  static async getSettings(category?: string): Promise<SystemSettings[]> {
    // TODO: Implement when SystemSetting model is added to schema
    return [];
    /*
    const whereClause = category ? { category: category as any } : {}

    return await prisma.systemSetting.findMany({
      where: whereClause,
      orderBy: { category: "asc" },
    })
    */
  }

  static async updateSetting(
    key: string,
    value: string | number | boolean,
    adminId: string
  ) {
    // TODO: Implement when SystemSetting model is added to schema
    return null;
    /*
    const oldSetting = await prisma.systemSetting.findUnique({
      where: { key },
    })

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: {
        value: value.toString(),
        updatedAt: new Date(),
        updatedBy: adminId,
      },
      create: {
        key,
        value: value.toString(),
        category: "GENERAL", // Default category
        description: "",
        isPublic: false,
        updatedBy: adminId,
      },
    })

    await this.createAuditLog({
      action: "SETTING_UPDATED",
      entityType: "SETTING",
      entityId: key,
      adminId,
      oldValues: { value: oldSetting?.value },
      newValues: { value: value.toString() },
    })

    return setting
    */
  }

  // Categories Management
  static async getCategories(): Promise<CategoryManagement[]> {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { artworks: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      slug: category.slug,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
      artworkCount: category._count.artworks,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));
  }

  static async createCategory(
    data: {
      name: string;
      description?: string;
      slug: string;
      isActive?: boolean;
      sortOrder?: number;
    },
    adminId: string
  ) {
    const category = await prisma.category.create({
      data: {
        ...data,
        isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });

    await this.createAuditLog({
      action: "CATEGORY_CREATED",
      entityType: "CATEGORY",
      entityId: category.id,
      adminId,
      newValues: data,
    });

    return category;
  }

  static async updateCategory(
    categoryId: string,
    data: Partial<CategoryManagement>,
    adminId: string
  ) {
    const oldCategory = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    // Filter out properties that don't exist in Prisma schema
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.slug) updateData.slug = data.slug;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    const category = await prisma.category.update({
      where: { id: categoryId },
      data: updateData,
    });

    await this.createAuditLog({
      action: "CATEGORY_UPDATED",
      entityType: "CATEGORY",
      entityId: categoryId,
      adminId,
      oldValues: oldCategory || {},
      newValues: updateData,
    });

    return category;
  }

  // Bulk Actions
  static async performBulkAction(action: BulkAction, adminId: string) {
    const results = [];

    for (const entityId of action.entityIds) {
      try {
        let result;
        switch (action.action) {
          case "APPROVE":
            if (action.entityType === "ARTWORK") {
              result = await this.updateArtworkStatus(
                entityId,
                "PUBLISHED",
                adminId,
                action.reason,
                action.notes
              );
            }
            break;
          case "REJECT":
            if (action.entityType === "ARTWORK") {
              result = await this.updateArtworkStatus(
                entityId,
                "REJECTED",
                adminId,
                action.reason,
                action.notes
              );
            }
            break;
          case "SUSPEND":
            if (action.entityType === "USER") {
              result = await this.updateUserStatus(
                entityId,
                "SUSPENDED",
                action.reason,
                adminId
              );
            }
            break;
          case "DELETE":
            if (action.entityType === "ARTWORK") {
              result = await this.deleteArtwork(
                entityId,
                adminId,
                action.reason
              );
            } else if (action.entityType === "USER") {
              result = await this.deleteUser(entityId, adminId, action.reason);
            }
            break;
        }
        results.push({ entityId, success: true, result });
      } catch (error) {
        results.push({
          entityId,
          success: false,
          error: (error as Error).message,
        });
      }
    }

    await this.createAuditLog({
      action: `BULK_${action.action}`,
      entityType: action.entityType,
      entityId: "BULK",
      adminId,
      reason: action.reason,
      notes: action.notes,
      newValues: { entityIds: action.entityIds, results },
    });

    return results;
  }

  // Audit Logs - Commented out as AuditLog model doesn't exist
  static async createAuditLog(data: {
    action: string;
    entityType: string;
    entityId: string;
    adminId: string;
    oldValues?: Record<string, any>;
    newValues?: Record<string, any>;
    reason?: string;
    notes?: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    // TODO: Implement when AuditLog model is added to schema
    return null;
    /*
    const admin = await prisma.user.findUnique({
      where: { id: data.adminId },
      select: { displayName: true, username: true },
    })

    return await prisma.auditLog.create({
      data: {
        ...data,
        adminName: admin?.displayName || admin?.username || "Unknown Admin",
        createdAt: new Date(),
      },
    })
    */
  }

  static async getAuditLogs(
    filters: {
      action?: string;
      entityType?: string;
      adminId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {},
    limit = 50,
    offset = 0
  ): Promise<{ logs: AuditLog[]; total: number }> {
    // TODO: Implement when AuditLog model is added to schema
    return { logs: [], total: 0 };
    /*
    const whereClause: any = {}

    if (filters.action) {
      whereClause.action = { contains: filters.action, mode: "insensitive" }
    }

    if (filters.entityType) {
      whereClause.entityType = filters.entityType
    }

    if (filters.adminId) {
      whereClause.adminId = filters.adminId
    }

    if (filters.startDate || filters.endDate) {
      whereClause.createdAt = {}
      if (filters.startDate) whereClause.createdAt.gte = filters.startDate
      if (filters.endDate) whereClause.createdAt.lte = filters.endDate
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.auditLog.count({ where: whereClause }),
    ])

    return { logs, total }
    */
  }

  // Analytics
  static async getAnalytics(
    period: "DAY" | "WEEK" | "MONTH" | "YEAR",
    startDate: Date,
    endDate: Date
  ): Promise<AnalyticsData> {
    // This would involve complex aggregation queries
    // For now, returning basic metrics
    const [userMetrics, contentMetrics, moderationMetrics] = await Promise.all([
      // User metrics
      prisma.user.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: true,
      }),
      // Content metrics
      prisma.artwork.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: true,
      }),
      // Moderation metrics
      prisma.report.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: true,
      }),
    ]);

    return {
      period,
      startDate,
      endDate,
      userMetrics: {
        totalUsers: userMetrics._count,
        newUsers: userMetrics._count,
        activeUsers: 0, // Would need session tracking
        retentionRate: 0, // Would need complex calculation
        churnRate: 0,
      },
      contentMetrics: {
        totalArtworks: contentMetrics._count,
        newArtworks: contentMetrics._count,
        publishedArtworks: 0, // Would need status filter
        featuredArtworks: 0,
        averageViews: 0,
        averageLikes: 0,
      },
      engagementMetrics: {
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        totalShares: 0,
        averageSessionDuration: 0,
      },
      moderationMetrics: {
        totalReports: moderationMetrics._count,
        resolvedReports: 0, // Would need status filter
        pendingReports: 0,
        averageResolutionTime: 0,
        contentRemoved: 0,
        usersSuspended: 0,
      },
    };
  }
}

import { UserStatus } from "@prisma/client";

export interface AdminStats {
  totalUsers: number
  totalArtists: number
  totalArtworks: number
  totalCollections: number
  pendingReports: number
  flaggedContent: number
  monthlyGrowth: {
    users: number
    artworks: number
    artists: number
  }
  revenueStats?: {
    totalRevenue: number
    monthlyRevenue: number
    commissionRevenue: number
  }
}

export interface UserManagement {
  id: string
  email: string
  username: string
  displayName: string
  firstName?: string
  lastName?: string
  role: "VISITOR" | "ENTHUSIAST" | "ARTIST" | "ADMIN"
  status: UserStatus
  avatar?: string
  createdAt: Date
  lastLoginAt?: Date
  isVerified: boolean

  // Stats
  artworksCount: number
  followersCount: number
  followingCount: number
  collectionsCount: number
  commentsCount: number
  likesCount: number

  // Artist specific
  artistProfile?: {
    id: string
    specialties: string[]
    acceptCommissions: boolean
    totalEarnings?: number
  }

  // Moderation
  reportCount: number
  warningCount: number
  lastWarningAt?: Date
}

export interface ArtworkManagement {
  id: string
  title: string
  description?: string
  imageUrl: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "FLAGGED" | "REJECTED"
  isForSale: boolean
  price?: number
  createdAt: Date
  updatedAt: Date

  // Artist info
  artist: {
    id: string
    displayName: string
    username: string
    email: string
    avatar?: string
  }

  // Category and tags
  category: {
    id: string
    name: string
  }
  tags: string[]
  medium?: string
  dimensions?: string
  yearCreated?: number

  // Engagement stats
  viewCount: number
  likeCount: number
  commentCount: number
  shareCount: number

  // Moderation
  reportCount: number
  flagReason?: string
  moderatedAt?: Date
  moderatedBy?: string
  moderationNotes?: string
}

export interface ContentReport {
  id: string
  type: "ARTWORK" | "COMMENT" | "USER" | "COLLECTION"
  targetId: string
  reason: "INAPPROPRIATE" | "SPAM" | "COPYRIGHT" | "HARASSMENT" | "FAKE" | "OTHER"
  description?: string
  status: "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  createdAt: Date
  resolvedAt?: Date

  // Reporter info
  reporter: {
    id: string
    displayName: string
    username: string
    email: string
  }

  // Target info
  target: {
    id: string
    title?: string
    content?: string
    type: string
    url?: string
  }

  // Resolution
  resolution?: "NO_ACTION" | "WARNING" | "CONTENT_REMOVED" | "USER_SUSPENDED" | "USER_BANNED"
  resolutionNotes?: string
  resolvedBy?: {
    id: string
    displayName: string
    username: string
  }
}

export interface SystemSettings {
  id: string
  category: "GENERAL" | "SECURITY" | "CONTENT" | "NOTIFICATIONS" | "PAYMENTS"
  key: string
  value: string | number | boolean
  description: string
  isPublic: boolean
  updatedAt: Date
  updatedBy: string
}

export interface AuditLog {
  id: string
  action: string
  entityType: "USER" | "ARTWORK" | "REPORT" | "SETTING" | "CATEGORY"
  entityId: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  adminId: string
  adminName: string
  ipAddress?: string
  userAgent?: string
  createdAt: Date

  // Additional context
  reason?: string
  notes?: string
}

export interface CategoryManagement {
  id: string
  name: string
  description?: string
  slug: string
  isActive: boolean
  sortOrder: number
  artworkCount: number
  createdAt: Date
  updatedAt: Date

  // Hierarchy
  parentId?: string
  children?: CategoryManagement[]

  // SEO
  metaTitle?: string
  metaDescription?: string
}

export interface AdminNotification {
  id: string
  type: "REPORT" | "USER_SIGNUP" | "ARTWORK_UPLOAD" | "SYSTEM_ALERT" | "REVENUE"
  title: string
  message: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  isRead: boolean
  actionRequired: boolean
  actionUrl?: string
  metadata?: Record<string, any>
  createdAt: Date

  // Related entities
  userId?: string
  artworkId?: string
  reportId?: string
}

export interface BulkAction {
  action: "APPROVE" | "REJECT" | "DELETE" | "SUSPEND" | "ACTIVATE" | "FEATURE"
  entityType: "USER" | "ARTWORK" | "REPORT"
  entityIds: string[]
  reason?: string
  notes?: string
}

export interface AnalyticsData {
  period: "DAY" | "WEEK" | "MONTH" | "YEAR"
  startDate: Date
  endDate: Date

  userMetrics: {
    totalUsers: number
    newUsers: number
    activeUsers: number
    retentionRate: number
    churnRate: number
  }

  contentMetrics: {
    totalArtworks: number
    newArtworks: number
    publishedArtworks: number
    featuredArtworks: number
    averageViews: number
    averageLikes: number
  }

  engagementMetrics: {
    totalViews: number
    totalLikes: number
    totalComments: number
    totalShares: number
    averageSessionDuration: number
  }

  moderationMetrics: {
    totalReports: number
    resolvedReports: number
    pendingReports: number
    averageResolutionTime: number
    contentRemoved: number
    usersSuspended: number
  }

  revenueMetrics?: {
    totalRevenue: number
    commissionRevenue: number
    subscriptionRevenue: number
    averageOrderValue: number
    conversionRate: number
  }
}

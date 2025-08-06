export interface ArtistProfile {
  id: string
  userId: string
  artistStatement?: string
  specialties: string[]
  website?: string
  socialLinks: Record<string, string>
  acceptCommissions: boolean
  commissionInfo?: string
  minCommissionPrice?: number
  maxCommissionPrice?: string
  isPublic: boolean
  isVerified: boolean
  verificationDate?: Date
  portfolioLayout: "GRID" | "MASONRY" | "LIST"
  showPrices: boolean
  contactEmail?: string
  location?: string
  experience?: string
  education?: string
  exhibitions?: string
  awards?: string
  createdAt: Date
  updatedAt: Date
}

export interface Artwork {
  id: string
  title: string
  description?: string
  slug: string
  artistId: string
  categoryId?: string
  tags: ArtworkTag[]
  images: ArtworkImage[]
  price?: number
  currency: string
  isForSale: boolean
  licenseType?: "PERSONAL" | "COMMERCIAL" | "EXCLUSIVE"
  dimensions?: string
  medium?: string
  yearCreated?: number
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  isFeatured: boolean
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export interface ArtworkImage {
  id: string
  artworkId: string
  url: string
  altText?: string
  isPrimary: boolean
  order: number
  width?: number
  height?: number
  fileSize?: number
  createdAt: Date
}

export interface ArtworkTag {
  id: string
  name: string
  color?: string
  usageCount: number
}

export interface Commission {
  id: string
  artistId: string
  clientId: string
  title: string
  description: string
  budget?: number
  deadline?: Date
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  createdAt: Date
  updatedAt: Date
}

export interface ArtistStats {
  totalArtworks: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalFollowers: number
  totalSales: number
  monthlyViews: number
  monthlyLikes: number
  topArtworks: Array<{
    id: string
    title: string
    views: number
    likes: number
  }>
}

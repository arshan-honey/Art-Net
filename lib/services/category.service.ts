import { prisma } from "@/lib/prisma"

export interface CategoryWithStats {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
  artworkCount: number
  artistCount: number
  featuredArtworks: Array<{
    id: string
    title: string
    primaryImage: string
    artistName: string
  }>
  children?: CategoryWithStats[]
}

export interface CategoryFilters {
  trending?: boolean
  limit?: number
  includeInactive?: boolean
}

export class CategoryService {
  static async getAllCategories(): Promise<CategoryWithStats[]> {
    try {
      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
        },
        include: {
          artworks: {
            include: {
              artwork: {
                select: {
                  id: true,
                  title: true,
                  primaryImage: true,
                  status: true,
                  isFeatured: true,
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
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      })

      return categories.map((category) => {
        const publishedArtworks = category.artworks?.filter(
          (aw) => aw.artwork.status === "PUBLISHED"
        ) || []

        const featuredArtworks = publishedArtworks
          .filter((aw) => aw.artwork.isFeatured)
          .slice(0, 3)
          .map((aw) => ({
            id: aw.artwork.id,
            title: aw.artwork.title,
            primaryImage: aw.artwork.primaryImage,
            artistName: aw.artwork.artist.displayName || aw.artwork.artist.username,
          }))

        // Get unique artists count
        const uniqueArtists = new Set(
          publishedArtworks.map((aw) => aw.artwork.artist.id)
        )

        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          parentId: category.parentId,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          artworkCount: publishedArtworks.length,
          artistCount: uniqueArtists.size,
          featuredArtworks,
        }
      })
    } catch (error) {
      console.error("Error fetching categories:", error)
      return []
    }
  }

  static async getTrendingCategories(limit: number = 6): Promise<CategoryWithStats[]> {
    try {
      // Get categories with most artworks uploaded in the last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const categories = await prisma.category.findMany({
        where: {
          isActive: true,
          artworks: {
            some: {
              artwork: {
                status: "PUBLISHED",
                createdAt: {
                  gte: thirtyDaysAgo,
                },
              },
            },
          },
        },
        include: {
          artworks: {
            include: {
              artwork: {
                select: {
                  id: true,
                  title: true,
                  primaryImage: true,
                  status: true,
                  isFeatured: true,
                  createdAt: true,
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
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      })

      // Calculate trending score and format data
      const categoriesWithTrending = categories.map((category) => {
        const publishedArtworks = category.artworks?.filter(
          (aw) => aw.artwork.status === "PUBLISHED"
        ) || []

        const recentArtworks = publishedArtworks.filter(
          (aw) => new Date(aw.artwork.createdAt) >= thirtyDaysAgo
        )

        const featuredArtworks = publishedArtworks
          .filter((aw) => aw.artwork.isFeatured)
          .slice(0, 3)
          .map((aw) => ({
            id: aw.artwork.id,
            title: aw.artwork.title,
            primaryImage: aw.artwork.primaryImage,
            artistName: aw.artwork.artist.displayName || aw.artwork.artist.username,
          }))

        const uniqueArtists = new Set(
          publishedArtworks.map((aw) => aw.artwork.artist.id)
        )

        return {
          ...category,
          artworkCount: publishedArtworks.length,
          artistCount: uniqueArtists.size,
          featuredArtworks,
          recentCount: recentArtworks.length,
        }
      })

      // Sort by recent activity and return top categories
      return categoriesWithTrending
        .sort((a, b) => b.recentCount - a.recentCount)
        .slice(0, limit)
        .map(({ recentCount, ...category }) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          parentId: category.parentId,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          artworkCount: category.artworkCount,
          artistCount: category.artistCount,
          featuredArtworks: category.featuredArtworks,
        }))
    } catch (error) {
      console.error("Error fetching trending categories:", error)
      return []
    }
  }

  /**
   * Get categories with flexible filters
   */
  static async getCategories(filters: CategoryFilters = {}): Promise<CategoryWithStats[]> {
    const { trending = false, limit = 0, includeInactive = false } = filters;

    if (trending) {
      return this.getTrendingCategories(limit || 6);
    }

    try {
      const categories = await prisma.category.findMany({
        where: {
          isActive: includeInactive ? undefined : true,
        },
        include: {
          artworks: {
            include: {
              artwork: {
                select: {
                  id: true,
                  title: true,
                  primaryImage: true,
                  status: true,
                  isFeatured: true,
                  artistId: true,
                  createdAt: true,
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
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
      });

      // Transform data to include counts
      let result = categories.map(category => {
        const publishedArtworks = category.artworks?.filter(
          (aw) => aw.artwork.status === "PUBLISHED"
        ) || []

        const featuredArtworks = publishedArtworks
          .filter((aw) => aw.artwork.isFeatured)
          .slice(0, 3)
          .map((aw) => ({
            id: aw.artwork.id,
            title: aw.artwork.title,
            primaryImage: aw.artwork.primaryImage,
            artistName: aw.artwork.artist.displayName || aw.artwork.artist.username,
          }))

        const uniqueArtists = new Set(
          publishedArtworks.map((aw) => aw.artwork.artistId)
        )

        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          parentId: category.parentId,
          isActive: category.isActive,
          sortOrder: category.sortOrder,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
          artworkCount: publishedArtworks.length,
          artistCount: uniqueArtists.size,
          featuredArtworks,
        };
      });

      // Apply limit if specified
      if (limit > 0) {
        result = result.slice(0, limit);
      }

      return result;
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }
}
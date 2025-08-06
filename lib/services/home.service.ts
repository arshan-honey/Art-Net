import { prisma } from "@/lib/prisma";

export interface HomeArtwork {
  id: string;
  title: string;
  artist: string;
  category: string;
  image: string;
  likes: number;
  views: number;
  comments: number;
  slug: string;
}

export interface HomeCategory {
  name: string;
  count: number;
  icon: string;
  slug: string;
}

export interface HomeStat {
  label: string;
  value: number;
  icon: string;
}

export interface HomeData {
  featuredArtworks: HomeArtwork[];
  categories: HomeCategory[];
  stats: HomeStat[];
}

export class HomeService {
  /**
   * Get featured artworks for the home page
   */
  static async getFeaturedArtworks(): Promise<HomeArtwork[]> {
    const featuredArtworks = await prisma.artwork.findMany({
      where: {
        status: 'PUBLISHED',
        isPublic: true,
        isFeatured: true,
      },
      include: {
        artist: {
          select: {
            id: true,
            displayName: true,
            firstName: true,
            lastName: true,
            username: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
        likes: {
          select: {
            id: true,
          },
        },
        comments: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        { isFeatured: 'desc' },
        { likes: { _count: 'desc' } },
        { createdAt: 'desc' },
      ],
      take: 6,
    });

    return featuredArtworks.map(artwork => ({
      id: artwork.id,
      title: artwork.title,
      artist: this.getArtistDisplayName(artwork.artist),
      category: artwork.categories[0]?.category.name || 'Uncategorized',
      image: artwork.primaryImage,
      likes: artwork.likes.length,
      views: artwork.views,
      comments: artwork.comments.length,
      slug: artwork.slug,
    }));
  }

  /**
   * Get categories with artwork counts for the home page
   */
  static async getHomeCategories(): Promise<HomeCategory[]> {
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
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
      take: 6,
    });

    return categories.map(category => ({
      name: category.name,
      count: category.artworks.filter(ac => ac.artwork.status === 'PUBLISHED').length,
      icon: this.getCategoryIcon(category.name),
      slug: category.slug,
    }));
  }

  /**
   * Get overall platform statistics
   */
  static async getHomeStats(): Promise<HomeStat[]> {
    const [artistCount, artworkCount, collectionCount, totalViews] = await Promise.all([
      prisma.user.count({
        where: {
          role: 'ARTIST',
          status: 'ACTIVE',
        },
      }),
      prisma.artwork.count({
        where: {
          status: 'PUBLISHED',
          isPublic: true,
        },
      }),
      prisma.collection.count({
        where: {
          visibility: 'PUBLIC',
        },
      }),
      prisma.artwork.aggregate({
        _sum: {
          views: true,
        },
        where: {
          status: 'PUBLISHED',
          isPublic: true,
        },
      }),
    ]);

    return [
      { label: "Artists", value: artistCount, icon: "Users" },
      { label: "Artworks", value: artworkCount, icon: "ImageIcon" },
      { label: "Collections", value: collectionCount, icon: "Heart" },
      { label: "Views", value: totalViews._sum.views || 0, icon: "Eye" },
    ];
  }

  /**
   * Get all home page data
   */
  static async getHomeData(): Promise<HomeData> {
    const [featuredArtworks, categories, stats] = await Promise.all([
      this.getFeaturedArtworks(),
      this.getHomeCategories(),
      this.getHomeStats(),
    ]);

    return {
      featuredArtworks,
      categories,
      stats,
    };
  }

  /**
   * Helper method to get artist display name
   */
  private static getArtistDisplayName(artist: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    username: string;
  }): string {
    if (artist.displayName) {
      return artist.displayName;
    }
    
    const fullName = `${artist.firstName || ''} ${artist.lastName || ''}`.trim();
    return fullName || artist.username;
  }

  /**
   * Helper method to map category names to icons
   */
  private static getCategoryIcon(categoryName: string): string {
    const iconMap: { [key: string]: string } = {
      'Digital Art': 'Palette',
      'Photography': 'ImageIcon',
      'Painting': 'Palette',
      'Sculpture': 'Palette',
      'Mixed Media': 'Layers',
      'Illustration': 'Pen',
    };
    return iconMap[categoryName] || 'Palette';
  }
}

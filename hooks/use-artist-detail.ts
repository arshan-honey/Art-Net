import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

interface Artist {
  id: string;
  name: string;
  username: string;
  bio: string | null;
  avatar: string | null;
  coverImage: string | null;
  location: string | null;
  website: string | null;
  joinDate: string;
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
  isFollowing?: boolean;
}

interface Artwork {
  id: string;
  title: string;
  description?: string;
  slug: string;
  artistId: string;
  categoryId?: string;
  tags: any[];
  images: any[];
  price?: number;
  currency: string;
  isForSale: boolean;
  licenseType?: string;
  dimensions?: string;
  medium?: string;
  yearCreated?: number;
  status: string;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  primaryImage?: string;
  views?: number;
  likes?: number;
  comments?: number;
  category?: string;
  featured?: boolean;
}

interface Collection {
  id: string;
  name: string;
  description: string;
  count: number;
  preview: string | null;
  artworks: Array<{
    id: string;
    title: string;
    image: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export function useArtistDetail(username: string) {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [artworksLoading, setArtworksLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(false);

  useEffect(() => {
    if (!username) return;

    const fetchArtist = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(`/artist/${username}`);

        if (response.error) {
          setError(response.error);
          return;
        }

        // The API returns the artist data directly, not wrapped in a data property
        setArtist(response as any as Artist);
      } catch (err) {
        console.error("Error fetching artist:", err);
        setError("Failed to load artist profile");
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [username]);

  const fetchArtworks = async (filters?: {
    page?: number;
    limit?: number;
    category?: string;
    sortBy?: string;
    featured?: boolean;
  }) => {
    if (!username) return;

    try {
      setArtworksLoading(true);

      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.category) params.append("category", filters.category);
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.featured) params.append("featured", "true");

      const response = await apiClient.get(
        `/artist/${username}/artworks${
          params.toString() ? `?${params.toString()}` : ""
        }`
      );

      if (response.error) {
        console.error("Error fetching artworks:", response.error);
        return;
      }

      setArtworks((response as any)?.artworks || []);
    } catch (err) {
      console.error("Error fetching artworks:", err);
    } finally {
      setArtworksLoading(false);
    }
  };

  const fetchCollections = async () => {
    if (!username) return;

    try {
      setCollectionsLoading(true);

      const response = await apiClient.get(`/artist/${username}/collections`);

      if (response.error) {
        console.error("Error fetching collections:", response.error);
        return;
      }

      setCollections((response as any)?.collections || []);
    } catch (err) {
      console.error("Error fetching collections:", err);
    } finally {
      setCollectionsLoading(false);
    }
  };

  return {
    artist,
    artworks,
    collections,
    loading,
    error,
    artworksLoading,
    collectionsLoading,
    fetchArtworks,
    fetchCollections,
  };
}

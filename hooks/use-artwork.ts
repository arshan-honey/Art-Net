import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

interface ArtworkImage {
  id: string;
  url: string;
  altText?: string;
  caption?: string;
}

interface Artist {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  verified: boolean;
  followers: number;
  specialties: string[];
  isFollowing?: boolean;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  replies: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      username: string;
      avatar?: string;
    };
  }>;
}

interface RelatedArtwork {
  id: string;
  title: string;
  primaryImage: string;
  likes: number;
}

interface Artwork {
  id: string;
  title: string;
  description?: string;
  primaryImage: string;
  images: ArtworkImage[];
  artist: Artist;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isForSale: boolean;
  price?: number;
  currency?: string;
  licenseType: string;
  dimensions?: any;
  medium?: string;
  yearCreated?: number;
  createdAt: string;
  publishedAt?: string;
  formattedComments: Comment[];
  relatedArtworks: RelatedArtwork[];
}

export function useArtwork(id: string) {
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchArtwork = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get(`/artwork/${id}`);

        if (response.error) {
          setError(response.error);
          return;
        }

        setArtwork(response as any as Artwork);
      } catch (err) {
        console.error("Error fetching artwork:", err);
        setError("Failed to load artwork");
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [id]);

  return { artwork, loading, error };
}

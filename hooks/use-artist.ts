"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import type {
  ArtistProfile,
  Artwork,
  ArtistStats,
  Commission,
} from "@/lib/types/artist";

export function useArtistProfile() {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getArtistProfile();
      if (response.success) {
        setProfile(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<ArtistProfile>) => {
    try {
      const response = await apiClient.updateArtistProfile(data);
      if (response.success) {
        setProfile(response.data);
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refetch: fetchProfile,
  };
}

export function useArtistArtworks(params?: {
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  limit?: number;
  offset?: number;
  includeStats?: boolean;
}) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtworks = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getArtistArtworks(params);
      if (response.success) {
        setArtworks(response.data);
        setTotal(response.total || 0);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createArtwork = async (data: any) => {
    try {
      const response = await apiClient.createArtwork(data);
      if (response.success) {
        await fetchArtworks(); // Refresh list
        return response.data;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const updateArtwork = async (id: string, data: any) => {
    try {
      const response = await apiClient.updateArtwork(id, data);
      if (response.success) {
        await fetchArtworks(); // Refresh list
        return response.data;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deleteArtwork = async (id: string) => {
    try {
      const response = await apiClient.deleteArtwork(id);
      if (response.success) {
        await fetchArtworks(); // Refresh list
        return true;
      }
      return false;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchArtworks();
  }, [params?.status, params?.limit, params?.offset]);

  return {
    artworks,
    total,
    isLoading,
    error,
    createArtwork,
    updateArtwork,
    deleteArtwork,
    refetch: fetchArtworks,
  };
}

export function useArtistStats() {
  const [stats, setStats] = useState<ArtistStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getArtistStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

export function useCommissions(status?: string) {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommissions = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCommissions(status);
      if (response.success) {
        setCommissions(response.data);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCommissionStatus = async (id: string, newStatus: string) => {
    try {
      const response = await apiClient.updateCommissionStatus(id, newStatus);
      if (response.success) {
        await fetchCommissions(); // Refresh list
        return response.data;
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  useEffect(() => {
    fetchCommissions();
  }, [status]);

  return {
    commissions,
    isLoading,
    error,
    updateCommissionStatus,
    refetch: fetchCommissions,
  };
}

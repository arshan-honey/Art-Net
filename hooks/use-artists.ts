import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'

interface Artist {
  id: string
  name: string
  username: string
  bio: string | null
  avatar: string | null
  coverImage: string | null
  specialties: string[]
  location: string | null
  joinDate: Date
  followers: number
  artworks: number
  totalLikes: number
  featured: boolean
  verified: boolean
}

interface ArtistsResponse {
  artists: Artist[]
  total: number
  page: number
  limit: number
}

interface UseArtistsParams {
  searchQuery?: string
  specialty?: string
  sortBy?: 'popular' | 'recent' | 'artworks' | 'likes'
  page?: number
  limit?: number
}

export function useArtists(params: UseArtistsParams = {}) {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)

  const fetchArtists = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const searchParams = new URLSearchParams()
      if (params.searchQuery) searchParams.append('search', params.searchQuery)
      if (params.specialty && params.specialty !== 'all') searchParams.append('specialty', params.specialty)
      if (params.sortBy) searchParams.append('sortBy', params.sortBy)
      if (params.page) searchParams.append('page', params.page.toString())
      if (params.limit) searchParams.append('limit', params.limit.toString())

      const response = await apiClient.get<ArtistsResponse>(`/artists?${searchParams.toString()}`)
      
      console.log('Artists API Response:', response)
      
      // The ApiClient wraps the response, so we need to access the actual data
      // The artists API returns data directly in the response
      if (response && typeof response === 'object') {
        // Check if it's wrapped in ApiResponse format
        const data = ('data' in response) ? response.data : response as any
        
        if (data && data.artists) {
          console.log('Found artists in data:', data.artists.length)
          setArtists(data.artists)
          setTotal(data.total || 0)
          setPage(data.page || 1)
          setLimit(data.limit || 12)
        } else if ((response as any).artists) {
          // Handle direct response format
          const directResponse = response as any
          console.log('Found artists in direct response:', directResponse.artists.length)
          setArtists(directResponse.artists)
          setTotal(directResponse.total || 0)
          setPage(directResponse.page || 1)
          setLimit(directResponse.limit || 12)
        } else {
          console.log('No artists found in response:', response)
          setError('No artists data received')
        }
      } else {
        console.log('Invalid response format:', response)
        setError('Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching artists:', err)
      setError('Failed to fetch artists')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtists()
  }, [params.searchQuery, params.specialty, params.sortBy, params.page, params.limit])

  const refetch = () => {
    fetchArtists()
  }

  return {
    artists,
    loading,
    error,
    total,
    page,
    limit,
    refetch
  }
}

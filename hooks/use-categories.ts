import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

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

export function useCategories(options?: {
  includeInactive?: boolean
  includeStats?: boolean
  includeChildren?: boolean
  parentId?: string | null
  trending?: boolean
  limit?: number
}) {
  const [categories, setCategories] = useState<CategoryWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        
        if (options?.includeInactive) {
          params.append('includeInactive', 'true')
        }
        if (options?.includeStats === false) {
          params.append('includeStats', 'false')
        }
        if (options?.includeChildren === false) {
          params.append('includeChildren', 'false')
        }
        if (options?.parentId) {
          params.append('parentId', options.parentId)
        }
        if (options?.trending) {
          params.append('trending', 'true')
        }
        if (options?.limit) {
          params.append('limit', options.limit.toString())
        }

        const response = await apiClient.get(`/art-categories?${params.toString()}`)
        setCategories(response as unknown as CategoryWithStats[])
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Failed to fetch categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [
    options?.includeInactive,
    options?.includeStats,
    options?.includeChildren,
    options?.parentId,
    options?.trending,
    options?.limit
  ])

  return { categories, loading, error }
}

export function useTrendingCategories(limit: number = 6) {
  return useCategories({ trending: true, limit })
}
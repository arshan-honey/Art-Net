"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import type {
  AdminStats,
  UserManagement,
  ArtworkManagement,
  ContentReport,
  SystemSettings,
  CategoryManagement,
  AuditLog,
  AnalyticsData,
} from "@/lib/types/admin"

// Admin Stats Hook
export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getAdminStats()
      setStats(response.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  }
}

// Admin Users Hook
export function useAdminUsers() {
  const [users, setUsers] = useState<UserManagement[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchUsers = async (params?: {
    role?: string
    status?: string
    search?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
    limit?: number
    offset?: number
  }) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getAdminUsers(params)
      setUsers(response.data)
      setTotal(response.total || 0)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, status: string, reason?: string) => {
    try {
      await apiClient.updateUserStatus(userId, status, reason)
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: status as any } : user)))
      toast({
        title: "Success",
        description: "User status updated successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user status"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteUser = async (userId: string, reason?: string) => {
    try {
      await apiClient.deleteUser(userId, reason)
      setUsers((prev) => prev.filter((user) => user.id !== userId))
      setTotal((prev) => prev - 1)
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete user"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const updateUser = async (userId: string, userData: {
    displayName?: string;
    email?: string;
    role?: string;
    status?: string;
    firstName?: string;
    lastName?: string;
  }) => {
    try {
      await apiClient.updateUser(userId, userData)
      setUsers((prev) => 
        prev.map((user) => 
          user.id === userId 
            ? { ...user, ...userData } 
            : user
        )
      )
      toast({
        title: "Success",
        description: "User updated successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update user"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    users,
    total,
    isLoading,
    error,
    fetchUsers,
    updateUserStatus,
    deleteUser,
    updateUser,
    refetch: fetchUsers,
  }
}

// Admin Artworks Hook
export function useAdminArtworks() {
  const [artworks, setArtworks] = useState<ArtworkManagement[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchArtworks = async (params?: {
    status?: string
    category?: string
    artist?: string
    search?: string
    flagged?: boolean
    sortBy?: string
    sortOrder?: "asc" | "desc"
    limit?: number
    offset?: number
  }) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getAdminArtworks(params)
      setArtworks(response.data)
      setTotal(response.total || 0)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch artworks")
    } finally {
      setIsLoading(false)
    }
  }

  const updateArtworkStatus = async (artworkId: string, status: string, reason?: string, notes?: string) => {
    try {
      await apiClient.updateArtworkStatus(artworkId, status, reason, notes)
      setArtworks((prev) =>
        prev.map((artwork) => (artwork.id === artworkId ? { ...artwork, status: status as any } : artwork)),
      )
      toast({
        title: "Success",
        description: "Artwork status updated successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update artwork status"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const deleteArtwork = async (artworkId: string, reason?: string) => {
    try {
      await apiClient.deleteArtworkAdmin(artworkId, reason)
      setArtworks((prev) => prev.filter((artwork) => artwork.id !== artworkId))
      setTotal((prev) => prev - 1)
      toast({
        title: "Success",
        description: "Artwork deleted successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete artwork"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    fetchArtworks()
  }, [])

  return {
    artworks,
    total,
    isLoading,
    error,
    fetchArtworks,
    updateArtworkStatus,
    deleteArtwork,
    refetch: fetchArtworks,
  }
}

// Admin Reports Hook
export function useAdminReports() {
  const [reports, setReports] = useState<ContentReport[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchReports = async (params?: {
    status?: string
    type?: string
    priority?: string
    sortBy?: string
    sortOrder?: "asc" | "desc"
    limit?: number
    offset?: number
  }) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getAdminReports(params)
      setReports(response.data)
      setTotal(response.total || 0)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reports")
    } finally {
      setIsLoading(false)
    }
  }

  const resolveReport = async (reportId: string, resolution: string, notes: string) => {
    try {
      await apiClient.resolveReport(reportId, resolution, notes)
      setReports((prev) =>
        prev.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status: "RESOLVED",
                resolution: resolution as any,
                resolutionNotes: notes,
                resolvedAt: new Date(),
              }
            : report,
        ),
      )
      toast({
        title: "Success",
        description: "Report resolved successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resolve report"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    fetchReports()
  }, [])

  return {
    reports,
    total,
    isLoading,
    error,
    fetchReports,
    resolveReport,
    refetch: fetchReports,
  }
}

// Admin Settings Hook
export function useAdminSettings() {
  const [settings, setSettings] = useState<SystemSettings[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchSettings = async (category?: string) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getAdminSettings(category)
      setSettings(response.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch settings")
    } finally {
      setIsLoading(false)
    }
  }

  const updateSetting = async (key: string, value: string | number | boolean) => {
    try {
      await apiClient.updateAdminSetting(key, value)
      setSettings((prev) =>
        prev.map((setting) => (setting.key === key ? { ...setting, value: value.toString() } : setting)),
      )
      toast({
        title: "Success",
        description: "Setting updated successfully",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update setting"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    updateSetting,
    refetch: fetchSettings,
  }
}

// Admin Categories Hook
export function useAdminCategories() {
  const [categories, setCategories] = useState<CategoryManagement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCategories = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getAdminCategories()
      setCategories(response.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch categories")
    } finally {
      setIsLoading(false)
    }
  }

  const createCategory = async (data: {
    name: string
    description?: string
    slug: string
    isActive?: boolean
    sortOrder?: number
  }) => {
    try {
      const response = await apiClient.createAdminCategory(data)
      setCategories((prev) => [response.data, ...prev])
      toast({
        title: "Success",
        description: "Category created successfully",
      })
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create category"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  const updateCategory = async (categoryId: string, data: any) => {
    try {
      const response = await apiClient.updateAdminCategory(categoryId, data)
      setCategories((prev) => prev.map((cat) => (cat.id === categoryId ? response.data : cat)))
      toast({
        title: "Success",
        description: "Category updated successfully",
      })
      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update category"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    isLoading,
    error,
    createCategory,
    updateCategory,
    refetch: fetchCategories,
  }
}

// Bulk Actions Hook
export function useBulkActions() {
  const { toast } = useToast()

  const performBulkAction = async (action: {
    action: "APPROVE" | "REJECT" | "DELETE" | "SUSPEND" | "ACTIVATE" | "FEATURE"
    entityType: "USER" | "ARTWORK" | "REPORT"
    entityIds: string[]
    reason?: string
    notes?: string
  }) => {
    try {
      const response = await apiClient.performBulkAction(action)
      const successCount = response.data.filter((r: any) => r.success).length
      const failureCount = response.data.filter((r: any) => !r.success).length

      toast({
        title: "Bulk Action Complete",
        description: `${successCount} items processed successfully${failureCount > 0 ? `, ${failureCount} failed` : ""}`,
      })

      return response.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to perform bulk action"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      throw err
    }
  }

  return {
    performBulkAction,
  }
}

// Audit Logs Hook
export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = async (params?: {
    action?: string
    entityType?: string
    adminId?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  }) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getAuditLogs(params)
      setLogs(response.data)
      setTotal(response.total || 0)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch audit logs")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  return {
    logs,
    total,
    isLoading,
    error,
    fetchLogs,
    refetch: fetchLogs,
  }
}

// Analytics Hook
export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async (period: "DAY" | "WEEK" | "MONTH" | "YEAR", startDate: Date, endDate: Date) => {
    try {
      setIsLoading(true)
      const response = await apiClient.getAnalytics(period, startDate, endDate)
      setAnalytics(response.data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics")
    } finally {
      setIsLoading(false)
    }
  }

  return {
    analytics,
    isLoading,
    error,
    fetchAnalytics,
  }
}

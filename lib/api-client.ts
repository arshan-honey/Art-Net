interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  user?: any;
  error?: string;
  message?: string;
  details?: any[];
  total?: number;
  limit?: number;
  offset?: number;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // Use relative path if no base URL is configured (for same-origin requests)
    const url = this.baseUrl
      ? `${this.baseUrl}/api${endpoint}`
      : `/api${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Include cookies
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Don't log authentication errors as they're expected when user is not logged in
        const isAuthError =
          response.status === 401 &&
          (data.error === "Not authenticated" ||
            data.error === "Unauthorized" ||
            data.error === "Invalid credentials");

        if (!isAuthError) {
          console.error(
            "API request error:",
            data.error || "An error occurred"
          );
        }

        throw new Error(data.error || "An error occurred");
      }

      return data;
    } catch (error) {
      // Only log non-authentication errors
      if (error instanceof Error) {
        const isAuthError =
          error.message === "Not authenticated" ||
          error.message === "Unauthorized" ||
          error.message === "Invalid credentials";

        if (!isAuthError) {
          console.error("API request error:", error);
        }
      }
      throw error;
    }
  }

  // Generic HTTP methods
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async signup(data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role: "ENTHUSIAST" | "ARTIST";
    artistData?: {
      artistStatement?: string;
      specialties?: string[];
      acceptCommissions?: boolean;
    };
  }) {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser() {
    return this.request("/auth/me");
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  // Image Upload methods
  async uploadSingleImage(data: {
    image: string; // base64
    folder?: string;
    tags?: string[];
    context?: Record<string, string>;
    public_id?: string;
  }) {
    return this.request("/upload/image", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async uploadMultipleImages(data: {
    images: string[]; // base64 array
    folder?: string;
    tags?: string[];
    context?: Record<string, string>;
    public_id_prefix?: string;
  }) {
    return this.request("/upload/multiple", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getSignedUploadUrl(data: {
    folder?: string;
    tags?: string[];
    context?: Record<string, string>;
    public_id?: string;
  }) {
    return this.request("/upload/signed-url", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Avatar methods
  async uploadAvatar(image: string) {
    return this.request("/user/profile/avatar", {
      method: "POST",
      body: JSON.stringify({ image }),
    });
  }

  async deleteAvatar() {
    return this.request("/user/profile/avatar", {
      method: "DELETE",
    });
  }

  // Artist Profile methods
  async getArtistProfile() {
    return this.request("/artist/profile");
  }

  async updateArtistProfile(data: any) {
    return this.request("/artist/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Artwork methods
  async getArtistArtworks(params?: {
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    limit?: number;
    offset?: number;
    includeStats?: boolean;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());
    if (params?.includeStats) searchParams.set("includeStats", "true");

    const query = searchParams.toString();
    return this.request(`/artist/artworks${query ? `?${query}` : ""}`);
  }

  async createArtwork(data: any) {
    return this.request("/artist/artworks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getArtwork(id: string) {
    return this.request(`/artist/artworks/${id}`);
  }

  async updateArtwork(id: string, data: any) {
    return this.request(`/artist/artworks/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteArtwork(id: string) {
    return this.request(`/artist/artworks/${id}`, {
      method: "DELETE",
    });
  }

  // Stats methods
  async getArtistStats() {
    return this.request("/artist/stats");
  }

  // Commission methods
  async getCommissions(status?: string) {
    const query = status ? `?status=${status}` : "";
    return this.request(`/artist/commissions${query}`);
  }

  async updateCommissionStatus(id: string, status: string) {
    return this.request(`/artist/commissions/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  // User Profile methods
  async getUserProfile() {
    return this.request("/user/profile");
  }

  async updateUserProfile(data: any) {
    return this.request("/user/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Collections methods
  async getUserCollections(includeArtworks = false) {
    const query = includeArtworks ? "?includeArtworks=true" : "";
    return this.request(`/user/collections${query}`);
  }

  async createCollection(data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }) {
    return this.request("/user/collections", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateCollection(id: string, data: any) {
    return this.request(`/user/collections/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteCollection(id: string) {
    return this.request(`/user/collections/${id}`, {
      method: "DELETE",
    });
  }

  async addToCollection(collectionId: string, artworkId: string) {
    return this.request(`/user/collections/${collectionId}/artworks`, {
      method: "POST",
      body: JSON.stringify({ artworkId }),
    });
  }

  async removeFromCollection(collectionId: string, artworkId: string) {
    return this.request(
      `/user/collections/${collectionId}/artworks?artworkId=${artworkId}`,
      {
        method: "DELETE",
      }
    );
  }

  async getCollection(id: string) {
    return this.request(`/user/collections/${id}`);
  }

  // Social methods
  async followArtist(artistId: string) {
    return this.request("/user/social/follow", {
      method: "POST",
      body: JSON.stringify({ artistId }),
    });
  }

  async unfollowArtist(artistId: string) {
    return this.request(`/user/social/follow?artistId=${artistId}`, {
      method: "DELETE",
    });
  }

  async likeArtwork(artworkId: string) {
    return this.request("/user/social/like", {
      method: "POST",
      body: JSON.stringify({ artworkId }),
    });
  }

  async unlikeArtwork(artworkId: string) {
    return this.request(`/user/social/like?artworkId=${artworkId}`, {
      method: "DELETE",
    });
  }

  // Comments methods
  async addComment(artworkId: string, content: string, parentId?: string) {
    return this.request("/user/comments", {
      method: "POST",
      body: JSON.stringify({ artworkId, content, parentId }),
    });
  }

  async getComments(artworkId: string, limit = 20, offset = 0) {
    return this.request(
      `/user/comments?artworkId=${artworkId}&limit=${limit}&offset=${offset}`
    );
  }

  // Activity methods
  async getUserActivity(limit = 20, offset = 0) {
    return this.request(`/user/activity?limit=${limit}&offset=${offset}`);
  }

  // Search methods
  async searchContent(filters: any, limit = 20, offset = 0) {
    const searchParams = new URLSearchParams();

    if (filters.query) searchParams.set("query", filters.query);
    if (filters.categories?.length) {
      filters.categories.forEach((cat: string) =>
        searchParams.append("categories", cat)
      );
    }
    if (filters.mediums?.length) {
      filters.mediums.forEach((medium: string) =>
        searchParams.append("mediums", medium)
      );
    }
    if (filters.sortBy) searchParams.set("sortBy", filters.sortBy);
    if (filters.artistId) searchParams.set("artistId", filters.artistId);
    if (filters.isForSale !== undefined)
      searchParams.set("isForSale", filters.isForSale.toString());
    if (filters.priceRange?.min)
      searchParams.set("minPrice", filters.priceRange.min.toString());
    if (filters.priceRange?.max)
      searchParams.set("maxPrice", filters.priceRange.max.toString());

    searchParams.set("limit", limit.toString());
    searchParams.set("offset", offset.toString());

    return this.request(`/user/search?${searchParams.toString()}`);
  }

  // Notifications methods
  async getNotifications(limit = 20, offset = 0) {
    return this.request(`/user/notifications?limit=${limit}&offset=${offset}`);
  }

  async markNotificationAsRead(id: string) {
    return this.request(`/user/notifications/${id}`, {
      method: "PUT",
    });
  }

  async markAllNotificationsAsRead() {
    return this.request("/user/notifications?action=markAllRead", {
      method: "PUT",
    });
  }

  // Recommendations methods
  async getRecommendations(limit = 20) {
    return this.request(`/user/recommendations?limit=${limit}`);
  }

  // Admin methods
  async getAdminStats() {
    return this.request("/admin/stats");
  }

  async getAdminUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.set("role", params.role);
    if (params?.status) searchParams.set("status", params.status);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return this.request(`/admin/users${query ? `?${query}` : ""}`);
  }

  async updateUserStatus(userId: string, status: string, reason?: string) {
    return this.request(`/admin/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify({ status, reason }),
    });
  }

  async deleteUser(userId: string, reason?: string) {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    return this.request(`/admin/users/${userId}${query}`, {
      method: "DELETE",
    });
  }

  async getAdminArtworks(params?: {
    status?: string;
    category?: string;
    artist?: string;
    search?: string;
    flagged?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.category) searchParams.set("category", params.category);
    if (params?.artist) searchParams.set("artist", params.artist);
    if (params?.search) searchParams.set("search", params.search);
    if (params?.flagged) searchParams.set("flagged", params.flagged.toString());
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return this.request(`/admin/artworks${query ? `?${query}` : ""}`);
  }

  async updateArtworkStatus(
    artworkId: string,
    status: string,
    reason?: string,
    notes?: string
  ) {
    return this.request(`/admin/artworks/${artworkId}`, {
      method: "PUT",
      body: JSON.stringify({ status, reason, notes }),
    });
  }

  async deleteArtworkAdmin(artworkId: string, reason?: string) {
    const query = reason ? `?reason=${encodeURIComponent(reason)}` : "";
    return this.request(`/admin/artworks/${artworkId}${query}`, {
      method: "DELETE",
    });
  }

  async getAdminReports(params?: {
    status?: string;
    type?: string;
    priority?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set("status", params.status);
    if (params?.type) searchParams.set("type", params.type);
    if (params?.priority) searchParams.set("priority", params.priority);
    if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
    if (params?.sortOrder) searchParams.set("sortOrder", params.sortOrder);
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return this.request(`/admin/reports${query ? `?${query}` : ""}`);
  }

  async resolveReport(reportId: string, resolution: string, notes: string) {
    return this.request(`/admin/reports/${reportId}`, {
      method: "PUT",
      body: JSON.stringify({ resolution, notes }),
    });
  }

  async getAdminSettings(category?: string) {
    const query = category ? `?category=${category}` : "";
    return this.request(`/admin/settings${query}`);
  }

  async updateAdminSetting(key: string, value: string | number | boolean) {
    return this.request("/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ key, value }),
    });
  }

  async getAdminCategories() {
    return this.request("/admin/categories");
  }

  async createAdminCategory(data: {
    name: string;
    description?: string;
    slug: string;
    isActive?: boolean;
    sortOrder?: number;
  }) {
    return this.request("/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAdminCategory(categoryId: string, data: any) {
    return this.request(`/admin/categories/${categoryId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async performBulkAction(action: {
    action:
      | "APPROVE"
      | "REJECT"
      | "DELETE"
      | "SUSPEND"
      | "ACTIVATE"
      | "FEATURE";
    entityType: "USER" | "ARTWORK" | "REPORT";
    entityIds: string[];
    reason?: string;
    notes?: string;
  }) {
    return this.request("/admin/bulk-actions", {
      method: "POST",
      body: JSON.stringify(action),
    });
  }

  async getAuditLogs(params?: {
    action?: string;
    entityType?: string;
    adminId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.action) searchParams.set("action", params.action);
    if (params?.entityType) searchParams.set("entityType", params.entityType);
    if (params?.adminId) searchParams.set("adminId", params.adminId);
    if (params?.startDate)
      searchParams.set("startDate", params.startDate.toISOString());
    if (params?.endDate)
      searchParams.set("endDate", params.endDate.toISOString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.offset) searchParams.set("offset", params.offset.toString());

    const query = searchParams.toString();
    return this.request(`/admin/audit-logs${query ? `?${query}` : ""}`);
  }

  async getAnalytics(
    period: "DAY" | "WEEK" | "MONTH" | "YEAR",
    startDate: Date,
    endDate: Date
  ) {
    const searchParams = new URLSearchParams();
    searchParams.set("period", period);
    searchParams.set("startDate", startDate.toISOString());
    searchParams.set("endDate", endDate.toISOString());

    return this.request(`/admin/analytics?${searchParams.toString()}`);
  }

  async updateUser(
    userId: string,
    data: {
      displayName?: string;
      email?: string;
      role?: string;
      status?: string;
      firstName?: string;
      lastName?: string;
    }
  ) {
    return this.request(`/admin/users/${userId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Report functionality
  async reportArtwork(artworkId: string, reason: string, description?: string) {
    return this.request("/report", {
      method: "POST",
      body: JSON.stringify({
        artworkId,
        reason,
        description,
      }),
    });
  }
}

export const apiClient = new ApiClient();

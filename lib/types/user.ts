export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  role: "ENTHUSIAST" | "ARTIST";
  createdAt: Date;
  updatedAt: Date;

  // User-specific fields
  preferences?: UserPreferences;
  stats?: UserStats;
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  privacyLevel: "PUBLIC" | "PRIVATE" | "FRIENDS_ONLY";
  showActivity: boolean;
  allowMessages: boolean;
  preferredCategories: string[];
  language: string;
  theme: "LIGHT" | "DARK" | "SYSTEM";
}

export interface UserStats {
  followingCount: number;
  followersCount: number;
  collectionsCount: number;
  likesGivenCount: number;
  commentsCount: number;
  artworksViewedCount: number;
  joinedDate: Date;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  coverImage?: string;
  userId: string;
  artworks: CollectionArtwork[];
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    artworks: number;
  };
}

export interface CollectionArtwork {
  id: string;
  collectionId: string;
  artworkId: string;
  addedAt: Date;
  artwork: {
    id: string;
    title: string;
    imageUrl: string;
    artist: {
      id: string;
      displayName: string;
      username: string;
    };
  };
}

export interface UserActivity {
  id: string;
  type: "LIKE" | "COMMENT" | "FOLLOW" | "COLLECTION_CREATE" | "COLLECTION_ADD";
  createdAt: Date;

  // Populated fields
  artwork?: {
    id: string;
    title: string;
    primaryImage: string;
    artist: {
      id: string;
      displayName: string;
      username: string;
      avatar?: string;
    };
  };
  artist?: {
    id: string;
    displayName: string;
    username: string;
    avatar?: string;
  };
  collection?: {
    id: string;
    name: string;
    coverImage?: string;
  };
}

export interface Follow {
  id: string;
  followerId: string;
  followingId: string;
  createdAt: Date;
  follower?: UserProfile;
  following?: UserProfile;
}

export interface Like {
  id: string;
  userId: string;
  artworkId: string;
  createdAt: Date;
  user?: UserProfile;
  artwork?: {
    id: string;
    title: string;
    imageUrl: string;
    artist: {
      displayName: string;
      username: string;
    };
  };
}

export interface Comment {
  id: string;
  content: string;
  userId: string;
  artworkId: string;
  parentId?: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    displayName: string;
    username: string;
    avatar?: string;
  };
  replies?: Comment[];
  _count?: {
    replies: number;
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: "LIKE" | "COMMENT" | "FOLLOW" | "ARTWORK_UPLOAD" | "COMMISSION_REQUEST";
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: any;
  createdAt: Date;

  // Populated fields
  fromUser?: {
    id: string;
    displayName: string;
    username: string;
    avatar?: string;
  };
}

export interface SearchFilters {
  query?: string;
  categories?: string[];
  mediums?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  sortBy?: "RELEVANCE" | "RECENT" | "POPULAR" | "PRICE_LOW" | "PRICE_HIGH";
  artistId?: string;
  isForSale?: boolean;
  hasCommissions?: boolean;
}

export interface SearchResult {
  artworks: Array<{
    id: string;
    title: string;
    description?: string;
    imageUrl: string;
    price?: number;
    isForSale: boolean;
    createdAt: Date;
    artist: {
      id: string;
      displayName: string;
      username: string;
      avatar?: string;
    };
    category: {
      id: string;
      name: string;
    };
    _count: {
      likes: number;
      comments: number;
    };
  }>;
  artists: Array<{
    id: string;
    displayName: string;
    username: string;
    bio?: string;
    avatar?: string;
    specialties: string[];
    _count: {
      artworks: number;
      followers: number;
    };
  }>;
  total: number;
  hasMore: boolean;
}

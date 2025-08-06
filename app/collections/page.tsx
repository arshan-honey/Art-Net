"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Heart,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2,
  Share2,
  Grid,
  List,
  Search,
  Filter,
  Lock,
  Globe,
  Users,
  Calendar,
  Download,
  Star,
  Bookmark,
  ImageIcon,
  Palette,
  Camera,
  Brush,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CollectionsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  );

  // Form states for creating/editing collections
  const [collectionName, setCollectionName] = useState("");
  const [collectionDescription, setCollectionDescription] = useState("");
  const [collectionPrivacy, setCollectionPrivacy] = useState("private");
  const [collectionTags, setCollectionTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (user && user.role !== "user" && user.role !== "ARTIST") {
      router.push("/");
    }
  }, [user, router]);

  if (!user || (user.role !== "user" && user.role !== "ARTIST")) {
    return null;
  }

  // Mock collections data
  const collections = [
    {
      id: "1",
      name: "Digital Landscapes",
      description:
        "A curated collection of breathtaking digital landscape artworks that inspire wanderlust and creativity.",
      artworkCount: 24,
      privacy: "public" as const,
      createdAt: "2025-01-15",
      updatedAt: "2025-01-20",
      tags: ["Digital Art", "Landscapes", "Nature"],
      coverImage: "/placeholder.svg?height=300&width=400",
      artworks: [
        {
          id: "1",
          image: "/placeholder.svg?height=200&width=200",
          title: "Sunset Dreams",
        },
        {
          id: "2",
          image: "/placeholder.svg?height=200&width=200",
          title: "Mountain Mist",
        },
        {
          id: "3",
          image: "/placeholder.svg?height=200&width=200",
          title: "Ethereal Valley",
        },
        {
          id: "4",
          image: "/placeholder.svg?height=200&width=200",
          title: "Digital Horizon",
        },
      ],
      likes: 156,
      views: 2340,
      followers: 89,
    },
    {
      id: "2",
      name: "Portrait Studies",
      description:
        "Exceptional portrait artworks showcasing human emotion and artistic technique across various mediums.",
      artworkCount: 18,
      privacy: "public" as const,
      createdAt: "2025-01-10",
      updatedAt: "2025-01-18",
      tags: ["Portraits", "People", "Emotion"],
      coverImage: "/placeholder.svg?height=300&width=400",
      artworks: [
        {
          id: "5",
          image: "/placeholder.svg?height=200&width=200",
          title: "Soul Reflection",
        },
        {
          id: "6",
          image: "/placeholder.svg?height=200&width=200",
          title: "Urban Portrait",
        },
        {
          id: "7",
          image: "/placeholder.svg?height=200&width=200",
          title: "Classic Study",
        },
      ],
      likes: 203,
      views: 1890,
      followers: 67,
    },
    {
      id: "3",
      name: "Abstract Explorations",
      description:
        "Mind-bending abstract artworks that challenge perception and explore the boundaries of visual art.",
      artworkCount: 12,
      privacy: "private" as const,
      createdAt: "2025-01-05",
      updatedAt: "2025-01-15",
      tags: ["Abstract", "Experimental", "Modern"],
      coverImage: "/placeholder.svg?height=300&width=400",
      artworks: [
        {
          id: "8",
          image: "/placeholder.svg?height=200&width=200",
          title: "Color Symphony",
        },
        {
          id: "9",
          image: "/placeholder.svg?height=200&width=200",
          title: "Geometric Dreams",
        },
      ],
      likes: 89,
      views: 1234,
      followers: 34,
    },
    {
      id: "4",
      name: "Photography Masters",
      description:
        "Stunning photography from talented artists capturing moments, emotions, and stories through the lens.",
      artworkCount: 31,
      privacy: "public" as const,
      createdAt: "2023-12-20",
      updatedAt: "2025-01-12",
      tags: ["Photography", "Masters", "Inspiration"],
      coverImage: "/placeholder.svg?height=300&width=400",
      artworks: [
        {
          id: "10",
          image: "/placeholder.svg?height=200&width=200",
          title: "Street Life",
        },
        {
          id: "11",
          image: "/placeholder.svg?height=200&width=200",
          title: "Nature's Beauty",
        },
        {
          id: "12",
          image: "/placeholder.svg?height=200&width=200",
          title: "Urban Shadows",
        },
        {
          id: "13",
          image: "/placeholder.svg?height=200&width=200",
          title: "Golden Hour",
        },
      ],
      likes: 278,
      views: 3456,
      followers: 123,
    },
    {
      id: "5",
      name: "Favorites",
      description:
        "My personal favorite artworks that never fail to inspire and amaze me.",
      artworkCount: 45,
      privacy: "private" as const,
      createdAt: "2023-11-15",
      updatedAt: "2025-01-22",
      tags: ["Favorites", "Inspiration", "Personal"],
      coverImage: "/placeholder.svg?height=300&width=400",
      artworks: [
        {
          id: "14",
          image: "/placeholder.svg?height=200&width=200",
          title: "Masterpiece 1",
        },
        {
          id: "15",
          image: "/placeholder.svg?height=200&width=200",
          title: "Masterpiece 2",
        },
        {
          id: "16",
          image: "/placeholder.svg?height=200&width=200",
          title: "Masterpiece 3",
        },
        {
          id: "17",
          image: "/placeholder.svg?height=200&width=200",
          title: "Masterpiece 4",
        },
        {
          id: "18",
          image: "/placeholder.svg?height=200&width=200",
          title: "Masterpiece 5",
        },
      ],
      likes: 0, // Private collection
      views: 0,
      followers: 0,
    },
  ];

  // Mock public collections from other users
  const publicCollections = [
    {
      id: "pub-1",
      name: "Sci-Fi Concepts",
      description:
        "Futuristic and science fiction concept art from various talented artists.",
      artworkCount: 28,
      creator: {
        name: "Alex Thompson",
        username: "alex_collector",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      privacy: "public" as const,
      createdAt: "2025-01-18",
      tags: ["Sci-Fi", "Concept Art", "Future"],
      coverImage: "/placeholder.svg?height=300&width=400",
      likes: 342,
      views: 4567,
      followers: 156,
    },
    {
      id: "pub-2",
      name: "Watercolor Wonders",
      description:
        "Beautiful watercolor paintings showcasing the delicate art of water-based painting.",
      artworkCount: 19,
      creator: {
        name: "Maria Santos",
        username: "maria_art",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      privacy: "public" as const,
      createdAt: "2025-01-12",
      tags: ["Watercolor", "Traditional", "Painting"],
      coverImage: "/placeholder.svg?height=300&width=400",
      likes: 198,
      views: 2890,
      followers: 78,
    },
  ];

  const stats = [
    { label: "Total Collections", value: collections.length, icon: Bookmark },
    {
      label: "Total Artworks",
      value: collections.reduce((sum, col) => sum + col.artworkCount, 0),
      icon: ImageIcon,
    },
    {
      label: "Public Collections",
      value: collections.filter((col) => col.privacy === "public").length,
      icon: Globe,
    },
    {
      label: "Total Likes",
      value: collections.reduce((sum, col) => sum + col.likes, 0),
      icon: Heart,
    },
  ];

  const filteredCollections = collections.filter((collection) => {
    const matchesSearch =
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      collection.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter =
      filterBy === "all" ||
      (filterBy === "public" && collection.privacy === "public") ||
      (filterBy === "private" && collection.privacy === "private");

    return matchesSearch && matchesFilter;
  });

  const sortedCollections = [...filteredCollections].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return (
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      case "name":
        return a.name.localeCompare(b.name);
      case "artworks":
        return b.artworkCount - a.artworkCount;
      case "likes":
        return b.likes - a.likes;
      default:
        return 0;
    }
  });

  const handleCreateCollection = () => {
    if (!collectionName.trim()) return;

    toast({
      title: "Collection created!",
      description: `"${collectionName}" has been added to your collections.`,
    });

    // Reset form
    setCollectionName("");
    setCollectionDescription("");
    setCollectionPrivacy("private");
    setCollectionTags([]);
    setIsCreateDialogOpen(false);
  };

  const handleDeleteCollection = (
    collectionId: string,
    collectionName: string
  ) => {
    toast({
      title: "Collection deleted",
      description: `"${collectionName}" has been removed from your collections.`,
    });
  };

  const handleShareCollection = (collection: any) => {
    navigator.clipboard.writeText(
      `${window.location.origin}/collection/${collection.id}`
    );
    toast({
      title: "Link copied!",
      description: "Collection link has been copied to your clipboard",
    });
  };

  const addTag = () => {
    if (newTag.trim() && !collectionTags.includes(newTag.trim())) {
      setCollectionTags([...collectionTags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCollectionTags(collectionTags.filter((tag) => tag !== tagToRemove));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPrivacyIcon = (privacy: string) => {
    return privacy === "public" ? (
      <Globe className="h-4 w-4" />
    ) : (
      <Lock className="h-4 w-4" />
    );
  };

  const getCategoryIcon = (tags: string[]) => {
    if (tags.some((tag) => tag.toLowerCase().includes("digital")))
      return <Palette className="h-5 w-5" />;
    if (tags.some((tag) => tag.toLowerCase().includes("photo")))
      return <Camera className="h-5 w-5" />;
    if (tags.some((tag) => tag.toLowerCase().includes("paint")))
      return <Brush className="h-5 w-5" />;
    return <ImageIcon className="h-5 w-5" />;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Collections
              </h1>
              <p className="text-gray-600">
                Organize and curate your favorite artworks
              </p>
            </div>
            <Dialog
              open={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className="mt-4 sm:mt-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Collection
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Collection</DialogTitle>
                  <DialogDescription>
                    Create a new collection to organize your favorite artworks.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Collection Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter collection name"
                      value={collectionName}
                      onChange={(e) => setCollectionName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your collection..."
                      value={collectionDescription}
                      onChange={(e) => setCollectionDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="privacy">Privacy</Label>
                    <Select
                      value={collectionPrivacy}
                      onValueChange={setCollectionPrivacy}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center">
                            <Lock className="h-4 w-4 mr-2" />
                            Private - Only you can see this
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 mr-2" />
                            Public - Anyone can view this
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {collectionTags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="px-3 py-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 hover:text-red-600"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addTag()}
                      />
                      <Button type="button" variant="outline" onClick={addTag}>
                        Add
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateCollection}
                      disabled={!collectionName.trim()}
                    >
                      Create Collection
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.label}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                    </div>
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="my-collections" className="space-y-6">
            <TabsList>
              <TabsTrigger value="my-collections">My Collections</TabsTrigger>
              <TabsTrigger value="public-collections">
                Discover Collections
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-collections" className="space-y-6">
              {/* Filters */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search collections..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger className="w-full lg:w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Collections</SelectItem>
                      <SelectItem value="public">Public Only</SelectItem>
                      <SelectItem value="private">Private Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full lg:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recently Updated</SelectItem>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="artworks">Most Artworks</SelectItem>
                      <SelectItem value="likes">Most Liked</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === "grid" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Collections Grid/List */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sortedCollections.map((collection) => (
                    <Card
                      key={collection.id}
                      className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      <div className="relative">
                        <Link href={`/collection/${collection.id}`}>
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={collection.coverImage || "/placeholder.svg"}
                              alt={collection.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                            <div className="absolute bottom-3 left-3 right-3">
                              <div className="flex items-center justify-between text-white">
                                <span className="text-sm font-medium">
                                  {collection.artworkCount} artworks
                                </span>
                                <div className="flex items-center space-x-1">
                                  {getPrivacyIcon(collection.privacy)}
                                  <span className="text-xs capitalize">
                                    {collection.privacy}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                        <div className="absolute top-3 right-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="secondary"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Collection
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleShareCollection(collection)
                                }
                              >
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Export
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() =>
                                  handleDeleteCollection(
                                    collection.id,
                                    collection.name
                                  )
                                }
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <Link href={`/collection/${collection.id}`}>
                            <h3 className="font-semibold text-lg hover:text-primary transition-colors line-clamp-1">
                              {collection.name}
                            </h3>
                          </Link>
                          {getCategoryIcon(collection.tags)}
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {collection.description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {collection.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {collection.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{collection.tags.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Preview Images */}
                        <div className="grid grid-cols-4 gap-1 mb-4">
                          {collection.artworks
                            .slice(0, 4)
                            .map((artwork, index) => (
                              <div
                                key={artwork.id}
                                className="aspect-square relative overflow-hidden rounded"
                              >
                                <Image
                                  src={artwork.image || "/placeholder.svg"}
                                  alt={artwork.title}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-3">
                            {collection.privacy === "public" && (
                              <>
                                <span className="flex items-center">
                                  <Heart className="h-4 w-4 mr-1" />
                                  {collection.likes}
                                </span>
                                <span className="flex items-center">
                                  <Eye className="h-4 w-4 mr-1" />
                                  {collection.views}
                                </span>
                              </>
                            )}
                          </div>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(collection.updatedAt)}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedCollections.map((collection) => (
                    <Card
                      key={collection.id}
                      className="hover:shadow-md transition-shadow duration-300"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-6">
                          <Link href={`/collection/${collection.id}`}>
                            <div className="relative w-24 h-16 overflow-hidden rounded-lg">
                              <Image
                                src={
                                  collection.coverImage || "/placeholder.svg"
                                }
                                alt={collection.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </Link>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <Link href={`/collection/${collection.id}`}>
                                    <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                      {collection.name}
                                    </h3>
                                  </Link>
                                  {getPrivacyIcon(collection.privacy)}
                                  <Badge variant="outline" className="text-xs">
                                    {collection.artworkCount} artworks
                                  </Badge>
                                </div>
                                <p className="text-gray-600 text-sm mb-2">
                                  {collection.description}
                                </p>
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {collection.tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    Updated {formatDate(collection.updatedAt)}
                                  </span>
                                  {collection.privacy === "public" && (
                                    <>
                                      <span className="flex items-center">
                                        <Heart className="h-4 w-4 mr-1" />
                                        {collection.likes}
                                      </span>
                                      <span className="flex items-center">
                                        <Eye className="h-4 w-4 mr-1" />
                                        {collection.views}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="grid grid-cols-2 gap-1">
                                  {collection.artworks
                                    .slice(0, 4)
                                    .map((artwork) => (
                                      <div
                                        key={artwork.id}
                                        className="w-8 h-8 relative overflow-hidden rounded"
                                      >
                                        <Image
                                          src={
                                            artwork.image || "/placeholder.svg"
                                          }
                                          alt={artwork.title}
                                          fill
                                          className="object-cover"
                                        />
                                      </div>
                                    ))}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleShareCollection(collection)
                                      }
                                    >
                                      <Share2 className="h-4 w-4 mr-2" />
                                      Share
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() =>
                                        handleDeleteCollection(
                                          collection.id,
                                          collection.name
                                        )
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {sortedCollections.length === 0 && (
                <div className="text-center py-12">
                  <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No collections found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery || filterBy !== "all"
                      ? "Try adjusting your search or filters"
                      : "Create your first collection to organize your favorite artworks"}
                  </p>
                  {!searchQuery && filterBy === "all" && (
                    <Button onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Collection
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="public-collections" className="space-y-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Discover Public Collections
                </h2>
                <p className="text-gray-600">
                  Explore curated collections from other art enthusiasts
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicCollections.map((collection) => (
                  <Card
                    key={collection.id}
                    className="group hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative">
                      <Link href={`/collection/${collection.id}`}>
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={collection.coverImage || "/placeholder.svg"}
                            alt={collection.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                          <div className="absolute bottom-3 left-3 right-3">
                            <div className="flex items-center justify-between text-white">
                              <span className="text-sm font-medium">
                                {collection.artworkCount} artworks
                              </span>
                              <div className="flex items-center space-x-1">
                                <Globe className="h-4 w-4" />
                                <span className="text-xs">Public</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                    <CardContent className="p-6">
                      <Link href={`/collection/${collection.id}`}>
                        <h3 className="font-semibold text-lg hover:text-primary transition-colors mb-2">
                          {collection.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {collection.description}
                      </p>

                      {/* Creator */}
                      <div className="flex items-center space-x-2 mb-4">
                        <Avatar className="w-6 h-6">
                          <AvatarImage
                            src={
                              collection.creator.avatar || "/placeholder.svg"
                            }
                            alt={collection.creator.name}
                          />
                          <AvatarFallback className="text-xs">
                            {collection.creator.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <Link href={`/artist/${collection.creator.username}`}>
                          <span className="text-sm text-gray-600 hover:text-primary cursor-pointer">
                            by {collection.creator.name}
                          </span>
                        </Link>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {collection.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="text-xs"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            {collection.likes}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {collection.followers}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          <Star className="h-4 w-4 mr-1" />
                          Follow
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

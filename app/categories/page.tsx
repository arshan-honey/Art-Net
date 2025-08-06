"use client"

import { useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import Image from "next/image"
import {
  Search,
  Palette,
  Camera,
  Brush,
  Scissors,
  Layers,
  Pen,
  Eye,
  TrendingUp,
  Users,
  ImageIcon,
  Grid,
  List,
  Loader2,
} from "lucide-react"
import { useCategories, useTrendingCategories } from "@/hooks/use-categories"

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState("grid")

  // Fetch categories data from backend
  const { categories, loading, error } = useCategories()
  const { categories: trendingCategories, loading: trendingLoading } = useTrendingCategories(6)

  // Icon mapping for categories (fallback icons)
  const iconMap: { [key: string]: any } = {
    "digital-art": Palette,
    "photography": Camera,
    "painting": Brush,
    "sculpture": Scissors,
    "mixed-media": Layers,
    "illustration": Pen,
    "abstract": Palette,
    "portrait": Eye,
    "default": ImageIcon,
  }

  // Color mapping for categories (fallback colors)
  const colorMap: { [key: string]: string } = {
    "digital-art": "from-purple-500 to-pink-500",
    "photography": "from-blue-500 to-cyan-500",
    "painting": "from-red-500 to-orange-500",
    "sculpture": "from-green-500 to-teal-500",
    "mixed-media": "from-indigo-500 to-purple-500",
    "illustration": "from-yellow-500 to-red-500",
    "abstract": "from-pink-500 to-rose-500",
    "portrait": "from-gray-500 to-slate-500",
    "default": "from-gray-400 to-gray-600",
  }

  const getIconForCategory = (categorySlug: string) => {
    return iconMap[categorySlug] || iconMap["default"]
  }

  const getColorForCategory = (categorySlug: string) => {
    return colorMap[categorySlug] || colorMap["default"]
  }

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const popularCategories = [...categories].sort((a, b) => b.artworkCount - a.artworkCount).slice(0, 4)

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Art Categories</h1>
            <p className="text-gray-600">Explore different types of artistic expressions and find your inspiration</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-32 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex justify-between mb-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Art Categories</h1>
            <p className="text-gray-600">Explore different types of artistic expressions and find your inspiration</p>
          </div>
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Categories</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Art Categories</h1>
          <p className="text-gray-600">Explore different types of artistic expressions and find your inspiration</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories, tags, or descriptions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
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

        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Categories</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="popular">Most Popular</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {/* All Categories */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCategories.map((category) => {
                  const IconComponent = getIconForCategory(category.slug)
                  const colorClass = getColorForCategory(category.slug)
                  
                  return (
                    <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className={`h-32 bg-gradient-to-br ${colorClass} relative`}>
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute top-4 left-4">
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-bold text-xl">{category.name}</h3>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <p className="text-gray-600 text-sm mb-4">{category.description || "No description available"}</p>
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span className="flex items-center">
                            <ImageIcon className="h-4 w-4 mr-1" />
                            {category.artworkCount.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {category.artistCount}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {category.featuredArtworks.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <Button asChild className="w-full">
                          <Link href={`/browse?category=${category.slug}`}>Explore {category.name}</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCategories.map((category) => {
                  const IconComponent = getIconForCategory(category.slug)
                  const colorClass = getColorForCategory(category.slug)
                  
                  return (
                    <Card key={category.id} className="hover:shadow-md transition-shadow duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-6">
                          <div
                            className={`w-16 h-16 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center`}
                          >
                            <IconComponent className="h-8 w-8 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="font-bold text-xl">{category.name}</h3>
                                </div>
                                <p className="text-gray-600 mb-3">{category.description || "No description available"}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <span className="flex items-center">
                                    <ImageIcon className="h-4 w-4 mr-1" />
                                    {category.artworkCount.toLocaleString()} artworks
                                  </span>
                                  <span className="flex items-center">
                                    <Users className="h-4 w-4 mr-1" />
                                    {category.artistCount} artists
                                  </span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="grid grid-cols-3 gap-1 mb-4">
                                  {category.featuredArtworks.slice(0, 3).map((artwork, index) => (
                                    <Image
                                      key={index}
                                      src={artwork.primaryImage || "/placeholder.svg"}
                                      alt={`Featured ${category.name}`}
                                      width={40}
                                      height={40}
                                      className="w-10 h-10 object-cover rounded"
                                    />
                                  ))}
                                  {category.featuredArtworks.length < 3 && (
                                    [...Array(3 - category.featuredArtworks.length)].map((_, index) => (
                                      <div key={`placeholder-${index}`} className="w-10 h-10 bg-gray-200 rounded"></div>
                                    ))
                                  )}
                                </div>
                                <Button asChild>
                                  <Link href={`/browse?category=${category.slug}`}>Explore</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending" className="space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Trending Categories</h2>
              <p className="text-gray-600">Categories experiencing rapid growth and popularity</p>
            </div>
            {trendingLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-40 w-full" />
                    <CardContent className="p-6">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <Skeleton className="h-10 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingCategories.map((category) => {
                  const IconComponent = getIconForCategory(category.slug)
                  const colorClass = getColorForCategory(category.slug)
                  
                  return (
                    <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                      <div className={`h-40 bg-gradient-to-br ${colorClass} relative`}>
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute top-4 left-4">
                          <IconComponent className="h-10 w-10 text-white" />
                        </div>
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary" className="bg-white/90">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Trending
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 left-4 text-white">
                          <h3 className="font-bold text-2xl">{category.name}</h3>
                          <p className="text-white/80 text-sm">{category.artworkCount.toLocaleString()} artworks</p>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <p className="text-gray-600 text-sm mb-4">{category.description || "No description available"}</p>
                        <Button asChild className="w-full">
                          <Link href={`/browse?category=${category.slug}`}>Explore Trending</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="popular" className="space-y-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Most Popular Categories</h2>
              <p className="text-gray-600">Categories with the highest number of artworks and artists</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularCategories.map((category, index) => {
                const IconComponent = getIconForCategory(category.slug)
                const colorClass = getColorForCategory(category.slug)
                
                return (
                  <Card key={category.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div className="flex">
                      <div className={`w-24 bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                        <div className="text-center text-white">
                          <div className="text-2xl font-bold">#{index + 1}</div>
                          <IconComponent className="h-8 w-8 mx-auto mt-2" />
                        </div>
                      </div>
                      <CardContent className="flex-1 p-6">
                        <h3 className="font-bold text-xl mb-2">{category.name}</h3>
                        <p className="text-gray-600 text-sm mb-4">{category.description || "No description available"}</p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">
                              {category.artworkCount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Artworks</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{category.artistCount}</div>
                            <div className="text-xs text-gray-500">Artists</div>
                          </div>
                        </div>
                        <Button asChild className="w-full">
                          <Link href={`/browse?category=${category.slug}`}>Explore Popular</Link>
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        </Tabs>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No categories found matching your search.</p>
            <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

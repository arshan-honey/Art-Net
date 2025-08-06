"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearch, useSocialActions } from "@/hooks/use-user"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, MessageCircle, Search, Filter, Grid, List } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function BrowsePage() {
  const { results, isLoading, search } = useSearch()
  const { likeArtwork, unlikeArtwork } = useSocialActions()

  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("RECENT")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [likedArtworks, setLikedArtworks] = useState<Set<string>>(new Set())

  useEffect(() => {
    // Initial search with no filters
    search({
      sortBy: "RECENT",
    })
  }, [])

  const handleSearch = async () => {
    await search({
      query: searchQuery,
      sortBy,
    })
  }

  const handleLike = async (artworkId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikeArtwork(artworkId)
        setLikedArtworks((prev) => {
          const newSet = new Set(prev)
          newSet.delete(artworkId)
          return newSet
        })
      } else {
        await likeArtwork(artworkId)
        setLikedArtworks((prev) => new Set(prev).add(artworkId))
      }
    } catch (error) {
      // Error handled by hook
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Artworks</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search artworks, artists, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              Search
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECENT">Most Recent</SelectItem>
                  <SelectItem value="POPULAR">Most Popular</SelectItem>
                  <SelectItem value="PRICE_LOW">Price: Low to High</SelectItem>
                  <SelectItem value="PRICE_HIGH">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <div className="flex items-center gap-2">
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

        {/* Results */}
        {isLoading ? (
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
          >
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-64 w-full" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-1/4" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results?.artworks?.length > 0 ? (
          <div
            className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}
          >
            {results.artworks.map((artwork: any) => {
              const isLiked = likedArtworks.has(artwork.id)

              return (
                <Card key={artwork.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <Link href={`/artwork/${artwork.id}`}>
                    <div className="relative">
                      <Image
                        src={artwork.imageUrl || "/placeholder.svg"}
                        alt={artwork.title}
                        width={400}
                        height={300}
                        className="w-full h-64 object-cover"
                      />
                      {artwork.price && (
                        <Badge className="absolute top-2 right-2 bg-white text-black">${artwork.price}</Badge>
                      )}
                    </div>
                  </Link>

                  <CardContent className="p-4">
                    <Link href={`/artwork/${artwork.id}`}>
                      <h3 className="font-semibold text-lg mb-1 hover:text-blue-600 transition-colors">
                        {artwork.title}
                      </h3>
                    </Link>

                    <Link href={`/artist/${artwork.artist.username}`}>
                      <p className="text-gray-600 text-sm mb-3 hover:text-blue-600 transition-colors">
                        by {artwork.artist.displayName}
                      </p>
                    </Link>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {artwork._count.likes}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {artwork._count.comments}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(artwork.id, isLiked)}
                        className={isLiked ? "text-red-500" : ""}
                      >
                        <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No artworks found. Try adjusting your search criteria.</p>
          </div>
        )}

        {/* Load More */}
        {results?.hasMore && (
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Load More Artworks
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

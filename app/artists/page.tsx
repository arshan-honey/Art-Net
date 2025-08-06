"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { Search, Users, ImageIcon, Heart, MapPin, Calendar, Grid, List, AlertCircle } from "lucide-react"
import { useArtists } from "@/hooks/use-artists"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ArtistsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'artworks' | 'likes'>("popular")
  const [viewMode, setViewMode] = useState("grid")

  // Fetch artists data
  const { artists, loading, error, total, refetch } = useArtists({
    searchQuery: searchQuery || undefined,
    specialty: selectedSpecialty,
    sortBy,
    page: 1,
    limit: 50
  })

  // Get featured artists (for now, just pick the first 3 with most followers)
  const featuredArtists = useMemo(() => {
    return [...artists]
      .sort((a, b) => b.followers - a.followers)
      .slice(0, 3)
  }, [artists])

  const specialties = ["all", "Digital Art", "Photography", "Painting", "Sculpture", "Mixed Media", "Illustration"]

  const handleClearFilters = () => {
    setSearchQuery("")
    setSelectedSpecialty("all")
    setSortBy("popular")
    refetch()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Artists</h1>
          <p className="text-gray-600">Connect with talented artists from around the world</p>
        </div>

        {/* Featured Artists */}
        {!loading && featuredArtists.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Artists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtists.map((artist) => (
                <Card key={artist.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <div
                      className="h-32 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500"
                      style={{
                        backgroundImage: artist.coverImage ? `url(${artist.coverImage})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div className="absolute -bottom-8 left-6">
                      <Avatar className="w-16 h-16 border-4 border-white">
                        <AvatarImage src={artist.avatar || "/placeholder.svg"} alt={artist.name} />
                        <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>
                    {artist.verified && (
                      <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-white/90">
                          ✓ Verified
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="pt-12 pb-6">
                    <Link href={`/artist/${artist.username}`}>
                      <h3 className="font-bold text-lg hover:text-primary transition-colors">{artist.name}</h3>
                    </Link>
                    <p className="text-gray-600 text-sm mb-2">@{artist.username}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {artist.specialties.slice(0, 2).map((specialty) => (
                        <Badge key={specialty} variant="outline">
                          {specialty}
                        </Badge>
                      ))}
                      {artist.specialties.length > 2 && (
                        <Badge variant="outline">+{artist.specialties.length - 2} more</Badge>
                      )}
                    </div>
                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">{artist.bio}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {artist.followers.toLocaleString()}
                      </span>
                      <span className="flex items-center">
                        <ImageIcon className="h-4 w-4 mr-1" />
                        {artist.artworks}
                      </span>
                      <span className="flex items-center">
                        <Heart className="h-4 w-4 mr-1" />
                        {artist.totalLikes.toLocaleString()}
                      </span>
                    </div>
                    <Button asChild className="w-full">
                      <Link href={`/artist/${artist.username}`}>View Portfolio</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Loading State for Featured Artists */}
        {loading && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Artists</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <Card key={index} className="overflow-hidden">
                  <div className="relative">
                    <Skeleton className="h-32 w-full" />
                    <div className="absolute -bottom-8 left-6">
                      <Skeleton className="w-16 h-16 rounded-full" />
                    </div>
                  </div>
                  <CardContent className="pt-12 pb-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-3" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search artists by name, username, or bio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Specialty" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty}>
                    {specialty === "all" ? "All Specialties" : specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value) => setSortBy(value as typeof sortBy)}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="recent">Recently Joined</SelectItem>
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

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}. <Button variant="link" onClick={refetch} className="p-0 h-auto">Try again</Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {!loading && !error && (
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {artists.length} of {total} artists
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="text-center">
                    <Skeleton className="w-20 h-20 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Artists Grid/List */}
        {!loading && !error && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {artists.map((artist) => (
                  <Card key={artist.id} className="group hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <Avatar className="w-20 h-20 mx-auto mb-4">
                          <AvatarImage src={artist.avatar || "/placeholder.svg"} alt={artist.name} />
                          <AvatarFallback className="text-lg">{artist.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Link href={`/artist/${artist.username}`}>
                          <h3 className="font-semibold text-lg hover:text-primary transition-colors mb-1">{artist.name}</h3>
                        </Link>
                        <p className="text-gray-600 text-sm mb-2">@{artist.username}</p>
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <div className="flex flex-wrap gap-1 justify-center">
                            {artist.specialties.slice(0, 2).map((specialty) => (
                              <Badge key={specialty} variant="outline" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                          {artist.verified && <Badge variant="secondary">✓</Badge>}
                        </div>
                        <p className="text-gray-700 text-sm mb-4 line-clamp-2">{artist.bio}</p>
                        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {artist.followers.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <ImageIcon className="h-4 w-4 mr-1" />
                            {artist.artworks}
                          </span>
                        </div>
                        <Button asChild size="sm" className="w-full">
                          <Link href={`/artist/${artist.username}`}>View Portfolio</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {artists.map((artist) => (
                  <Card key={artist.id} className="hover:shadow-md transition-shadow duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-6">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={artist.avatar || "/placeholder.svg"} alt={artist.name} />
                          <AvatarFallback className="text-lg">{artist.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <Link href={`/artist/${artist.username}`}>
                                <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                                  {artist.name}
                                </h3>
                              </Link>
                              <p className="text-gray-600 text-sm mb-1">@{artist.username}</p>
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="flex flex-wrap gap-1">
                                  {artist.specialties.slice(0, 3).map((specialty) => (
                                    <Badge key={specialty} variant="outline" className="text-xs">
                                      {specialty}
                                    </Badge>
                                  ))}
                                </div>
                                {artist.verified && <Badge variant="secondary">✓ Verified</Badge>}
                              </div>
                              <p className="text-gray-700 text-sm mb-2">{artist.bio}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                {artist.location && (
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {artist.location}
                                  </span>
                                )}
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Joined {new Date(artist.joinDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                                <span className="flex items-center">
                                  <Users className="h-4 w-4 mr-1" />
                                  {artist.followers.toLocaleString()}
                                </span>
                                <span className="flex items-center">
                                  <ImageIcon className="h-4 w-4 mr-1" />
                                  {artist.artworks}
                                </span>
                                <span className="flex items-center">
                                  <Heart className="h-4 w-4 mr-1" />
                                  {artist.totalLikes.toLocaleString()}
                                </span>
                              </div>
                              <Button asChild size="sm">
                                <Link href={`/artist/${artist.username}`}>View Portfolio</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!loading && !error && artists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No artists found matching your criteria.</p>
            <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

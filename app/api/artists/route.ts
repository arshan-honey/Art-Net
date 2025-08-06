import { NextRequest, NextResponse } from "next/server"
import { ArtistService } from "@/lib/services/artist.service"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const searchQuery = searchParams.get('search') || undefined
    const specialty = searchParams.get('specialty') || undefined
    const sortBy = searchParams.get('sortBy') as 'popular' | 'recent' | 'artworks' | 'likes' || 'popular'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')

    const result = await ArtistService.getAllArtists({
      searchQuery,
      specialty,
      sortBy,
      page,
      limit
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in GET /api/artists:", error)
    return NextResponse.json(
      { error: "Failed to fetch artists" },
      { status: 500 }
    )
  }
}

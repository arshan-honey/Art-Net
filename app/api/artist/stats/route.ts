import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { ArtistService } from "@/lib/services/artist.service"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "ARTIST") {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    const stats = await ArtistService.getArtistStats(user.id)

    if (!stats) {
      return NextResponse.json({ success: false, error: "Failed to fetch stats" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Get artist stats error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

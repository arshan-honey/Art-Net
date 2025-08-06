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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") as
      | "PENDING"
      | "ACCEPTED"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "CANCELLED"
      | null

    const commissions = await ArtistService.getArtistCommissions(user.id, status || undefined)

    return NextResponse.json({
      success: true,
      data: commissions,
    })
  } catch (error) {
    console.error("Get commissions error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { AdminService } from "@/lib/services/admin.service"
import { AuthService } from "@/lib/auth"
import { z } from "zod"

const getArtworksSchema = z.object({
  status: z.string().optional(),
  category: z.string().optional(),
  artist: z.string().optional(),
  search: z.string().optional(),
  flagged: z
    .string()
    .transform((val) => val === "true")
    .optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  limit: z.string().transform(Number).optional(),
  offset: z.string().transform(Number).optional(),
})

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const params = getArtworksSchema.parse(Object.fromEntries(searchParams))

    const { artworks, total } = await AdminService.getArtworks(
      {
        status: params.status,
        category: params.category,
        artist: params.artist,
        search: params.search,
        flagged: params.flagged,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      },
      params.limit || 20,
      params.offset || 0,
    )

    return NextResponse.json({
      success: true,
      data: artworks,
      total,
      limit: params.limit || 20,
      offset: params.offset || 0,
    })
  } catch (error) {
    console.error("Get artworks error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

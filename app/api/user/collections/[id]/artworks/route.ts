import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { UserService } from "@/lib/services/user.service"
import { z } from "zod"

const addArtworkSchema = z.object({
  artworkId: z.string(),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { artworkId } = addArtworkSchema.parse(body)

    await UserService.addToCollection(params.id, artworkId, user.id)

    return NextResponse.json({
      success: true,
      message: "Artwork added to collection",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 })
    }

    console.error("Add to collection error:", error)
    return NextResponse.json({ error: "Failed to add artwork to collection" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const artworkId = searchParams.get("artworkId")

    if (!artworkId) {
      return NextResponse.json({ error: "Artwork ID required" }, { status: 400 })
    }

    await UserService.removeFromCollection(params.id, artworkId, user.id)

    return NextResponse.json({
      success: true,
      message: "Artwork removed from collection",
    })
  } catch (error) {
    console.error("Remove from collection error:", error)
    return NextResponse.json({ error: "Failed to remove artwork from collection" }, { status: 500 })
  }
}

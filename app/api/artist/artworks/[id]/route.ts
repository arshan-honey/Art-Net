import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { ArtistService } from "@/lib/services/artist.service"
import { z } from "zod"
import CloudinaryService from "@/lib/cloudinary"

const updateArtworkSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  price: z.number().min(0).optional(),
  isForSale: z.boolean().optional(),
  licenseType: z.enum(["PERSONAL", "COMMERCIAL", "EXCLUSIVE"]).optional(),
  dimensions: z.string().optional(),
  medium: z.string().optional(),
  yearCreated: z.number().min(1900).max(new Date().getFullYear()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).optional(),
})

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "ARTIST") {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    const artwork = await ArtistService.getArtworkById(params.id)

    if (!artwork) {
      return NextResponse.json({ success: false, error: "Artwork not found" }, { status: 404 })
    }

    if (artwork.artistId !== user.id) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      data: artwork,
    })
  } catch (error) {
    console.error("Get artwork error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "ARTIST") {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updateArtworkSchema.parse(body)

    const artwork = await ArtistService.updateArtwork(params.id, user.id, validatedData)

    if (!artwork) {
      return NextResponse.json({ success: false, error: "Artwork not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: artwork,
      message: "Artwork updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      )
    }

    console.error("Update artwork error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    if (user.role !== "ARTIST") {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    // Get artwork details first to clean up images
    const artwork = await ArtistService.getArtworkById(params.id)

    if (!artwork) {
      return NextResponse.json({ success: false, error: "Artwork not found" }, { status: 404 })
    }

    if (artwork.artistId !== user.id) {
      return NextResponse.json({ success: false, error: "Access denied" }, { status: 403 })
    }

    // Delete artwork from database
    const success = await ArtistService.deleteArtwork(params.id, user.id)

    if (!success) {
      return NextResponse.json({ success: false, error: "Failed to delete artwork" }, { status: 500 })
    }

    // Clean up images from Cloudinary
    if (artwork.images && artwork.images.length > 0) {
      const publicIds = artwork.images
        .map((img) => {
          // Extract public_id from Cloudinary URL
          const urlParts = img.url.split("/")
          const publicIdWithExtension = urlParts[urlParts.length - 1]
          return publicIdWithExtension.split(".")[0]
        })
        .filter(Boolean)

      if (publicIds.length > 0) {
        try {
          await CloudinaryService.deleteMultipleImages(publicIds)
        } catch (cleanupError) {
          console.error("Failed to cleanup images from Cloudinary:", cleanupError)
          // Don't fail the request if cleanup fails
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Artwork deleted successfully",
    })
  } catch (error) {
    console.error("Delete artwork error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

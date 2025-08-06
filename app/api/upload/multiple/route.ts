import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import CloudinaryService from "@/lib/cloudinary"
import { z } from "zod"

const multipleUploadSchema = z.object({
  images: z.array(z.string()), // array of base64 encoded images
  folder: z.string().optional(),
  tags: z.array(z.string()).optional(),
  context: z.record(z.string()).optional(),
  public_id_prefix: z.string().optional(),
})

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log("Upload request received"); // Debug log
    
    const user = await verifyToken(request)
    console.log("User verified:", user?.id); // Debug log

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("Request body parsed, images count:", body.images?.length); // Debug log
    
    const validatedData = multipleUploadSchema.parse(body)

    if (validatedData.images.length === 0) {
      return NextResponse.json({ success: false, error: "No images provided" }, { status: 400 })
    }

    if (validatedData.images.length > 10) {
      return NextResponse.json({ success: false, error: "Maximum 10 images allowed per upload" }, { status: 400 })
    }

    console.log("Starting Cloudinary upload..."); // Debug log

    // Upload multiple images to Cloudinary
    const results = await CloudinaryService.uploadMultipleImages(validatedData.images, {
      folder: validatedData.folder || `users/${user.id}/artworks`,
      tags: validatedData.tags || [],
      context: {
        user_id: user.id,
        uploaded_by: user.id, // Use user.id since we don't have username in verifyToken
        ...validatedData.context,
      },
      public_id: validatedData.public_id_prefix,
    })

    console.log("Cloudinary upload completed, results count:", results.length); // Debug log

    const uploadedImages = results.map((result, index) => ({
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
      order: index,
    }))

    return NextResponse.json({
      success: true,
      data: uploadedImages,
      message: `${uploadedImages.length} images uploaded successfully`,
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

    console.error("Multiple image upload error:", error)
    return NextResponse.json({ success: false, error: "Failed to upload images" }, { status: 500 })
  }
}

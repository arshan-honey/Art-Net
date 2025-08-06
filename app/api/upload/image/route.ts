import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import CloudinaryService from "@/lib/cloudinary"
import { z } from "zod"

const uploadSchema = z.object({
  image: z.string(), // base64 encoded image
  folder: z.string().optional(),
  tags: z.array(z.string()).optional(),
  context: z.record(z.string()).optional(),
  public_id: z.string().optional(),
  transformations: z.array(z.any()).optional(),
})

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = uploadSchema.parse(body)

    // Upload to Cloudinary
    const result = await CloudinaryService.uploadImage(validatedData.image, {
      folder: validatedData.folder || `users/${user.id}`,
      tags: validatedData.tags || [],
      context: {
        user_id: user.id,
        uploaded_by: user.username,
        ...validatedData.context,
      },
      public_id: validatedData.public_id,
      transformation: validatedData.transformations,
    })

    return NextResponse.json({
      success: true,
      data: {
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
      message: "Image uploaded successfully",
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

    console.error("Image upload error:", error)
    return NextResponse.json({ success: false, error: "Failed to upload image" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import CloudinaryService from "@/lib/cloudinary"
import { z } from "zod"

const signedUrlSchema = z.object({
  folder: z.string().optional(),
  tags: z.array(z.string()).optional(),
  context: z.record(z.string()).optional(),
  public_id: z.string().optional(),
  transformation: z.array(z.any()).optional(),
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
    const validatedData = signedUrlSchema.parse(body)

    // Generate signed upload URL
    const signedData = CloudinaryService.generateSignedUploadUrl({
      folder: validatedData.folder || `users/${user.id}`,
      tags: [...(validatedData.tags || []), `user_${user.id}`],
      context: {
        user_id: user.id,
        uploaded_by: user.username,
        ...validatedData.context,
      },
      public_id: validatedData.public_id,
      transformation: validatedData.transformation,
    })

    return NextResponse.json({
      success: true,
      data: signedData,
      message: "Signed upload URL generated successfully",
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

    console.error("Signed URL generation error:", error)
    return NextResponse.json({ success: false, error: "Failed to generate signed upload URL" }, { status: 500 })
  }
}

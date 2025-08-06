import { type NextRequest, NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"
import { ArtistService } from "@/lib/services/artist.service"
import { z } from "zod"

const updateCommissionSchema = z.object({
  status: z.enum(["ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
})

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
    const { status } = updateCommissionSchema.parse(body)

    const commission = await ArtistService.updateCommissionStatus(params.id, user.id, status)

    if (!commission) {
      return NextResponse.json({ success: false, error: "Commission not found or access denied" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: commission,
      message: "Commission status updated successfully",
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

    console.error("Update commission error:", error)
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { AdminService } from "@/lib/services/admin.service"
import { AuthService } from "@/lib/auth"
import { z } from "zod"

const updateArtworkSchema = z.object({
  status: z.string(),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { status, reason, notes } = updateArtworkSchema.parse(body)

    const updatedArtwork = await AdminService.updateArtworkStatus(params.id, status, user.id, reason, notes)

    return NextResponse.json({
      success: true,
      data: updatedArtwork,
    })
  } catch (error) {
    console.error("Update artwork error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const reason = searchParams.get("reason") || undefined

    await AdminService.deleteArtwork(params.id, user.id, reason)

    return NextResponse.json({
      success: true,
      message: "Artwork deleted successfully",
    })
  } catch (error) {
    console.error("Delete artwork error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

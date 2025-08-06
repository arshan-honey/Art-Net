import { NextResponse } from "next/server"
import { AdminService } from "@/lib/services/admin.service"
import { AuthService } from "@/lib/auth"
import { z } from "zod"

const resolveReportSchema = z.object({
  resolution: z.string(),
  notes: z.string(),
})

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { resolution, notes } = resolveReportSchema.parse(body)

    const resolvedReport = await AdminService.resolveReport(params.id, resolution, notes, user.id)

    return NextResponse.json({
      success: true,
      data: resolvedReport,
    })
  } catch (error) {
    console.error("Resolve report error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

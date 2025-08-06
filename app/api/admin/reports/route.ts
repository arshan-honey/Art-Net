import { NextResponse } from "next/server"
import { AdminService } from "@/lib/services/admin.service"
import { AuthService } from "@/lib/auth"
import { z } from "zod"

const getReportsSchema = z.object({
  status: z.string().optional(),
  type: z.string().optional(),
  priority: z.string().optional(),
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
    const params = getReportsSchema.parse(Object.fromEntries(searchParams))

    const { reports, total } = await AdminService.getReports(
      {
        status: params.status,
        type: params.type,
        priority: params.priority,
        sortBy: params.sortBy,
        sortOrder: params.sortOrder,
      },
      params.limit || 20,
      params.offset || 0,
    )

    return NextResponse.json({
      success: true,
      data: reports,
      total,
      limit: params.limit || 20,
      offset: params.offset || 0,
    })
  } catch (error) {
    console.error("Get reports error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

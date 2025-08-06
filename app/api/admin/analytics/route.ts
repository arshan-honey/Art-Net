import { NextResponse } from "next/server"
import { AdminService } from "@/lib/services/admin.service"
import { AuthService } from "@/lib/auth"
import { z } from "zod"

const getAnalyticsSchema = z.object({
  period: z.enum(["DAY", "WEEK", "MONTH", "YEAR"]),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
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
    const params = getAnalyticsSchema.parse(Object.fromEntries(searchParams))

    const analytics = await AdminService.getAnalytics(params.period, params.startDate, params.endDate)

    return NextResponse.json({
      success: true,
      data: analytics,
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

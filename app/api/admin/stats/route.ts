import { NextResponse } from "next/server"
import { AdminService } from "@/lib/services/admin.service"
import { AuthService } from "@/lib/auth"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const stats = await AdminService.getDashboardStats()

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Get admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

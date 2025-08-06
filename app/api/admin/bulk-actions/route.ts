import { NextResponse } from "next/server"
import { AdminService } from "@/lib/services/admin.service"
import { AuthService } from "@/lib/auth"
import { z } from "zod"

const bulkActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "DELETE", "SUSPEND", "ACTIVATE", "FEATURE"]),
  entityType: z.enum(["USER", "ARTWORK", "REPORT"]),
  entityIds: z.array(z.string()),
  reason: z.string().optional(),
  notes: z.string().optional(),
})

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const bulkAction = bulkActionSchema.parse(body)

    const results = await AdminService.performBulkAction(bulkAction, user.id)

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error("Bulk action error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { AdminService } from "@/lib/services/admin.service"
import { AuthService } from "@/lib/auth"
import { z } from "zod"

const getAuditLogsSchema = z.object({
  action: z.string().optional(),
  entityType: z.string().optional(),
  adminId: z.string().optional(),
  startDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  endDate: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
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
    const params = getAuditLogsSchema.parse(Object.fromEntries(searchParams))

    const { logs, total } = await AdminService.getAuditLogs(
      {
        action: params.action,
        entityType: params.entityType,
        adminId: params.adminId,
        startDate: params.startDate,
        endDate: params.endDate,
      },
      params.limit || 50,
      params.offset || 0,
    )

    return NextResponse.json({
      success: true,
      data: logs,
      total,
      limit: params.limit || 50,
      offset: params.offset || 0,
    })
  } catch (error) {
    console.error("Get audit logs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

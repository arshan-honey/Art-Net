import { NextResponse } from "next/server"
import { AdminService } from "@/lib/services/admin.service"
import { AuthService } from "@/lib/auth"
import { z } from "zod"

const updateUserSchema = z.object({
  status: z.string(),
  reason: z.string().optional(),
})

const patchUserSchema = z.object({
  displayName: z.string().optional(),
  email: z.string().email().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const { status, reason } = updateUserSchema.parse(body)

    const updatedUser = await AdminService.updateUserStatus(params.id, status, reason, user.id)

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    console.error("Update user error:", error)
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

    await AdminService.deleteUser(params.id, user.id, reason)

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const body = await request.json()
    const userData = patchUserSchema.parse(body)

    const updatedUser = await AdminService.updateUser(params.id, userData, user.id)

    return NextResponse.json({
      success: true,
      data: updatedUser,
    })
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

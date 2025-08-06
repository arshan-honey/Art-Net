import { NextResponse } from "next/server"
import { AuthService } from "@/lib/auth"

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await AuthService.getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Get current user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

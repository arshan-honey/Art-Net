import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    const activities = await UserService.getUserActivity(
      user.id,
      limit,
      offset
    );

    return NextResponse.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Get activity error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 }
    );
  }
}

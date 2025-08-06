import { NextRequest, NextResponse } from "next/server";
import { HomeService } from "@/lib/services/home.service";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const homeData = await HomeService.getHomeData();
    return NextResponse.json(homeData);
  } catch (error) {
    console.error("Error in GET /api/home:", error);
    return NextResponse.json(
      { error: "Failed to fetch home data" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { AdminService } from "@/lib/services/admin.service";
import { AuthService } from "@/lib/auth";
import { z } from "zod";

const updateSettingSchema = z.object({
  key: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()]),
});

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await AuthService.getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || undefined;

    const settings = await AdminService.getSettings(category);

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await AuthService.getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const { key, value } = updateSettingSchema.parse(body);

    const setting = await AdminService.updateSetting(key, value, user.id);

    return NextResponse.json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("Update setting error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

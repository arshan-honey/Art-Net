import { NextResponse } from "next/server";
import { AdminService } from "@/lib/services/admin.service";
import { AuthService } from "@/lib/auth";
import { z } from "zod";

const createCategorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().min(1),
  isActive: z.boolean().optional(),
  sortOrder: z.number().optional(),
});

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await AuthService.getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const categories = await AdminService.getCategories();

    return NextResponse.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await AuthService.getCurrentUser();

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const data = createCategorySchema.parse(body);

    const category = await AdminService.createCategory(data, user.id);

    return NextResponse.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

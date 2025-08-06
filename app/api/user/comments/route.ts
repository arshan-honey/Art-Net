import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";
import { z } from "zod";

const addCommentSchema = z.object({
  artworkId: z.string(),
  content: z.string().min(1).max(1000),
  parentId: z.string().optional(),
});

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { artworkId, content, parentId } = addCommentSchema.parse(body);

    const comment = await UserService.addComment(
      user.id,
      artworkId,
      content,
      parentId
    );

    return NextResponse.json({
      success: true,
      data: comment,
      message: "Comment added successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Add comment error:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const artworkId = searchParams.get("artworkId");
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const offset = Number.parseInt(searchParams.get("offset") || "0");

    if (!artworkId) {
      return NextResponse.json(
        { error: "Artwork ID required" },
        { status: 400 }
      );
    }

    const comments = await UserService.getComments(artworkId, limit, offset);

    return NextResponse.json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

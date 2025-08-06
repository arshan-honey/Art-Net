import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";
import { z } from "zod";

const likeSchema = z.object({
  artworkId: z.string(),
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
    const { artworkId } = likeSchema.parse(body);

    await UserService.likeArtwork(user.id, artworkId);

    return NextResponse.json({
      success: true,
      message: "Artwork liked successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    if (
      error instanceof Error &&
      error.message === "Already liked this artwork"
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("Like artwork error:", error);
    return NextResponse.json(
      { error: "Failed to like artwork" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const artworkId = searchParams.get("artworkId");

    if (!artworkId) {
      return NextResponse.json(
        { error: "Artwork ID required" },
        { status: 400 }
      );
    }

    await UserService.unlikeArtwork(user.id, artworkId);

    return NextResponse.json({
      success: true,
      message: "Artwork unliked successfully",
    });
  } catch (error) {
    console.error("Unlike artwork error:", error);
    return NextResponse.json(
      { error: "Failed to unlike artwork" },
      { status: 500 }
    );
  }
}

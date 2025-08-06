import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { UserService } from "@/lib/services/user.service";
import { z } from "zod";

const followSchema = z.object({
  artistId: z.string(),
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
    const { artistId } = followSchema.parse(body);

    if (artistId === user.id) {
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    await UserService.followArtist(user.id, artistId);

    return NextResponse.json({
      success: true,
      message: "Artist followed successfully",
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
      error.message === "Already following this artist"
    ) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    console.error("Follow artist error:", error);
    return NextResponse.json(
      { error: "Failed to follow artist" },
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
    const artistId = searchParams.get("artistId");

    if (!artistId) {
      return NextResponse.json(
        { error: "Artist ID required" },
        { status: 400 }
      );
    }

    await UserService.unfollowArtist(user.id, artistId);

    return NextResponse.json({
      success: true,
      message: "Artist unfollowed successfully",
    });
  } catch (error) {
    console.error("Unfollow artist error:", error);
    return NextResponse.json(
      { error: "Failed to unfollow artist" },
      { status: 500 }
    );
  }
}

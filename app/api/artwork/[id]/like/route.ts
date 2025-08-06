import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { LikeService } from "@/lib/services/like.service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Artwork ID is required" },
        { status: 400 }
      );
    }

    const result = await LikeService.toggleArtworkLike({
      userId: user.id,
      artworkId: id,
    });

    return NextResponse.json({
      success: true,
      liked: result.isLiked,
      likeCount: result.totalLikes,
    });
  } catch (error) {
    console.error("Error toggling like:", error);

    if (error instanceof Error) {
      if (error.message === "Artwork not found") {
        return NextResponse.json(
          { error: "Artwork not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Artwork ID is required" },
        { status: 400 }
      );
    }

    const result = await LikeService.toggleArtworkLike({
      userId: user.id,
      artworkId: id,
    });

    return NextResponse.json({
      success: true,
      liked: result.isLiked,
      likeCount: result.totalLikes,
    });
  } catch (error) {
    console.error("Error toggling like:", error);

    if (error instanceof Error) {
      if (error.message === "Artwork not found") {
        return NextResponse.json(
          { error: "Artwork not found" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

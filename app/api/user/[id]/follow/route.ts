import { NextResponse, NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { FollowService } from "@/lib/services/follow.service";

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
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await FollowService.toggleFollow({
      followerId: user.id,
      followingId: id,
    });

    return NextResponse.json({
      success: true,
      isFollowing: result.isFollowing,
      totalFollowers: result.totalFollowers,
    });
  } catch (error) {
    console.error("Error toggling follow:", error);

    if (error instanceof Error) {
      if (error.message === "User to follow not found") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (error.message === "Cannot follow yourself") {
        return NextResponse.json(
          { error: "Cannot follow yourself" },
          { status: 400 }
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
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const result = await FollowService.toggleFollow({
      followerId: user.id,
      followingId: id,
    });

    return NextResponse.json({
      success: true,
      isFollowing: result.isFollowing,
      totalFollowers: result.totalFollowers,
    });
  } catch (error) {
    console.error("Error toggling follow:", error);

    if (error instanceof Error) {
      if (error.message === "User to follow not found") {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (error.message === "Cannot follow yourself") {
        return NextResponse.json(
          { error: "Cannot follow yourself" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

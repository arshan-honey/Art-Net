import { NextResponse, NextRequest } from "next/server";
import { ArtistService } from "@/lib/services/artist.service";
import { verifyToken } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 }
      );
    }

    const artist = await ArtistService.getArtistByUsername(username);

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    // Check if current user is following this artist
    let isFollowing = false;
    const user = await verifyToken(request);

    if (user && user.id !== artist.id) {
      const followRecord = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: artist.id,
          },
        },
      });
      isFollowing = !!followRecord;
    }

    return NextResponse.json({
      ...artist,
      isFollowing,
    });
  } catch (error) {
    console.error("Error fetching artist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

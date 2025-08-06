import { NextResponse } from "next/server";
import { ArtistService } from "@/lib/services/artist.service";

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "12", 10);
    const category = searchParams.get("category") || "all";
    const sortBy = searchParams.get("sortBy") || "recent";
    const featured = searchParams.get("featured") === "true";

    if (!username) {
      return NextResponse.json(
        { error: "Username parameter is required" },
        { status: 400 }
      );
    }

    // First, get the artist to verify they exist and get their ID
    const artist = await ArtistService.getArtistByUsername(username);

    if (!artist) {
      return NextResponse.json(
        { error: "Artist not found" },
        { status: 404 }
      );
    }

    // Get the artist's artworks
    const artworks = await ArtistService.getArtistArtworks(artist.id, {
      status: "PUBLISHED",
      limit,
      offset: (page - 1) * limit,
      includeStats: true,
    });

    return NextResponse.json(artworks);
  } catch (error) {
    console.error("Error fetching artist artworks:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

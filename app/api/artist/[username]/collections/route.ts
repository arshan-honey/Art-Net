import { NextResponse } from "next/server";
import { ArtistService } from "@/lib/services/artist.service";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
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

    // First, get the artist to verify they exist and get their ID
    const artist = await ArtistService.getArtistByUsername(username);

    if (!artist) {
      return NextResponse.json(
        { error: "Artist not found" },
        { status: 404 }
      );
    }

    // Get the artist's collections
    const collections = await prisma.collection.findMany({
      where: {
        userId: artist.id,
        isPublic: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        isPublic: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
        artworks: {
          select: {
            id: true,
            artwork: {
              select: {
                id: true,
                title: true,
                primaryImage: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedCollections = collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      count: collection.artworks.length,
      preview: collection.coverImage || collection.artworks[0]?.artwork.primaryImage || null,
      artworks: collection.artworks.map((item) => ({
        id: item.artwork.id,
        title: item.artwork.title,
        image: item.artwork.primaryImage,
      })),
      createdAt: collection.createdAt,
      updatedAt: collection.updatedAt,
    }));

    return NextResponse.json({ collections: formattedCollections });
  } catch (error) {
    console.error("Error fetching artist collections:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

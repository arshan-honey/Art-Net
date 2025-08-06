import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const mockCategories = [
      {
        id: "1",
        name: "Digital Art",
        slug: "digital-art",
        description: "Digital artwork and illustrations",
        image: null,
        parentId: null,
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        artworkCount: 150,
        artistCount: 25,
        featuredArtworks: [],
      },
      {
        id: "2",
        name: "Photography",
        slug: "photography",
        description: "Photography and photo manipulation",
        image: null,
        parentId: null,
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
        artworkCount: 200,
        artistCount: 30,
        featuredArtworks: [],
      },
    ];

    return NextResponse.json(mockCategories);
  } catch (error) {
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

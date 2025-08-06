import { type NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { ArtistService } from "@/lib/services/artist.service";
import { z } from "zod";
import CloudinaryService from "@/lib/cloudinary";

const createArtworkSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(
    z.object({
      url: z.string().url(),
      altText: z.string().optional(),
      isPrimary: z.boolean().optional(),
      width: z.number().optional(),
      height: z.number().optional(),
      fileSize: z.number().optional(),
    })
  ),
  price: z.number().min(0).optional(),
  currency: z.string().default("USD"),
  isForSale: z.boolean().default(false),
  licenseType: z.enum(["PERSONAL", "COMMERCIAL", "EXCLUSIVE"]).optional(),
  dimensions: z.string().optional(),
  medium: z.string().optional(),
  yearCreated: z.number().min(1900).max(new Date().getFullYear()).optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "ARTIST") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as
      | "DRAFT"
      | "PUBLISHED"
      | "ARCHIVED"
      | null;
    const limit = Number.parseInt(searchParams.get("limit") || "20");
    const offset = Number.parseInt(searchParams.get("offset") || "0");
    const includeStats = searchParams.get("includeStats") === "true";

    const result = await ArtistService.getArtistArtworks(user.id, {
      status: status || undefined,
      limit,
      offset,
      includeStats,
    });

    return NextResponse.json({
      success: true,
      data: result.artworks,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Get artworks error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (user.role !== "ARTIST") {
      return NextResponse.json(
        { success: false, error: "Access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Handle image uploads if provided as base64
    let processedImages = body.images || [];

    if (body.imageFiles && body.imageFiles.length > 0) {
      try {
        // Upload images to Cloudinary
        const uploadResults = await CloudinaryService.uploadMultipleImages(
          body.imageFiles,
          {
            folder: `artworks/${user.id}`,
            tags: ["artwork", `artist_${user.id}`, ...(body.tags || [])],
            context: {
              user_id: user.id,
              artist_username: user.username,
              artwork_title: body.title,
            },
          }
        );

        processedImages = uploadResults.map((result, index) => ({
          url: result.secure_url,
          altText: body.title,
          isPrimary: index === 0,
          width: result.width,
          height: result.height,
          fileSize: result.bytes,
          cloudinary_public_id: result.public_id,
        }));
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return NextResponse.json(
          { success: false, error: "Failed to upload images" },
          { status: 500 }
        );
      }
    }

    const validatedData = createArtworkSchema.parse({
      ...body,
      images: processedImages,
    });

    if (validatedData.images.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one image is required" },
        { status: 400 }
      );
    }

    const artwork = await ArtistService.createArtwork(user.id, validatedData);

    if (!artwork) {
      // If artwork creation fails, clean up uploaded images
      if (processedImages.length > 0) {
        const publicIds = processedImages
          .filter((img) => img.cloudinary_public_id)
          .map((img) => img.cloudinary_public_id);

        if (publicIds.length > 0) {
          await CloudinaryService.deleteMultipleImages(publicIds);
        }
      }

      return NextResponse.json(
        { success: false, error: "Failed to create artwork" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: artwork,
      message: "Artwork created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    console.error("Create artwork error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

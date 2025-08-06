import { type NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { ArtistService } from "@/lib/services/artist.service";
import { z } from "zod";

const updateProfileSchema = z.object({
  artistStatement: z.string().optional(),
  specialties: z.array(z.string()).optional(),
  website: z.string().url().optional().or(z.literal("")),
  socialLinks: z.record(z.string()).optional(),
  acceptCommissions: z.boolean().optional(),
  commissionInfo: z.string().optional(),
  minCommissionPrice: z.number().min(0).optional(),
  maxCommissionPrice: z.string().optional(),
  isPublic: z.boolean().optional(),
  portfolioLayout: z.enum(["GRID", "MASONRY", "LIST"]).optional(),
  showPrices: z.boolean().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  location: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  exhibitions: z.string().optional(),
  awards: z.string().optional(),
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

    const profile = await ArtistService.getArtistProfile(user.id);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Artist profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get artist profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const validatedData = updateProfileSchema.parse(body);

    const updatedProfile = await ArtistService.updateArtistProfile(
      user.id,
      validatedData
    );

    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: "Profile updated successfully",
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

    console.error("Update artist profile error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

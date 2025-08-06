import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReportType } from "@prisma/client";

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser();
    
    if (!user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { artworkId, reason, description } = body;

    // Validate required fields
    if (!artworkId || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: artworkId and reason" },
        { status: 400 }
      );
    }

    // Validate reason is a valid ReportType
    const validReportTypes = Object.values(ReportType);
    if (!validReportTypes.includes(reason as ReportType)) {
      return NextResponse.json(
        { error: "Invalid report reason" },
        { status: 400 }
      );
    }

    // Check if artwork exists
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
    });

    if (!artwork) {
      return NextResponse.json(
        { error: "Artwork not found" },
        { status: 404 }
      );
    }

    // Check if user has already reported this artwork
    const existingReport = await prisma.report.findFirst({
      where: {
        reportedById: user.id,
        contentId: artworkId,
        contentType: "artwork",
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { error: "You have already reported this artwork" },
        { status: 409 }
      );
    }

    // Create the report
    const report = await prisma.report.create({
      data: {
        type: reason as ReportType,
        reason: reason,
        description: description || null,
        reportedById: user.id,
        contentId: artworkId,
        contentType: "artwork",
        status: "PENDING",
      },
    });

    return NextResponse.json(
      { 
        message: "Report submitted successfully", 
        reportId: report.id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

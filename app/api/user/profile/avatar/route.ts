import { type NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import CloudinaryService from "@/lib/cloudinary";
import { UserService } from "@/lib/services/user.service";
import { z } from "zod";

const avatarUploadSchema = z.object({
  image: z.string(), // base64 encoded image
});

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = avatarUploadSchema.parse(body);

    // Delete old avatar if exists
    if (user.avatar) {
      try {
        // Extract public_id from existing avatar URL
        const urlParts = user.avatar.split("/");
        const publicIdWithExtension = urlParts[urlParts.length - 1];
        const oldPublicId = publicIdWithExtension.split(".")[0];

        if (oldPublicId.includes("avatars")) {
          await CloudinaryService.deleteImage(oldPublicId);
        }
      } catch (error) {
        console.error("Failed to delete old avatar:", error);
        // Continue with upload even if old avatar deletion fails
      }
    }

    // Upload new avatar to Cloudinary
    const result = await CloudinaryService.uploadImage(validatedData.image, {
      folder: `avatars/${user.id}`,
      tags: ["avatar", `user_${user.id}`],
      context: {
        user_id: user.id,
        username: user.username,
        type: "avatar",
      },
      public_id: `avatar_${user.id}_${Date.now()}`,
      transformation: [
        { width: 400, height: 400, crop: "fill", gravity: "face" },
        { quality: "auto", fetch_format: "auto" },
      ],
    });

    // Update user profile with new avatar URL
    const updatedProfile = await UserService.updateUserProfile(user.id, {
      avatar: result.secure_url,
    });

    if (!updatedProfile) {
      // If profile update fails, clean up uploaded image
      await CloudinaryService.deleteImage(result.public_id);
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        avatar: result.secure_url,
        public_id: result.public_id,
      },
      message: "Avatar updated successfully",
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

    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await AuthService.getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!user.avatar) {
      return NextResponse.json(
        { success: false, error: "No avatar to delete" },
        { status: 400 }
      );
    }

    // Extract public_id from avatar URL
    const urlParts = user.avatar.split("/");
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split(".")[0];

    // Delete from Cloudinary
    const deleted = await CloudinaryService.deleteImage(publicId);

    if (!deleted) {
      console.error("Failed to delete avatar from Cloudinary");
    }

    // Update user profile to remove avatar
    const updatedProfile = await UserService.updateUserProfile(user.id, {
      avatar: null,
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Avatar deleted successfully",
    });
  } catch (error) {
    console.error("Avatar delete error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete avatar" },
      { status: 500 }
    );
  }
}

// Client-side utilities for file handling
// These functions are safe to use in the browser

export class ClientUtils {
  // Validate image file
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.",
      };
    }

    if (file.size > maxSize) {
      return {
        valid: false,
        error: "File size too large. Maximum size is 10MB.",
      };
    }

    return { valid: true };
  }

  // Convert file to base64 for upload
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        console.log("Base64 conversion successful, length:", result.length); // Debug log
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error("Base64 conversion failed:", error);
        reject(error);
      };
    });
  }

  // Generate optimized Cloudinary URL (client-side version)
  static generateOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
      quality?: string;
    } = {}
  ): string {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      return "/placeholder.svg";
    }

    const {
      width = 200,
      height = 200,
      crop = "fill",
      quality = "auto",
    } = options;
    const transformations = `w_${width},h_${height},c_${crop},q_${quality}`;

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
  }
}

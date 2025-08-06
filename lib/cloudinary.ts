import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
})

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  url: string
  width: number
  height: number
  format: string
  bytes: number
  created_at: string
  resource_type: string
  folder?: string
}

export interface UploadOptions {
  folder?: string
  transformation?: any[]
  tags?: string[]
  context?: Record<string, string>
  public_id?: string
  overwrite?: boolean
  quality?: string | number
  format?: string
}

export class CloudinaryService {
  // Upload single image
  static async uploadImage(file: string | Buffer, options: UploadOptions = {}): Promise<CloudinaryUploadResult> {
    try {
      const defaultOptions = {
        resource_type: "image" as const,
        quality: "auto",
        folder: options.folder,
        tags: options.tags,
        context: options.context,
        public_id: options.public_id,
        overwrite: options.overwrite ?? true, // Allow overwrite to avoid conflicts
        ...options,
      }

      // Use the file input as-is (already in proper data URL format from FileReader)
      const fileInput = Buffer.isBuffer(file) ? `data:image/jpeg;base64,${file.toString('base64')}` : file
      
      console.log("CloudinaryService: Uploading with options:", {
        ...defaultOptions,
        filePreview: fileInput.substring(0, 50) + "..." // Show first 50 chars for debugging
      })
      
      const result = await cloudinary.uploader.upload(fileInput, defaultOptions)
      
      console.log("CloudinaryService: Upload successful:", result.public_id)

      return {
        public_id: result.public_id,
        secure_url: result.secure_url,
        url: result.url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at,
        resource_type: result.resource_type,
        folder: result.folder,
      }
    } catch (error: any) {
      console.error("Cloudinary upload error:", error)
      
      // Provide specific error messages for common issues
      if (error.message?.includes('Stale request')) {
        throw new Error("Upload failed due to timing issue. Please try again.")
      } else if (error.message?.includes('Invalid image')) {
        throw new Error("Invalid image format. Please use JPEG, PNG, GIF, or WebP.")
      } else if (error.message?.includes('File size too large')) {
        throw new Error("File size too large. Maximum size is 10MB.")
      } else {
        throw new Error(`Failed to upload image: ${error.message || 'Unknown error'}`)
      }
    }
  }

  // Upload multiple images
  static async uploadMultipleImages(
    files: (string | Buffer)[],
    options: UploadOptions = {},
  ): Promise<CloudinaryUploadResult[]> {
    try {
      console.log("CloudinaryService: Starting upload of", files.length, "files"); // Debug log
      
      const uploadPromises = files.map((file, index) =>
        this.uploadImage(file, {
          ...options,
          public_id: options.public_id ? `${options.public_id}_${index}` : undefined,
        }),
      )

      const results = await Promise.all(uploadPromises)
      console.log("CloudinaryService: Upload completed successfully"); // Debug log
      
      return results
    } catch (error) {
      console.error("Cloudinary multiple upload error:", error)
      throw new Error("Failed to upload multiple images to Cloudinary")
    }
  }

  // Delete image
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return result.result === "ok"
    } catch (error) {
      console.error("Cloudinary delete error:", error)
      return false
    }
  }

  // Delete multiple images
  static async deleteMultipleImages(publicIds: string[]): Promise<{ deleted: string[]; failed: string[] }> {
    try {
      const result = await cloudinary.api.delete_resources(publicIds)

      const deleted: string[] = []
      const failed: string[] = []

      Object.entries(result.deleted).forEach(([publicId, status]) => {
        if (status === "deleted") {
          deleted.push(publicId)
        } else {
          failed.push(publicId)
        }
      })

      return { deleted, failed }
    } catch (error) {
      console.error("Cloudinary multiple delete error:", error)
      return { deleted: [], failed: publicIds }
    }
  }

  // Generate optimized URL with transformations
  static generateOptimizedUrl(
    publicId: string,
    transformations: {
      width?: number
      height?: number
      crop?: string
      quality?: string | number
      format?: string
      gravity?: string
      effect?: string
      overlay?: string
    } = {},
  ): string {
    try {
      return cloudinary.url(publicId, {
        ...transformations,
        secure: true,
        fetch_format: "auto",
        quality: transformations.quality || "auto",
      })
    } catch (error) {
      console.error("Cloudinary URL generation error:", error)
      return ""
    }
  }

  // Generate signed upload URL for frontend uploads
  static generateSignedUploadUrl(
    options: {
      folder?: string
      tags?: string[]
      context?: Record<string, string>
      transformation?: any[]
      public_id?: string
    } = {},
  ): { url: string; signature: string; timestamp: number; api_key: string } {
    try {
      const timestamp = Math.round(new Date().getTime() / 1000)
      const params = {
        timestamp,
        ...options,
      }

      const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET!)

      return {
        url: `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
        signature,
        timestamp,
        api_key: process.env.CLOUDINARY_API_KEY!,
      }
    } catch (error) {
      console.error("Cloudinary signed URL generation error:", error)
      throw new Error("Failed to generate signed upload URL")
    }
  }

  // Get image details
  static async getImageDetails(publicId: string): Promise<any> {
    try {
      return await cloudinary.api.resource(publicId)
    } catch (error) {
      console.error("Cloudinary get image details error:", error)
      return null
    }
  }

  // Search images
  static async searchImages(
    query: string,
    options: {
      max_results?: number
      next_cursor?: string
      sort_by?: string[]
    } = {},
  ): Promise<any> {
    try {
      const sortBy = options.sort_by || ["created_at", "desc"]
      return await cloudinary.search
        .expression(query)
        .max_results(options.max_results || 50)
        .next_cursor(options.next_cursor)
        .sort_by(sortBy[0], sortBy[1] as "asc" | "desc")
        .execute()
    } catch (error) {
      console.error("Cloudinary search error:", error)
      return { resources: [], total_count: 0 }
    }
  }

  // Create image transformations for different use cases
  static getArtworkTransformations() {
    return {
      thumbnail: { width: 300, height: 300, crop: "fill", quality: "auto" },
      medium: { width: 800, height: 600, crop: "limit", quality: "auto" },
      large: { width: 1200, height: 900, crop: "limit", quality: "auto" },
      watermark: {
        overlay: "watermark",
        gravity: "south_east",
        opacity: 30,
        width: 100,
      },
    }
  }

  static getAvatarTransformations() {
    return {
      small: { width: 50, height: 50, crop: "fill", gravity: "face", quality: "auto" },
      medium: { width: 100, height: 100, crop: "fill", gravity: "face", quality: "auto" },
      large: { width: 200, height: 200, crop: "fill", gravity: "face", quality: "auto" },
    }
  }

  // Validate image file
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed." }
    }

    if (file.size > maxSize) {
      return { valid: false, error: "File size too large. Maximum size is 10MB." }
    }

    return { valid: true }
  }

  // Convert file to base64 for upload
  static async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }
}

export default CloudinaryService

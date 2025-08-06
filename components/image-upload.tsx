"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, ImageIcon, AlertCircle, Check } from "lucide-react";
import { ClientUtils } from "@/lib/client-utils";
import { apiClient } from "@/lib/api-client";

interface UploadedImage {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  order?: number;
}

interface ImageUploadProps {
  onUploadComplete: (images: UploadedImage[]) => void;
  onUploadError: (error: string) => void;
  maxFiles?: number;
  folder?: string;
  tags?: string[];
  context?: Record<string, string>;
  multiple?: boolean;
  className?: string;
  accept?: Record<string, string[]>;
}

export function ImageUpload({
  onUploadComplete,
  onUploadError,
  maxFiles = 10,
  folder,
  tags = [],
  context = {},
  multiple = true,
  className = "",
  accept = {
    "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
  },
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      setUploading(true);
      setError(null);
      setUploadProgress(0);

      try {
        // Validate files
        for (const file of acceptedFiles) {
          const validation = ClientUtils.validateImageFile(file);
          if (!validation.valid) {
            throw new Error(validation.error);
          }
        }

        setUploadProgress(25); // Set initial progress

        // Convert files to base64
        const base64Files = await Promise.all(
          acceptedFiles.map(async (file) => {
            const base64 = await ClientUtils.fileToBase64(file);
            return base64;
          })
        );

        setUploadProgress(50); // Progress after file conversion

        // Upload to server
        const response = await apiClient.uploadMultipleImages({
          images: base64Files,
          folder,
          tags,
          context,
        });

        setUploadProgress(75); // Progress during upload

        console.log("Upload response:", response); // Debug log

        if (response.success) {
          const newImages = response.data as UploadedImage[];
          setUploadedImages((prev) => [...prev, ...newImages]);
          onUploadComplete(newImages);
          setUploadProgress(100);
        } else {
          console.error("Upload failed:", response.error); // Debug log
          throw new Error(response.error || "Upload failed");
        }
      } catch (error) {
        console.error("Upload error:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setError(errorMessage);
        onUploadError(errorMessage);
        setUploadProgress(0);
      } finally {
        setUploading(false);
        // Reset progress after a delay
        setTimeout(() => setUploadProgress(0), 2000);
      }
    },
    [folder, tags, context, onUploadComplete, onUploadError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
    disabled: uploading,
  });

  const removeImage = async (publicId: string) => {
    try {
      // Remove from local state
      setUploadedImages((prev) =>
        prev.filter((img) => img.public_id !== publicId)
      );

      // Note: In a real app, you might want to call an API to delete from Cloudinary
      // For now, we'll just remove from the UI
    } catch (error) {
      console.error("Failed to remove image:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-300 hover:border-gray-400"
              }
              ${uploading ? "pointer-events-none opacity-50" : ""}
            `}
          >
            <input {...getInputProps()} />

            {uploading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <div className="space-y-2">
                  <p className="text-lg font-medium">Uploading images...</p>
                  <div className="w-full max-w-xs mx-auto">
                    <Progress 
                      value={uploadProgress} 
                      className="w-full h-2"
                    />
                    <p className="text-sm text-gray-500 mt-1 text-center">
                      {uploadProgress}% complete
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {isDragActive
                      ? "Drop images here"
                      : "Drop images here, or click to browse"}
                  </p>
                  <p className="text-gray-600 mb-4">
                    {multiple
                      ? `Upload up to ${maxFiles} images`
                      : "Upload one image"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported formats: JPEG, PNG, GIF, WebP (max 10MB each)
                  </p>
                </div>
                <Button type="button" variant="outline">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">
                Uploaded Images ({uploadedImages.length})
              </h4>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <Check className="h-3 w-3 mr-1" />
                Upload Complete
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedImages.map((image) => (
                <div key={image.public_id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={ClientUtils.generateOptimizedUrl(image.public_id, {
                        width: 200,
                        height: 200,
                        crop: "fill",
                        quality: "auto",
                      })}
                      alt="Uploaded image"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                      }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeImage(image.public_id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-600 truncate">
                      {image.width} × {image.height}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(image.bytes)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

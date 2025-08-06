"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Camera, Upload, Trash2, AlertCircle } from "lucide-react";
import { ClientUtils } from "@/lib/client-utils";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/components/auth-provider";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName?: string;
  size?: "sm" | "md" | "lg" | "xl";
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  className?: string;
}

export function AvatarUpload({
  currentAvatar,
  userName = "User",
  size = "md",
  onAvatarUpdate,
  className = "",
}: AvatarUploadProps) {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-32 w-32",
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Validate file
      const validation = ClientUtils.validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Convert to base64
      const base64 = await ClientUtils.fileToBase64(file);

      // Upload avatar
      const response = await apiClient.uploadAvatar(base64);

      if (response.success) {
        const newAvatarUrl = (response.data as { avatar: string })?.avatar;

        // Update local state
        if (onAvatarUpdate && newAvatarUrl) {
          onAvatarUpdate(newAvatarUrl);
        }

        // Refresh user data
        await refreshUser();

        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully.",
        });

        setIsDialogOpen(false);
      } else {
        throw new Error(response.error || "Upload failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Upload failed";
      setError(errorMessage);
      toast({
        title: "Upload failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = "";
    }
  };

  const handleDeleteAvatar = async () => {
    if (!currentAvatar) return;

    setUploading(true);
    setError(null);

    try {
      const response = await apiClient.deleteAvatar();

      if (response.success) {
        // Update local state
        if (onAvatarUpdate) {
          onAvatarUpdate("");
        }

        // Refresh user data
        await refreshUser();

        toast({
          title: "Avatar deleted",
          description: "Your profile picture has been removed.",
        });

        setIsDialogOpen(false);
      } else {
        throw new Error(response.error || "Delete failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Delete failed";
      setError(errorMessage);
      toast({
        title: "Delete failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative ${className}`}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <div className="relative group cursor-pointer">
            <Avatar className={sizeClasses[size]}>
              <AvatarImage src={currentAvatar || undefined} alt={userName} />
              <AvatarFallback>{getInitials(userName)}</AvatarFallback>
            </Avatar>

            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="h-4 w-4 text-white" />
            </div>
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Profile Picture</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Avatar Preview */}
            <div className="flex justify-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={currentAvatar || undefined} alt={userName} />
                <AvatarFallback className="text-lg">
                  {getInitials(userName)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Upload Actions */}
            <div className="space-y-3">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="avatar-upload"
                  disabled={uploading}
                />
                <Button asChild className="w-full" disabled={uploading}>
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    {uploading ? "Uploading..." : "Upload New Picture"}
                  </label>
                </Button>
              </div>

              {currentAvatar && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDeleteAvatar}
                  disabled={uploading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Picture
                </Button>
              )}
            </div>

            <div className="text-sm text-gray-500 text-center">
              <p>Recommended: Square image, at least 200×200 pixels</p>
              <p>Maximum file size: 10MB</p>
              <p>Supported formats: JPEG, PNG, GIF, WebP</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

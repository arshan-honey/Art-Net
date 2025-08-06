"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import Image from "next/image";
import JSZip from "jszip";
import {
  Heart,
  MessageCircle,
  Share2,
  Download,
  Eye,
  Calendar,
  Tag,
  DollarSign,
  MoreHorizontal,
  Send,
  Bookmark,
  ExternalLink,
  Maximize,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserCheck,
  Flag,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useArtwork } from "@/hooks/use-artwork";
import { useComments } from "@/hooks/use-comments";
import { useLike } from "@/hooks/use-like";
import { useFollow } from "@/hooks/use-follow";
import { useReport } from "@/hooks/use-report";
import { useCollections } from "@/hooks/use-user";
import { ReportModal } from "@/components/report-modal";
import { SaveToCollectionModal } from "@/components/save-to-collection-modal";
import { formatDimensions } from "@/lib/utils";

interface ArtworkDetailPageProps {
  params: {
    id: string;
  };
}

export default function ArtworkDetailPage({ params }: ArtworkDetailPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [commentLoading, setCommentLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);

  // Fetch artwork data using the API
  const {
    artwork,
    loading: artworkLoading,
    error: artworkError,
  } = useArtwork(params.id);

  // Initialize like hook with artwork data
  const {
    isLiked,
    totalLikes,
    loading: likeLoading,
    toggleLike,
  } = useLike(params.id, artwork?.isLiked || false, artwork?.likes || 0);

  // Initialize follow hook with artist data
  const {
    isFollowing,
    totalFollowers,
    loading: followLoading,
    toggleFollow,
  } = useFollow(
    artwork?.artist?.id || "",
    artwork?.artist?.isFollowing || false,
    artwork?.artist?.followers || 0
  );

  // Fetch comments using the API
  const {
    comments,
    loading: commentsLoading,
    error: commentsError,
    fetchComments,
    createComment,
  } = useComments(params.id);

  // Report functionality
  const { loading: reportLoading, reportArtwork } = useReport();

  // Collections functionality
  const { collections, refetch: refetchCollections } = useCollections();

  // Fetch comments when component mounts
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Determine which collections this artwork is saved in
  const savedCollections = collections
    .filter((collection) =>
      collection.artworks?.some(
        (artworkEntry) => artworkEntry.artwork.id === params.id
      )
    )
    .map((collection) => ({
      id: collection.id,
      name: collection.name,
    }));

  const isSavedInAnyCollection = savedCollections.length > 0;

  const handleSave = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save artworks to collections",
        variant: "destructive",
      });
      return;
    }

    setSaveModalOpen(true);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied!",
      description: "Artwork link has been copied to your clipboard",
    });
  };

  const handleReport = async (reason: string, description: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to report artwork",
        variant: "destructive",
      });
      return false;
    }

    return await reportArtwork(params.id, reason, description);
  };

  const downloadImageAsBlob = async (imageUrl: string, filename: string) => {
    try {
      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }

      const blob = await response.blob();

      // Create a blob URL
      const blobUrl = URL.createObjectURL(blob);

      // Create a temporary link element and trigger download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);

      return true;
    } catch (error) {
      console.error("Error downloading image:", error);
      return false;
    }
  };

  const handleDownload = async () => {
    if (!artwork?.images || artwork.images.length === 0) {
      toast({
        title: "No images available",
        description: "This artwork has no images to download",
        variant: "destructive",
      });
      return;
    }

    setDownloadLoading(true);

    toast({
      title: "Preparing download...",
      description: "Please wait while we prepare your files",
    });

    try {
      // If there's only one image, download it directly without ZIP
      if (artwork.images.length === 1) {
        const image = artwork.images[0];
        const fileExtension =
          image.url.split(".").pop()?.split("?")[0] || "jpg";
        const filename = `${artwork.title
          .replace(/[^a-z0-9]/gi, "_")
          .toLowerCase()}.${fileExtension}`;

        const success = await downloadImageAsBlob(image.url, filename);
        if (success) {
          toast({
            title: "Download completed!",
            description: "The artwork image has been downloaded",
          });
        } else {
          throw new Error("Failed to download image");
        }
        return;
      }

      // For multiple images, create a ZIP file
      toast({
        title: "Creating ZIP file...",
        description: `Packaging ${artwork.images.length} images into a ZIP file`,
      });

      const zip = new JSZip();
      let successCount = 0;

      // Download and add each image to the ZIP
      for (let i = 0; i < artwork.images.length; i++) {
        const image = artwork.images[i];

        try {
          toast({
            title: "Processing images...",
            description: `Adding image ${i + 1} of ${
              artwork.images.length
            } to ZIP`,
          });

          // Fetch the image as a blob
          const response = await fetch(image.url);
          if (!response.ok) {
            throw new Error(`Failed to fetch image ${i + 1}`);
          }

          const blob = await response.blob();

          // Determine file extension
          const fileExtension =
            image.url.split(".").pop()?.split("?")[0] || "jpg";

          // Create filename with padded number for proper sorting
          const filename = `${artwork.title
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase()}_${String(i + 1).padStart(2, "0")}.${fileExtension}`;

          // Add the image to the ZIP
          zip.file(filename, blob);
          successCount++;
        } catch (error) {
          console.error(`Error processing image ${i + 1}:`, error);
          // Continue with other images even if one fails
        }
      }

      if (successCount === 0) {
        throw new Error("Failed to process any images");
      }

      toast({
        title: "Generating ZIP file...",
        description: "Almost done! Creating the final ZIP file",
      });

      // Generate the ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Create download link for the ZIP file
      const zipUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = zipUrl;
      link.download = `${artwork.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_images.zip`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(zipUrl);

      if (successCount === artwork.images.length) {
        toast({
          title: "ZIP download completed!",
          description: `Successfully packaged all ${successCount} images into a ZIP file`,
        });
      } else {
        toast({
          title: "ZIP download completed with warnings",
          description: `Packaged ${successCount} out of ${artwork.images.length} images into a ZIP file`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download failed",
        description:
          "There was an error creating the ZIP file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;

    setCommentLoading(true);
    const result = await createComment({ content: newComment });

    if (result) {
      toast({
        title: "Comment posted!",
        description: "Your comment has been added to the artwork",
      });
      setNewComment("");
      // Refresh comments to show the new comment
      fetchComments();
    } else {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    }

    setCommentLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Loading State */}
          {artworkLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="overflow-hidden">
                  <Skeleton className="w-full h-96 md:h-[500px]" />
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex gap-2 mb-4">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Error State */}
          {artworkError && (
            <div className="text-center py-12">
              <p className="text-red-600 text-lg mb-4">{artworkError}</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )}

          {/* Main Content */}
          {artwork && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Image Gallery */}
                <Card className="overflow-hidden">
                  <div className="relative">
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="relative cursor-pointer group">
                          <Image
                            src={
                              artwork.images[currentImageIndex]?.url ||
                              "/placeholder.svg"
                            }
                            alt={artwork.title}
                            width={1200}
                            height={800}
                            className="w-full h-96 md:h-[500px] object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <Maximize className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl w-full h-[80vh]">
                        <div className="relative w-full h-full">
                          <Image
                            src={
                              artwork.images[currentImageIndex]?.url ||
                              "/placeholder.svg"
                            }
                            alt={artwork.title}
                            fill
                            className="object-contain"
                          />
                        </div>
                      </DialogContent>
                    </Dialog>

                    {artwork.images.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute left-4 top-1/2 transform -translate-y-1/2"
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev > 0 ? prev - 1 : artwork.images.length - 1
                            )
                          }
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="absolute right-4 top-1/2 transform -translate-y-1/2"
                          onClick={() =>
                            setCurrentImageIndex((prev) =>
                              prev < artwork.images.length - 1 ? prev + 1 : 0
                            )
                          }
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                          {artwork.images.map((_, index) => (
                            <button
                              key={index}
                              className={`w-2 h-2 rounded-full ${
                                index === currentImageIndex
                                  ? "bg-white"
                                  : "bg-white/50"
                              }`}
                              onClick={() => setCurrentImageIndex(index)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                {/* Artwork Info */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                          {artwork.title}
                        </h1>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {artwork.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(artwork.createdAt)}
                          </span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={handleShare}>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={handleDownload}
                            disabled={downloadLoading}
                          >
                            {downloadLoading ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4 mr-2" />
                            )}
                            Download{" "}
                            {artwork?.images && artwork.images.length > 1
                              ? `as ZIP (${artwork.images.length} files)`
                              : ""}
                          </DropdownMenuItem>
                          <ReportModal
                            onReport={handleReport}
                            loading={reportLoading}
                          >
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <Flag className="h-4 w-4 mr-2" />
                              Report
                            </DropdownMenuItem>
                          </ReportModal>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {artwork.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {artwork.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/browse?tag=${tag.toLowerCase()}`}
                        >
                          <Badge
                            variant="outline"
                            className="hover:bg-primary hover:text-primary-foreground cursor-pointer"
                          >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        </Link>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant={isLiked ? "default" : "outline"}
                          onClick={
                            user
                              ? toggleLike
                              : () => {
                                  toast({
                                    title: "Authentication required",
                                    description:
                                      "Please log in to like artworks",
                                    variant: "destructive",
                                  });
                                }
                          }
                          disabled={likeLoading}
                          className={
                            isLiked ? "bg-red-500 hover:bg-red-600" : ""
                          }
                        >
                          {likeLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Heart
                              className={`h-4 w-4 mr-2 ${
                                isLiked ? "fill-current" : ""
                              }`}
                            />
                          )}
                          {totalLikes}
                        </Button>
                        <Button variant="outline">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {comments.length}
                        </Button>
                        <Button variant="outline" onClick={handleSave}>
                          <Bookmark
                            className={`h-4 w-4 mr-2 ${
                              isSavedInAnyCollection
                                ? "fill-current text-green-600"
                                : ""
                            }`}
                          />
                          {isSavedInAnyCollection ? "Saved" : "Save"}
                        </Button>
                      </div>
                      <Button onClick={handleShare}>
                        <Share2 className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments Section */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-6">
                      Comments ({comments.length})
                    </h3>

                    {/* Add Comment */}
                    {user ? (
                      <div className="mb-6">
                        <div className="flex space-x-3">
                          <Avatar>
                            <AvatarImage
                              src={user.avatar || "/placeholder.svg"}
                              alt={user?.firstName}
                            />
                            <AvatarFallback>
                              {user?.firstName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Textarea
                              placeholder="Add a comment..."
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              className="mb-2"
                            />
                            <div className="flex justify-end">
                              <Button
                                onClick={handleComment}
                                disabled={!newComment.trim() || commentLoading}
                              >
                                {commentLoading ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4 mr-2" />
                                )}
                                Post Comment
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-600 mb-2">
                          Please log in to comment on this artwork
                        </p>
                        <Link href="/login">
                          <Button>Log In</Button>
                        </Link>
                      </div>
                    )}

                    {/* Comments List */}
                    {commentsLoading ? (
                      <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex space-x-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="h-4 w-32 mb-2" />
                              <Skeleton className="h-4 w-full mb-1" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {comments.map((comment) => (
                          <div key={comment.id} className="space-y-3">
                            <div className="flex space-x-3">
                              <Avatar>
                                <AvatarImage
                                  src={
                                    comment.user.avatar || "/placeholder.svg"
                                  }
                                  alt={comment.user.name}
                                />
                                <AvatarFallback>
                                  {comment.user.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <Link
                                    href={`/artist/${comment.user.username}`}
                                  >
                                    <span className="font-medium hover:text-primary cursor-pointer">
                                      {comment.user.name}
                                    </span>
                                  </Link>
                                  <span className="text-gray-500 text-sm">
                                    @{comment.user.username}
                                  </span>
                                  <span className="text-gray-500 text-sm">
                                    •
                                  </span>
                                  <span className="text-gray-500 text-sm">
                                    {formatTimeAgo(comment.createdAt)}
                                  </span>
                                </div>
                                <p className="text-gray-700 mb-2">
                                  {comment.content}
                                </p>
                                <div className="flex items-center space-x-4 text-sm">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={
                                      user
                                        ? undefined
                                        : () => {
                                            toast({
                                              title: "Authentication required",
                                              description:
                                                "Please log in to like comments",
                                              variant: "destructive",
                                            });
                                          }
                                    }
                                  >
                                    <Heart className="h-3 w-3 mr-1" />
                                    Like
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={
                                      user
                                        ? undefined
                                        : () => {
                                            toast({
                                              title: "Authentication required",
                                              description:
                                                "Please log in to reply to comments",
                                              variant: "destructive",
                                            });
                                          }
                                    }
                                  >
                                    Reply
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Replies */}
                            {comment.replies.map((reply) => (
                              <div
                                key={reply.id}
                                className="ml-12 flex space-x-3"
                              >
                                <Avatar className="w-8 h-8">
                                  <AvatarImage
                                    src={
                                      reply.user.avatar || "/placeholder.svg"
                                    }
                                    alt={reply.user.name}
                                  />
                                  <AvatarFallback className="text-xs">
                                    {reply.user.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <Link
                                      href={`/artist/${reply.user.username}`}
                                    >
                                      <span className="font-medium hover:text-primary cursor-pointer text-sm">
                                        {reply.user.name}
                                      </span>
                                    </Link>
                                    <span className="text-gray-500 text-xs">
                                      @{reply.user.username}
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      •
                                    </span>
                                    <span className="text-gray-500 text-xs">
                                      {formatTimeAgo(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm mb-2">
                                    {reply.content}
                                  </p>
                                  <div className="flex items-center space-x-4 text-xs">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2"
                                      onClick={
                                        user
                                          ? undefined
                                          : () => {
                                              toast({
                                                title:
                                                  "Authentication required",
                                                description:
                                                  "Please log in to like comments",
                                                variant: "destructive",
                                              });
                                            }
                                      }
                                    >
                                      <Heart className="h-3 w-3 mr-1" />
                                      Like
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2"
                                      onClick={
                                        user
                                          ? undefined
                                          : () => {
                                              toast({
                                                title:
                                                  "Authentication required",
                                                description:
                                                  "Please log in to reply to comments",
                                                variant: "destructive",
                                              });
                                            }
                                      }
                                    >
                                      Reply
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Artist Info */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={artwork.artist.avatar || "/placeholder.svg"}
                          alt={artwork.artist.name}
                        />
                        <AvatarFallback>
                          {artwork.artist.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link href={`/artist/${artwork.artist.username}`}>
                          <h3 className="font-semibold hover:text-primary cursor-pointer">
                            {artwork.artist.name}
                          </h3>
                        </Link>
                        <p className="text-gray-600 text-sm">
                          @{artwork.artist.username}
                        </p>
                      </div>
                      {artwork.artist.verified && (
                        <Badge variant="secondary">✓</Badge>
                      )}
                    </div>
                    {artwork.artist.bio && (
                      <p className="text-gray-700 text-sm mb-4">
                        {artwork.artist.bio}
                      </p>
                    )}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-600">
                        {totalFollowers.toLocaleString()} followers
                      </span>
                      <Button
                        size="sm"
                        variant={isFollowing ? "outline" : "default"}
                        onClick={
                          user
                            ? toggleFollow
                            : () => {
                                toast({
                                  title: "Authentication required",
                                  description:
                                    "Please log in to follow artists",
                                  variant: "destructive",
                                });
                              }
                        }
                        disabled={
                          followLoading || user?.id === artwork.artist.id
                        }
                      >
                        {followLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : user?.id === artwork.artist.id ? (
                          <UserCheck className="h-4 w-4 mr-2" />
                        ) : isFollowing ? (
                          <UserCheck className="h-4 w-4 mr-2" />
                        ) : null}
                        {user?.id === artwork.artist.id
                          ? "You"
                          : isFollowing
                          ? "Following"
                          : "Follow"}
                      </Button>
                    </div>
                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/artist/${artwork.artist.username}`}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Portfolio
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                {/* Artwork Details */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Artwork Details</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category</span>
                        <Badge variant="outline">{artwork.category}</Badge>
                      </div>
                      {artwork.dimensions && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dimensions</span>
                          <span>{formatDimensions(artwork.dimensions)}</span>
                        </div>
                      )}
                      {artwork.medium && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Medium</span>
                          <span>{artwork.medium}</span>
                        </div>
                      )}
                      {artwork.yearCreated && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Year Created</span>
                          <span>{artwork.yearCreated}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">License</span>
                        <span>{artwork.licenseType}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Purchase Options */}
                {artwork.isForSale && artwork.price && (
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-4">Purchase Options</h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span>Original Digital File</span>
                          <span className="font-semibold">
                            {artwork.currency || "$"}
                            {artwork.price}
                          </span>
                        </div>
                        <Button className="w-full">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Purchase Original
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Related Artworks */}
                {artwork.relatedArtworks &&
                  artwork.relatedArtworks.length > 0 && (
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">
                          More from {artwork.artist.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {artwork.relatedArtworks.map((related) => (
                            <Link
                              key={related.id}
                              href={`/artwork/${related.id}`}
                            >
                              <div className="group cursor-pointer">
                                <Image
                                  src={
                                    related.primaryImage || "/placeholder.svg"
                                  }
                                  alt={related.title}
                                  width={400}
                                  height={300}
                                  className="w-full h-24 object-cover rounded-lg group-hover:opacity-80 transition-opacity"
                                />
                                <p className="text-xs font-medium mt-1 group-hover:text-primary transition-colors">
                                  {related.title}
                                </p>
                                <p className="text-xs text-gray-600 flex items-center">
                                  <Heart className="h-3 w-3 mr-1" />
                                  {related.likes}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save to Collection Modal */}
      {artwork && (
        <SaveToCollectionModal
          open={saveModalOpen}
          onOpenChange={setSaveModalOpen}
          artworkId={params.id}
          artworkTitle={artwork.title}
          savedCollections={savedCollections}
          onSaveStatusChange={() => refetchCollections(true)}
        />
      )}
    </div>
  );
}

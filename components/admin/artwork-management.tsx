"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { useAdminArtworks } from "@/hooks/use-admin";
import { getStatusBadge } from "./admin-utils";

export function ArtworkManagement() {
  const router = useRouter();
  const [deletingArtworkId, setDeletingArtworkId] = useState<string | null>(null);
  const [updatingArtworkId, setUpdatingArtworkId] = useState<string | null>(null);
  const {
    artworks,
    isLoading: artworksLoading,
    updateArtworkStatus,
    deleteArtwork,
  } = useAdminArtworks();

  const handleViewArtwork = (artwork: any) => {
    // Navigate to artwork detail page
    router.push(`/artwork/${artwork.id}`);
  };

  const handleArtworkAction = async (
    artworkId: string,
    action: string,
    reason?: string
  ) => {
    try {
      switch (action) {
        case "approve":
          setUpdatingArtworkId(artworkId);
          await updateArtworkStatus(artworkId, "PUBLISHED", reason);
          break;
        case "reject":
          setUpdatingArtworkId(artworkId);
          await updateArtworkStatus(artworkId, "REJECTED", reason);
          break;
        case "flag":
          setUpdatingArtworkId(artworkId);
          await updateArtworkStatus(artworkId, "FLAGGED", reason);
          break;
        case "delete":
          setDeletingArtworkId(artworkId);
          await deleteArtwork(artworkId, reason);
          break;
      }
    } catch (error) {
      console.error("Artwork action failed:", error);
    } finally {
      setDeletingArtworkId(null);
      setUpdatingArtworkId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artwork Management</CardTitle>
        <CardDescription>
          Review and moderate artwork submissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {artworksLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-center space-x-4"
              >
                <div className="bg-gray-200 h-12 w-12 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artwork</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artworks.map((artwork) => (
                <TableRow key={artwork.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-200">
                        {artwork.imageUrl ? (
                          <Image
                            src={artwork.imageUrl}
                            alt={artwork.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                            onError={(e) => {
                              // Show fallback when image fails to load
                              const target = e.currentTarget;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          className="absolute inset-0 bg-gray-100 flex items-center justify-center"
                          style={{ display: artwork.imageUrl ? 'none' : 'flex' }}
                        >
                          <ImageIcon className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{artwork.title}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(artwork.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{artwork.artist.displayName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {artwork.category?.name || "No Category"}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(artwork.status)}</TableCell>
                  <TableCell>
                    {artwork.reportCount > 0 ? (
                      <Badge variant="destructive">
                        {artwork.reportCount}
                      </Badge>
                    ) : (
                      <span className="text-gray-500">0</span>
                    )}
                  </TableCell>
                  <TableCell>{artwork.likeCount}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleViewArtwork(artwork)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Artwork
                          <ExternalLink className="h-3 w-3 ml-auto" />
                        </DropdownMenuItem>
                        {artwork.status === "FLAGGED" && (
                          <>
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() =>
                                handleArtworkAction(
                                  artwork.id,
                                  "approve",
                                  "Admin approval"
                                )
                              }
                              disabled={updatingArtworkId === artwork.id}
                            >
                              {updatingArtworkId === artwork.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <CheckCircle className="h-4 w-4 mr-2" />
                              )}
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                handleArtworkAction(
                                  artwork.id,
                                  "reject",
                                  "Admin rejection"
                                )
                              }
                              disabled={updatingArtworkId === artwork.id}
                            >
                              {updatingArtworkId === artwork.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <XCircle className="h-4 w-4 mr-2" />
                              )}
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            handleArtworkAction(
                              artwork.id,
                              "delete",
                              "Admin deletion"
                            )
                          }
                          disabled={deletingArtworkId === artwork.id}
                        >
                          {deletingArtworkId === artwork.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

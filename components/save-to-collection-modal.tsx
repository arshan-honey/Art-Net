"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCollections } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Plus,
  Bookmark,
  FolderOpen,
  Users,
  Trash2,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface SaveToCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artworkId: string;
  artworkTitle: string;
  savedCollections?: Array<{ id: string; name: string }>; // Collections this artwork is already saved in
  onSaveStatusChange?: () => void; // Callback to refresh parent state
}

export function SaveToCollectionModal({
  open,
  onOpenChange,
  artworkId,
  artworkTitle,
  savedCollections = [],
  onSaveStatusChange,
}: SaveToCollectionModalProps) {
  const { collections, isLoading, addToCollection, removeFromCollection } =
    useCollections();
  const { toast } = useToast();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [mode, setMode] = useState<"save" | "manage">("save"); // "save" for adding, "manage" for removing

  // Reset selected collection when modal opens and set mode
  useEffect(() => {
    if (open) {
      setSelectedCollectionId("");
      // If artwork is already saved in collections, show manage mode
      setMode(savedCollections.length > 0 ? "manage" : "save");
    }
  }, [open, savedCollections.length]);

  const handleSave = async () => {
    if (!selectedCollectionId) {
      toast({
        title: "Selection required",
        description: "Please select a collection first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await addToCollection(selectedCollectionId, artworkId);
      toast({
        title: "Success!",
        description: `"${artworkTitle}" has been saved to your collection`,
      });
      onSaveStatusChange?.(); // Notify parent to refresh
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save artwork:", error);
      // Error toast is already handled by the hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedCollectionId) {
      toast({
        title: "Selection required",
        description: "Please select a collection first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await removeFromCollection(selectedCollectionId, artworkId);
      toast({
        title: "Success!",
        description: `"${artworkTitle}" has been removed from your collection`,
      });
      onSaveStatusChange?.(); // Notify parent to refresh
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to remove artwork:", error);
      // Error toast is already handled by the hook
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedCollectionId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "save" ? (
              <>
                <Bookmark className="h-5 w-5" />
                Save to Collection
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Manage Saved Artwork
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {mode === "save"
              ? `Choose a collection to save "${artworkTitle}" to`
              : `"${artworkTitle}" is already saved in ${
                  savedCollections.length
                } collection${savedCollections.length > 1 ? "s" : ""}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="ml-2 text-gray-600">Loading collections...</span>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="flex justify-center">
                <FolderOpen className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-600 mb-2">
                  You don't have any collections yet.
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Create your first collection to organize your favorite
                  artworks.
                </p>
                <Link href="/profile#collections">
                  <Button onClick={() => onOpenChange(false)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Collection
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {mode === "save"
                    ? "Select a collection:"
                    : "Saved in collections:"}
                </Label>
                {mode === "manage" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setMode("save")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to Another
                  </Button>
                )}
              </div>

              {mode === "manage" && (
                <div className="mb-4">
                  <RadioGroup
                    value={selectedCollectionId}
                    onValueChange={setSelectedCollectionId}
                    className="space-y-2 max-h-64 overflow-y-auto"
                  >
                    {savedCollections.map((collection) => {
                      const fullCollection = collections.find(
                        (c) => c.id === collection.id
                      );
                      return (
                        <div
                          key={collection.id}
                          className="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            value={collection.id}
                            id={collection.id}
                            className="mt-1"
                          />
                          <Label
                            htmlFor={collection.id}
                            className="flex-1 cursor-pointer"
                          >
                            <Card className="hover:bg-gray-50 transition-colors border-green-200 bg-green-50">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium text-sm">
                                        {collection.name}
                                      </h4>
                                      <Badge
                                        variant="secondary"
                                        className="text-xs bg-green-100 text-green-800"
                                      >
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Saved
                                      </Badge>
                                    </div>
                                    {fullCollection?.description && (
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        {fullCollection.description}
                                      </p>
                                    )}
                                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                      <span>
                                        {fullCollection?.artworks?.length || 0}{" "}
                                        artwork
                                        {(fullCollection?.artworks?.length ||
                                          0) !== 1
                                          ? "s"
                                          : ""}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {fullCollection?.isPublic
                                          ? "Public"
                                          : "Private"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              )}

              {mode === "save" && (
                <RadioGroup
                  value={selectedCollectionId}
                  onValueChange={setSelectedCollectionId}
                  className="space-y-2 max-h-64 overflow-y-auto"
                >
                  {collections
                    .filter(
                      (collection) =>
                        !savedCollections.some(
                          (saved) => saved.id === collection.id
                        )
                    )
                    .map((collection) => (
                      <div
                        key={collection.id}
                        className="flex items-center space-x-2"
                      >
                        <RadioGroupItem
                          value={collection.id}
                          id={collection.id}
                          className="mt-1"
                        />
                        <Label
                          htmlFor={collection.id}
                          className="flex-1 cursor-pointer"
                        >
                          <Card className="hover:bg-gray-50 transition-colors">
                            <CardContent className="p-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">
                                    {collection.name}
                                  </h4>
                                  {collection.description && (
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                      {collection.description}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                    <span>
                                      {collection.artworks?.length || 0} artwork
                                      {(collection.artworks?.length || 0) !== 1
                                        ? "s"
                                        : ""}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {collection.isPublic
                                        ? "Public"
                                        : "Private"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Label>
                      </div>
                    ))}
                </RadioGroup>
              )}

              {mode === "save" &&
                collections.filter(
                  (collection) =>
                    !savedCollections.some(
                      (saved) => saved.id === collection.id
                    )
                ).length === 0 && (
                  <div className="text-center py-8 space-y-4">
                    <div className="flex justify-center">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                    <div>
                      <p className="text-gray-600 mb-2">
                        This artwork is already saved in all your collections.
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Create a new collection to organize this artwork
                        differently.
                      </p>
                      <Link href="/profile#collections">
                        <Button onClick={() => onOpenChange(false)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create New Collection
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {collections.length > 0 &&
          (mode === "manage" ||
            collections.filter(
              (collection) =>
                !savedCollections.some((saved) => saved.id === collection.id)
            ).length > 0) && (
            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                {mode === "manage" && (
                  <Button
                    variant="destructive"
                    onClick={handleRemove}
                    disabled={!selectedCollectionId || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Removing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove from Collection
                      </>
                    )}
                  </Button>
                )}
                {mode === "save" && (
                  <Button
                    onClick={handleSave}
                    disabled={!selectedCollectionId || isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-4 w-4 mr-2" />
                        Save to Collection
                      </>
                    )}
                  </Button>
                )}
              </div>
            </DialogFooter>
          )}
      </DialogContent>
    </Dialog>
  );
}

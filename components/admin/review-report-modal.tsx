import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle, X, Loader2, Eye, Flag, User, Calendar } from "lucide-react";
import { ContentReport } from "@/lib/types/admin";

interface ReviewReportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  report: ContentReport | null;
  onResolve: (reportId: string, resolution: string, notes: string) => Promise<void>;
  isResolving: boolean;
}

const resolutionOptions = [
  { value: "NO_ACTION", label: "No Action Required", description: "Report is invalid or content is acceptable" },
  { value: "WARNING", label: "Warning Issued", description: "Warning sent to user, content remains" },
  { value: "CONTENT_REMOVED", label: "Content Removed", description: "Content has been removed from platform" },
  { value: "USER_SUSPENDED", label: "User Suspended", description: "User account temporarily suspended" },
  { value: "USER_BANNED", label: "User Banned", description: "User account permanently banned" },
];

export function ReviewReportModal({
  isOpen,
  onOpenChange,
  report,
  onResolve,
  isResolving
}: ReviewReportModalProps) {
  const [resolution, setResolution] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!report || !resolution) return;

    try {
      await onResolve(report.id, resolution, notes);
      
      // Reset form
      setResolution("");
      setNotes("");
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the parent component and shown via toast
      console.error("Failed to resolve report:", error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!isResolving) {
      onOpenChange(open);
      if (!open) {
        // Reset form when closing
        setResolution("");
        setNotes("");
      }
    }
  };

  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-red-600" />
            Review Report
          </DialogTitle>
          <DialogDescription>
            Review and resolve this content report
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-600">Report Type</Label>
                <Badge variant="outline" className="mt-1">
                  {report.type}
                </Badge>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-600">Status</Label>
                <Badge 
                  variant={report.status === "PENDING" ? "destructive" : "secondary"}
                  className="mt-1"
                >
                  {report.status}
                </Badge>
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-600">Reason</Label>
              <p className="mt-1 text-sm">{report.reason}</p>
            </div>

            {report.description && (
              <div>
                <Label className="text-sm font-medium text-gray-600">Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {report.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Reporter Info */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <User className="h-4 w-4" />
              Reporter Information
            </Label>
            <div className="mt-2 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Name:</span> {report.reporter.displayName}
              </p>
              <p className="text-sm">
                <span className="font-medium">Username:</span> @{report.reporter.username}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> {report.reporter.email}
              </p>
            </div>
          </div>

          {/* Target Info */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Reported Content
            </Label>
            <div className="mt-2 space-y-2">
              <p className="text-sm">
                <span className="font-medium">Title:</span> {report.target.title || "N/A"}
              </p>
              <p className="text-sm">
                <span className="font-medium">ID:</span> {report.target.id}
              </p>
              {report.target.url && (
                <p className="text-sm">
                  <span className="font-medium">URL:</span>{" "}
                  <a 
                    href={report.target.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {report.target.url}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Report Date */}
          <div className="border-t pt-4">
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Report Date
            </Label>
            <p className="mt-1 text-sm">
              {new Date(report.createdAt).toLocaleString()}
            </p>
          </div>

          {/* Resolution Form */}
          {report.status === "PENDING" && (
            <form onSubmit={handleSubmit} className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="resolution">Resolution *</Label>
                <Select
                  value={resolution}
                  onValueChange={setResolution}
                  disabled={isResolving}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select resolution action" />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {resolutionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="p-3">
                        <div className="space-y-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground leading-relaxed">
                            {option.description}
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Resolution Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this resolution..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isResolving}
                  rows={3}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isResolving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!resolution || isResolving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isResolving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Resolve Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Already Resolved */}
          {report.status !== "PENDING" && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium text-gray-600">Resolution</Label>
              <div className="mt-2 space-y-2">
                {report.resolution && (
                  <p className="text-sm">
                    <span className="font-medium">Action:</span>{" "}
                    <Badge variant="secondary">
                      {resolutionOptions.find(opt => opt.value === report.resolution)?.label || report.resolution}
                    </Badge>
                  </p>
                )}
                {report.resolutionNotes && (
                  <p className="text-sm">
                    <span className="font-medium">Notes:</span> {report.resolutionNotes}
                  </p>
                )}
                {report.resolvedAt && (
                  <p className="text-sm">
                    <span className="font-medium">Resolved:</span>{" "}
                    {new Date(report.resolvedAt).toLocaleString()}
                  </p>
                )}
                {report.resolvedBy && (
                  <p className="text-sm">
                    <span className="font-medium">Resolved by:</span> {report.resolvedBy.displayName}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

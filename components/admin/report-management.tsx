"use client";

import { useState } from "react";
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
import { CheckCircle, Eye, Loader2 } from "lucide-react";
import { useAdminReports } from "@/hooks/use-admin";
import { getStatusBadge } from "./admin-utils";
import { ReviewReportModal } from "./review-report-modal";
import { ContentReport } from "@/lib/types/admin";

export function ReportManagement() {
  const {
    reports,
    isLoading: reportsLoading,
    resolveReport,
  } = useAdminReports();

  const [selectedReport, setSelectedReport] = useState<ContentReport | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);

  const handleQuickResolve = async (
    reportId: string,
    resolution: string,
    notes: string
  ) => {
    try {
      setResolvingReportId(reportId);
      await resolveReport(reportId, resolution, notes);
    } catch (error) {
      console.error("Report action failed:", error);
    } finally {
      setResolvingReportId(null);
    }
  };

  const handleReviewReport = (report: ContentReport) => {
    setSelectedReport(report);
    setIsReviewModalOpen(true);
  };

  const handleResolveFromModal = async (reportId: string, resolution: string, notes: string) => {
    try {
      setResolvingReportId(reportId);
      await resolveReport(reportId, resolution, notes);
    } catch (error) {
      console.error("Report resolution failed:", error);
      throw error; // Re-throw to let modal handle the error
    } finally {
      setResolvingReportId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Reports</CardTitle>
        <CardDescription>Review and resolve user reports</CardDescription>
      </CardHeader>
      <CardContent>
        {reportsLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-center space-x-4"
              >
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
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Reporter</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge variant="outline">{report.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {report.target.title || report.target.id}
                  </TableCell>
                  <TableCell>{report.reporter.displayName}</TableCell>
                  <TableCell>{report.reason}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    {new Date(report.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {report.status === "PENDING" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleQuickResolve(
                              report.id,
                              "NO_ACTION",
                              "No action required"
                            )
                          }
                          disabled={resolvingReportId === report.id}
                        >
                          {resolvingReportId === report.id ? (
                            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          )}
                          Resolve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReviewReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <ReviewReportModal
          isOpen={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          report={selectedReport}
          onResolve={handleResolveFromModal}
          isResolving={resolvingReportId === selectedReport?.id}
        />
      </CardContent>
    </Card>
  );
}

import { Badge } from "@/components/ui/badge";

export const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
    case "PUBLISHED":
      return <Badge variant="default">{status}</Badge>;
    case "SUSPENDED":
    case "FLAGGED":
    case "DEACTIVATED":
      return <Badge variant="destructive">{status}</Badge>;
    case "PENDING":
    case "PENDING_VERIFICATION":
      return <Badge variant="secondary">{status === "PENDING_VERIFICATION" ? "PENDING VERIFICATION" : status}</Badge>;
    case "RESOLVED":
      return <Badge variant="outline">{status}</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

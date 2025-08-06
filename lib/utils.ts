import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to format artwork dimensions
export function formatDimensions(dimensions: any): string {
  if (!dimensions) return "";

  if (typeof dimensions === "string") {
    return dimensions;
  }

  if (typeof dimensions === "object" && dimensions.width && dimensions.height) {
    const { width, height, unit = "inches" } = dimensions;
    return `${width} × ${height} ${unit}`;
  }

  return "";
}

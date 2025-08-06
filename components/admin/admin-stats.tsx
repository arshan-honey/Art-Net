"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, ImageIcon, Flag } from "lucide-react";
import { useAdminStats } from "@/hooks/use-admin";

export function AdminStats() {
  const { stats, isLoading: statsLoading } = useAdminStats();

  if (statsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statsData = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: `+${stats.monthlyGrowth.users}`,
    },
    {
      label: "Total Artworks",
      value: stats.totalArtworks.toLocaleString(),
      icon: ImageIcon,
      change: `+${stats.monthlyGrowth.artworks}`,
    },
    {
      label: "Pending Reports",
      value: stats.pendingReports.toString(),
      icon: Flag,
      change: stats.pendingReports > 10 ? "High" : "Normal",
    },
    {
      label: "Active Artists",
      value: stats.totalArtists.toLocaleString(),
      icon: Users,
      change: `+${stats.monthlyGrowth.artists}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="flex flex-col items-end">
                <stat.icon className="h-8 w-8 text-primary mb-2" />
                <span
                  className={`text-sm font-medium ${
                    stat.change.includes("+")
                      ? "text-green-600"
                      : stat.change === "High"
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

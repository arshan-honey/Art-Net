"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AdminSettings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Platform Settings</CardTitle>
          <CardDescription>Configure platform-wide settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">User Registration</p>
              <p className="text-sm text-gray-600">
                Allow new user registrations
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enabled
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Content Moderation</p>
              <p className="text-sm text-gray-600">
                Auto-moderate uploaded content
              </p>
            </div>
            <Button variant="outline" size="sm">
              Enabled
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Featured Content</p>
              <p className="text-sm text-gray-600">
                Automatically feature popular content
              </p>
            </div>
            <Button variant="outline" size="sm">
              Disabled
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Monitor system health and performance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Database</span>
            <Badge variant="default">Healthy</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>File Storage</span>
            <Badge variant="default">Healthy</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>Email Service</span>
            <Badge variant="default">Healthy</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>CDN</span>
            <Badge variant="secondary">Degraded</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

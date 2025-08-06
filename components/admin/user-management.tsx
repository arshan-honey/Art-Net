"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserStatus } from "@prisma/client";
import { useAuth } from "@/components/auth-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Ban,
  CheckCircle,
  Search,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useAdminUsers } from "@/hooks/use-admin";
import { getStatusBadge } from "./admin-utils";

// UserStatus options for the select dropdown
const USER_STATUS_OPTIONS = [
  { value: "ACTIVE" as const, label: "Active" },
  { value: "SUSPENDED" as const, label: "Suspended" },
  { value: "PENDING_VERIFICATION" as const, label: "Pending Verification" },
  { value: "DEACTIVATED" as const, label: "Deactivated" },
] as const;

export function UserManagement() {
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [suspendingUserId, setSuspendingUserId] = useState<string | null>(null);
  const {
    users,
    total: totalUsers,
    isLoading: usersLoading,
    fetchUsers,
    updateUserStatus,
    deleteUser,
    updateUser,
  } = useAdminUsers();

  const handleUserAction = async (
    userId: string,
    action: string,
    reason?: string
  ) => {
    try {
      switch (action) {
        case "suspend":
          setSuspendingUserId(userId);
          await updateUserStatus(userId, UserStatus.SUSPENDED, reason);
          break;
        case "activate":
          setSuspendingUserId(userId);
          await updateUserStatus(userId, UserStatus.ACTIVE, reason);
          break;
        case "delete":
          setDeletingUserId(userId);
          await deleteUser(userId, reason);
          break;
      }
    } catch (error) {
      console.error("User action failed:", error);
    } finally {
      setDeletingUserId(null);
      setSuspendingUserId(null);
    }
  };

  const handleViewProfile = (user: any) => {
    // Navigate to user profile page
    if (user.role === "ARTIST") {
      router.push(`/artist/${user.username}`);
    } else {
      // For non-artists, you might want to create a general profile view
      // or redirect to a different page
      window.open(`/profile/${user.username}`, "_blank");
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditDialogOpen(true);
  };

  const saveUserEdit = async () => {
    if (!selectedUser) return;

    try {
      setIsSaving(true);
      await updateUser(selectedUser.id, {
        displayName: selectedUser.displayName,
        email: selectedUser.email,
        role: selectedUser.role,
        status: selectedUser.status,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to update user:", error);
      // Error is already handled by the hook with toast notification
    } finally {
      setIsSaving(false);
    }
  };

  // Filter out the current admin user from the users list
  const filteredUsers = users.filter((user) => user.id !== currentUser?.id);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user accounts and permissions ({filteredUsers.length}{" "}
              users)
            </CardDescription>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  fetchUsers({ search: e.target.value });
                }}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {usersLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse flex items-center space-x-4"
              >
                <div className="rounded-full bg-gray-200 h-10 w-10"></div>
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Artworks</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {user.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.displayName}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(user.status)}</TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{user.artworksCount}</TableCell>
                  <TableCell>{user.followersCount}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {user.role === "ARTIST" && (
                          <DropdownMenuItem
                            onClick={() => handleViewProfile(user)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Profile
                            <ExternalLink className="h-3 w-3 ml-auto" />
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit User
                        </DropdownMenuItem>
                        {user.status === UserStatus.ACTIVE ? (
                          <DropdownMenuItem
                            className="text-orange-600"
                            onClick={() =>
                              handleUserAction(
                                user.id,
                                "suspend",
                                "Admin action"
                              )
                            }
                            disabled={suspendingUserId === user.id}
                          >
                            {suspendingUserId === user.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Ban className="h-4 w-4 mr-2" />
                            )}
                            Suspend
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="text-green-600"
                            onClick={() =>
                              handleUserAction(
                                user.id,
                                "activate",
                                "Admin action"
                              )
                            }
                            disabled={suspendingUserId === user.id}
                          >
                            {suspendingUserId === user.id ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <CheckCircle className="h-4 w-4 mr-2" />
                            )}
                            Activate
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() =>
                            handleUserAction(
                              user.id,
                              "delete",
                              "Admin deletion"
                            )
                          }
                          disabled={deletingUserId === user.id}
                        >
                          {deletingUserId === user.id ? (
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

      {/* Edit User Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => !isSaving && setIsEditDialogOpen(open)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and settings.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <Input
                  value={selectedUser.displayName}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      displayName: e.target.value,
                    })
                  }
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      email: e.target.value,
                    })
                  }
                  disabled={isSaving}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input
                    value={selectedUser.firstName || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        firstName: e.target.value,
                      })
                    }
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input
                    value={selectedUser.lastName || ""}
                    onChange={(e) =>
                      setSelectedUser({
                        ...selectedUser,
                        lastName: e.target.value,
                      })
                    }
                    disabled={isSaving}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedUser.role}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      role: e.target.value,
                    })
                  }
                  disabled={isSaving}
                >
                  <option value="VISITOR">Visitor</option>
                  <option value="ENTHUSIAST">Enthusiast</option>
                  <option value="ARTIST">Artist</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedUser.status}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      status: e.target.value as UserStatus,
                    })
                  }
                  disabled={isSaving}
                >
                  {USER_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button onClick={saveUserEdit} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

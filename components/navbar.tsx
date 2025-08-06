"use client";

import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  User,
  Settings,
  LogOut,
  Palette,
  Heart,
  Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <Palette className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">Art Portfolio Hub</span>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/browse"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Browse
              </Link>
              <Link
                href="/artists"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Artists
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-primary transition-colors"
              >
                Categories
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input placeholder="Search artworks..." className="pl-10 w-64" />
            </div>

            {user ? (
              <div className="flex items-center space-x-2">
                {user.role === "ARTIST" && (
                  <Button asChild variant="outline" size="sm">
                    <Link href="/artist/upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Link>
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.avatar || "/placeholder.svg"}
                          alt={user?.name}
                        />
                        <AvatarFallback>
                          {user?.firstName?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "user" && (
                      <DropdownMenuItem asChild>
                        <Link href="/collections">
                          <Heart className="mr-2 h-4 w-4" />
                          Collections
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === "ARTIST" && (
                      <DropdownMenuItem asChild>
                        <Link href="/artist/dashboard">
                          <Palette className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {user.role === "ADMIN" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

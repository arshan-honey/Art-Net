"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"ENTHUSIAST" | "ARTIST">("ENTHUSIAST");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Add new state for artist data
  const [artistStatement, setArtistStatement] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [acceptCommissions, setAcceptCommissions] = useState(false);

  const { register, error: authError } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Update the handleSubmit function
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    // Validate account type
    if (!role || (role !== "ENTHUSIAST" && role !== "ARTIST")) {
      setError("Please select a valid account type");
      setIsLoading(false);
      return;
    }

    // Additional validation for artist accounts
    if (role === "ARTIST") {
      if (!name.trim()) {
        setError("Artist name is required");
        setIsLoading(false);
        return;
      }
      if (artistStatement.trim().length > 500) {
        setError("Artist statement must be less than 500 characters");
        setIsLoading(false);
        return;
      }
    }

    try {
      const registrationData = {
        email,
        username: email.split("@")[0], // Generate username from email
        password,
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" ") || undefined,
        role,
        ...(role === "ARTIST" && {
          artistData: {
            artistStatement: artistStatement || undefined,
            specialties: specialties.length > 0 ? specialties : undefined,
            acceptCommissions,
          },
        }),
      };

      const success = await register(registrationData);
      if (success) {
        toast({
          title: "Account created!",
          description: "Welcome to Art Portfolio Hub.",
        });
        router.push("/");
      } else {
        setError(authError || "Failed to create account. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Palette className="h-8 w-8 text-primary" />
            <span className="font-bold text-2xl">Art Portfolio Hub</span>
          </Link>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Create an account
            </CardTitle>
            <CardDescription className="text-center">
              Join our community of artists and art enthusiasts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>Account Type</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) =>
                    setRole(value as "ENTHUSIAST" | "ARTIST")
                  }
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ENTHUSIAST" id="user" />
                    <Label htmlFor="user" className="cursor-pointer">
                      Art Enthusiast - Browse and collect artworks
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ARTIST" id="artist" />
                    <Label htmlFor="artist" className="cursor-pointer">
                      Artist - Share and showcase your artworks
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {role === "ARTIST" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="artistStatement">
                      Artist Statement (Optional)
                    </Label>
                    <Textarea
                      id="artistStatement"
                      placeholder="Tell us about your artistic vision and style..."
                      value={artistStatement}
                      onChange={(e) => setArtistStatement(e.target.value)}
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500">
                      {artistStatement.length}/500 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialties">Specialties (Optional)</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        "Digital Art",
                        "Photography",
                        "Painting",
                        "Sculpture",
                        "Mixed Media",
                        "Illustration",
                      ].map((specialty) => (
                        <div
                          key={specialty}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={specialty}
                            checked={specialties.includes(specialty)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSpecialties([...specialties, specialty]);
                              } else {
                                setSpecialties(
                                  specialties.filter((s) => s !== specialty)
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={specialty}
                            className="cursor-pointer text-sm"
                          >
                            {specialty}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="acceptCommissions"
                      checked={acceptCommissions}
                      onCheckedChange={(checked) =>
                        setAcceptCommissions(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="acceptCommissions"
                      className="cursor-pointer"
                    >
                      I accept commission work
                    </Label>
                  </div>
                </>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

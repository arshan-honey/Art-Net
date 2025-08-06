import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  role: "VISITOR" | "ENTHUSIAST" | "ARTIST" | "ADMIN";
  avatar?: string;
  isVerified: boolean;
  artistProfile?: {
    id: string;
    artistStatement?: string;
    specialties: string[];
    isPublic: boolean;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: "ENTHUSIAST" | "ARTIST";
  artistData?: {
    artistStatement?: string;
    specialties?: string[];
    acceptCommissions?: boolean;
  };
}

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  private static JWT_EXPIRES_IN = "7d";

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  static verifyToken(token: string): { userId: string } | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as { userId: string };
    } catch {
      return null;
    }
  }

  static async getUserById(id: string): Promise<AuthUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          artistProfile: {
            select: {
              id: true,
              artistStatement: true,
              specialties: true,
              isPublic: true,
            },
          },
        },
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        displayName: user.displayName || undefined,
        role: user.role,
        avatar: user.avatar || undefined,
        isVerified: user.isVerified,
        artistProfile: user.artistProfile || undefined,
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  static async login(
    credentials: LoginCredentials
  ): Promise<{ user: AuthUser; token: string } | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
        include: {
          artistProfile: {
            select: {
              id: true,
              artistStatement: true,
              specialties: true,
              isPublic: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error("Invalid credentials");
      }

      const isValidPassword = await this.comparePassword(
        credentials.password,
        user.password
      );
      if (!isValidPassword) {
        throw new Error("Invalid credentials");
      }

      if (user.status !== "ACTIVE") {
        throw new Error("Account is not active");
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Create login history record
      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          // Note: In a real app, you'd get these from the request
          ipAddress: "unknown",
          userAgent: "unknown",
        },
      });

      const token = this.generateToken(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          displayName: user.displayName || undefined,
          role: user.role,
          avatar: user.avatar || undefined,
          isVerified: user.isVerified,
          artistProfile: user.artistProfile || undefined,
        },
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      return null;
    }
  }

  static async signup(
    data: SignupData
  ): Promise<{ user: AuthUser; token: string } | null> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: data.email }, { username: data.username }],
        },
      });

      if (existingUser) {
        throw new Error("User already exists with this email or username");
      }

      const hashedPassword = await this.hashPassword(data.password);

      // Create user with transaction to ensure atomicity
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email,
            username: data.username,
            password: hashedPassword,
            firstName: data.firstName,
            lastName: data.lastName,
            displayName:
              data.firstName && data.lastName
                ? `${data.firstName} ${data.lastName}`
                : data.username,
            role: data.role,
            status: "ACTIVE",
          },
        });

        // Create artist profile if role is ARTIST
        let artistProfile = null;
        if (data.role === "ARTIST" && data.artistData) {
          artistProfile = await tx.artistProfile.create({
            data: {
              userId: user.id,
              artistStatement: data.artistData.artistStatement,
              specialties: data.artistData.specialties || [],
              acceptCommissions: data.artistData.acceptCommissions || false,
              isPublic: true,
            },
          });
        }

        return { user, artistProfile };
      });

      const token = this.generateToken(result.user.id);

      return {
        user: {
          id: result.user.id,
          email: result.user.email,
          username: result.user.username,
          firstName: result.user.firstName || undefined,
          lastName: result.user.lastName || undefined,
          displayName: result.user.displayName || undefined,
          role: result.user.role,
          avatar: result.user.avatar || undefined,
          isVerified: result.user.isVerified,
          artistProfile: result.artistProfile
            ? {
                id: result.artistProfile.id,
                artistStatement:
                  result.artistProfile.artistStatement || undefined,
                specialties: result.artistProfile.specialties,
                isPublic: result.artistProfile.isPublic,
              }
            : undefined,
        },
        token,
      };
    } catch (error) {
      console.error("Signup error:", error);
      return null;
    }
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const cookieStore = cookies();
      const token = cookieStore.get("auth-token")?.value;

      if (!token) return null;

      const decoded = this.verifyToken(token);
      if (!decoded) return null;

      return this.getUserById(decoded.userId);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  static async logout(): Promise<void> {
    const cookieStore = cookies();
    cookieStore.delete("auth-token");
  }
}

// Helper function to verify token from NextRequest and return user
export async function verifyToken(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("authorization");
    let token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    // If no Authorization header, try to get token from cookies
    if (!token) {
      token = request.cookies.get("auth-token")?.value || null;
    }

    if (!token) return null;

    const decoded = AuthService.verifyToken(token);
    if (!decoded) return null;

    const user = await AuthService.getUserById(decoded.userId);
    return user;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

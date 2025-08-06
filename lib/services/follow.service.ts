import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface FollowData {
  followerId: string;
  followingId: string;
}

export interface FollowResponse {
  isFollowing: boolean;
  totalFollowers: number;
}

export class FollowService {
  static async toggleFollow(data: FollowData): Promise<FollowResponse> {
    try {
      // Verify both users exist
      const follower = await prisma.user.findUnique({
        where: { id: data.followerId },
        select: { id: true },
      });

      const following = await prisma.user.findUnique({
        where: { id: data.followingId },
        select: { id: true },
      });

      if (!follower) {
        throw new Error("Follower user not found");
      }

      if (!following) {
        throw new Error("User to follow not found");
      }

      // Prevent self-following
      if (data.followerId === data.followingId) {
        throw new Error("Cannot follow yourself");
      }

      // Check if follow relationship already exists
      const existingFollow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: data.followerId,
            followingId: data.followingId,
          },
        },
      });

      let isFollowing: boolean;

      if (existingFollow) {
        // Unfollow: Remove the follow relationship
        await prisma.follow.delete({
          where: {
            id: existingFollow.id,
          },
        });
        isFollowing = false;
      } else {
        // Follow: Create new follow relationship
        await prisma.follow.create({
          data: {
            followerId: data.followerId,
            followingId: data.followingId,
          },
        });
        isFollowing = true;
      }

      // Get updated follower count
      const totalFollowers = await prisma.follow.count({
        where: {
          followingId: data.followingId,
        },
      });

      return {
        isFollowing,
        totalFollowers,
      };
    } catch (error) {
      console.error("Error toggling follow:", error);
      throw error;
    }
  }

  static async getFollowStatus(
    followerId: string,
    followingId: string
  ): Promise<boolean> {
    try {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });

      return !!follow;
    } catch (error) {
      console.error("Error getting follow status:", error);
      throw error;
    }
  }

  static async getFollowers(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{
    followers: Array<{
      id: string;
      username: string;
      displayName: string | null;
      firstName: string | null;
      lastName: string | null;
      avatar: string | null;
      isVerified: boolean;
      followedAt: Date;
    }>;
    total: number;
  }> {
    try {
      const follows = await prisma.follow.findMany({
        where: {
          followingId: userId,
        },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              displayName: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isVerified: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });

      const total = await prisma.follow.count({
        where: {
          followingId: userId,
        },
      });

      return {
        followers: follows.map((follow) => ({
          ...follow.follower,
          followedAt: follow.createdAt,
        })),
        total,
      };
    } catch (error) {
      console.error("Error getting followers:", error);
      throw error;
    }
  }

  static async getFollowing(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<{
    following: Array<{
      id: string;
      username: string;
      displayName: string | null;
      firstName: string | null;
      lastName: string | null;
      avatar: string | null;
      isVerified: boolean;
      followedAt: Date;
    }>;
    total: number;
  }> {
    try {
      const follows = await prisma.follow.findMany({
        where: {
          followerId: userId,
        },
        include: {
          following: {
            select: {
              id: true,
              username: true,
              displayName: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isVerified: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
        skip: offset,
      });

      const total = await prisma.follow.count({
        where: {
          followerId: userId,
        },
      });

      return {
        following: follows.map((follow) => ({
          ...follow.following,
          followedAt: follow.createdAt,
        })),
        total,
      };
    } catch (error) {
      console.error("Error getting following:", error);
      throw error;
    }
  }

  static async getFollowCounts(userId: string): Promise<{
    followersCount: number;
    followingCount: number;
  }> {
    try {
      const [followersCount, followingCount] = await Promise.all([
        prisma.follow.count({
          where: { followingId: userId },
        }),
        prisma.follow.count({
          where: { followerId: userId },
        }),
      ]);

      return {
        followersCount,
        followingCount,
      };
    } catch (error) {
      console.error("Error getting follow counts:", error);
      throw error;
    }
  }
}

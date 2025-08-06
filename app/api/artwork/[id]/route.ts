import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "Artwork ID is required" },
        { status: 400 }
      );
    }

    // Check if user is authenticated to get like status
    const user = await verifyToken(request);

    const artwork = await prisma.artwork.findUnique({
      where: { id },
      include: {
        artist: {
          include: {
            artistProfile: true,
            followers: true,
            _count: {
              select: {
                followers: true,
              },
            },
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
        categories: {
          include: {
            category: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        comments: {
          where: { parentId: null },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
            replies: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    displayName: true,
                    firstName: true,
                    lastName: true,
                    avatar: true,
                  },
                },
              },
              orderBy: { createdAt: "asc" },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    // Check if artwork is public or published
    if (artwork.status !== "PUBLISHED" && !artwork.isPublic) {
      return NextResponse.json(
        { error: "Artwork not available" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.artwork.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    // Get related artworks from the same artist
    const relatedArtworks = await prisma.artwork.findMany({
      where: {
        artistId: artwork.artistId,
        id: { not: id },
        status: "PUBLISHED",
        isPublic: true,
      },
      include: {
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: { views: "desc" },
      take: 4,
    });

    // Check if current user has liked this artwork and is following the artist
    let isLiked = false;
    let isFollowingArtist = false;

    if (user) {
      const [userLike, userFollow] = await Promise.all([
        prisma.like.findUnique({
          where: {
            userId_artworkId: {
              userId: user.id,
              artworkId: id,
            },
          },
        }),
        prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: artwork.artistId,
            },
          },
        }),
      ]);

      isLiked = !!userLike;
      isFollowingArtist = !!userFollow;
    }

    // Format the response
    const formattedArtwork = {
      id: artwork.id,
      title: artwork.title,
      description: artwork.description,
      primaryImage: artwork.primaryImage,
      images: artwork.images.map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        caption: img.caption,
      })),
      artist: {
        id: artwork.artist.id,
        name:
          artwork.artist.displayName ||
          `${artwork.artist.firstName} ${artwork.artist.lastName}`.trim() ||
          artwork.artist.username,
        username: artwork.artist.username,
        avatar: artwork.artist.avatar,
        bio: artwork.artist.bio,
        verified: artwork.artist.isVerified,
        followers: artwork.artist._count.followers,
        specialties: artwork.artist.artistProfile?.specialties || [],
        isFollowing: isFollowingArtist,
      },
      category: artwork.categories[0]?.category.name || "Uncategorized",
      tags: artwork.tags.map((tag) => tag.tag.name),
      views: artwork.views + 1, // Include the incremented view
      likes: artwork._count.likes,
      comments: artwork._count.comments,
      isLiked: isLiked,
      isForSale: artwork.isForSale,
      price: artwork.price ? Number(artwork.price) : null,
      currency: artwork.currency,
      licenseType: artwork.licenseType,
      dimensions: artwork.dimensions,
      medium: artwork.medium,
      yearCreated: artwork.yearCreated,
      createdAt: artwork.createdAt,
      publishedAt: artwork.publishedAt,
      formattedComments: artwork.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        user: {
          id: comment.user.id,
          name:
            comment.user.displayName ||
            `${comment.user.firstName} ${comment.user.lastName}`.trim() ||
            comment.user.username,
          username: comment.user.username,
          avatar: comment.user.avatar,
        },
        replies: comment.replies.map((reply) => ({
          id: reply.id,
          content: reply.content,
          createdAt: reply.createdAt,
          user: {
            id: reply.user.id,
            name:
              reply.user.displayName ||
              `${reply.user.firstName} ${reply.user.lastName}`.trim() ||
              reply.user.username,
            username: reply.user.username,
            avatar: reply.user.avatar,
          },
        })),
      })),
      relatedArtworks: relatedArtworks.map((related) => ({
        id: related.id,
        title: related.title,
        primaryImage: related.primaryImage,
        likes: related._count.likes,
      })),
    };

    return NextResponse.json(formattedArtwork);
  } catch (error) {
    console.error("Error fetching artwork:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

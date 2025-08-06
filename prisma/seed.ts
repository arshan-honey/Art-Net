import {
  PrismaClient,
  UserRole,
  ArtworkStatus,
  CollectionVisibility,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Painting",
        slug: "painting",
        description: "Traditional and digital paintings",
        image: "/placeholder.svg?height=200&width=300",
      },
    }),
    prisma.category.create({
      data: {
        name: "Photography",
        slug: "photography",
        description: "Digital and film photography",
        image: "/placeholder.svg?height=200&width=300",
      },
    }),
    prisma.category.create({
      data: {
        name: "Digital Art",
        slug: "digital-art",
        description: "Computer-generated artwork",
        image: "/placeholder.svg?height=200&width=300",
      },
    }),
    prisma.category.create({
      data: {
        name: "Sculpture",
        slug: "sculpture",
        description: "3D artwork and installations",
        image: "/placeholder.svg?height=200&width=300",
      },
    }),
  ]);

  // Create tags
  const tags = await Promise.all([
    prisma.tag.create({
      data: { name: "Abstract", slug: "abstract", color: "#FF6B6B" },
    }),
    prisma.tag.create({
      data: { name: "Portrait", slug: "portrait", color: "#4ECDC4" },
    }),
    prisma.tag.create({
      data: { name: "Landscape", slug: "landscape", color: "#45B7D1" },
    }),
    prisma.tag.create({
      data: { name: "Contemporary", slug: "contemporary", color: "#96CEB4" },
    }),
    prisma.tag.create({
      data: { name: "Minimalist", slug: "minimalist", color: "#FFEAA7" },
    }),
  ]);

  // Create admin user
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@artportfolio.com",
      username: "admin",
      firstName: "Art",
      lastName: "Administrator",
      displayName: "Art Admin",
      role: UserRole.ADMIN,
      isVerified: true,
      bio: "Platform administrator managing the Art Net.",
      avatar: "/placeholder-user.jpg",
    },
  });

  // Create sample artists
  const artist1 = await prisma.user.create({
    data: {
      email: "sarah.artist@example.com",
      username: "sarah_creates",
      firstName: "Sarah",
      lastName: "Johnson",
      displayName: "Sarah Johnson",
      role: UserRole.ARTIST,
      isVerified: true,
      bio: "Contemporary artist specializing in abstract paintings and digital art.",
      avatar: "/placeholder-user.jpg",
      location: "New York, NY",
      website: "https://sarahjohnson.art",
      artistProfile: {
        create: {
          artistStatement:
            "My work explores the intersection of emotion and color, creating pieces that speak to the human experience.",
          specialties: ["Abstract Painting", "Digital Art", "Mixed Media"],
          experience: "8 years",
          education: "MFA from Parsons School of Design",
          isPublic: true,
          acceptCommissions: true,
          commissionInfo:
            "Available for custom abstract paintings and digital artwork.",
        },
      },
    },
  });

  const artist2 = await prisma.user.create({
    data: {
      email: "mike.photographer@example.com",
      username: "mike_lens",
      firstName: "Mike",
      lastName: "Chen",
      displayName: "Mike Chen",
      role: UserRole.ARTIST,
      isVerified: true,
      bio: "Professional photographer capturing urban landscapes and street photography.",
      avatar: "/placeholder-user.jpg",
      location: "San Francisco, CA",
      artistProfile: {
        create: {
          artistStatement:
            "Through my lens, I capture the raw beauty of urban life and the stories hidden in city streets.",
          specialties: [
            "Street Photography",
            "Urban Landscapes",
            "Portrait Photography",
          ],
          experience: "12 years",
          isPublic: true,
          acceptCommissions: true,
        },
      },
    },
  });

  // Create sample enthusiasts
  const enthusiast1 = await prisma.user.create({
    data: {
      email: "emma.collector@example.com",
      username: "emma_art_lover",
      firstName: "Emma",
      lastName: "Wilson",
      displayName: "Emma Wilson",
      role: UserRole.ENTHUSIAST,
      bio: "Art enthusiast and collector with a passion for contemporary works.",
      avatar: "/placeholder-user.jpg",
    },
  });

  // Create sample artworks
  const artwork1 = await prisma.artwork.create({
    data: {
      title: "Urban Sunset",
      slug: "urban-sunset",
      description:
        "A vibrant abstract representation of city life at dusk, blending warm oranges and cool blues.",
      artistId: artist1.id,
      primaryImage: "/placeholder.jpg",
      medium: "Acrylic on Canvas",
      yearCreated: 2023,
      dimensions: { width: 36, height: 24, unit: "inches" },
      status: ArtworkStatus.PUBLISHED,
      isForSale: true,
      price: 1200.0,
      currency: "USD",
      views: 245,
      categories: {
        create: [
          { categoryId: categories[0].id }, // Painting
        ],
      },
      tags: {
        create: [
          { tagId: tags[0].id }, // Abstract
          { tagId: tags[3].id }, // Contemporary
        ],
      },
    },
  });

  const artwork2 = await prisma.artwork.create({
    data: {
      title: "Street Stories",
      slug: "street-stories",
      description:
        "A candid moment captured on the bustling streets of downtown, showcasing human connection.",
      artistId: artist2.id,
      primaryImage: "/placeholder.jpg",
      medium: "Digital Photography",
      yearCreated: 2023,
      status: ArtworkStatus.PUBLISHED,
      isForSale: true,
      price: 350.0,
      currency: "USD",
      views: 189,
      categories: {
        create: [
          { categoryId: categories[1].id }, // Photography
        ],
      },
      tags: {
        create: [
          { tagId: tags[1].id }, // Portrait
          { tagId: tags[3].id }, // Contemporary
        ],
      },
    },
  });

  // Create sample collections
  const collection1 = await prisma.collection.create({
    data: {
      name: "Modern Abstracts",
      slug: "modern-abstracts",
      description:
        "A curated collection of contemporary abstract artworks that push creative boundaries.",
      userId: enthusiast1.id,
      visibility: CollectionVisibility.PUBLIC,
      coverImage: "/placeholder.jpg",
      artworks: {
        create: [{ artworkId: artwork1.id, sortOrder: 1 }],
      },
      tags: {
        create: [
          { tagId: tags[0].id }, // Abstract
          { tagId: tags[3].id }, // Contemporary
        ],
      },
    },
  });

  // Create some interactions
  await prisma.like.create({
    data: {
      userId: enthusiast1.id,
      artworkId: artwork1.id,
    },
  });

  await prisma.follow.create({
    data: {
      followerId: enthusiast1.id,
      followingId: artist1.id,
    },
  });

  await prisma.comment.create({
    data: {
      content: "Beautiful work! The color composition is absolutely stunning.",
      userId: enthusiast1.id,
      artworkId: artwork1.id,
    },
  });

  // Create system settings
  await prisma.systemSetting.createMany({
    data: [
      { key: "site_name", value: "Art Net" },
      {
        key: "site_description",
        value:
          "Discover and showcase amazing artwork from talented artists worldwide.",
      },
      { key: "max_upload_size", value: "10485760" }, // 10MB in bytes
      { key: "featured_artists_count", value: "6" },
      { key: "maintenance_mode", value: "false" },
    ],
  });

  console.log("✅ Database seeded successfully!");
  console.log("\n📊 Created:");
  console.log(`- ${categories.length} categories`);
  console.log(`- ${tags.length} tags`);
  console.log("- 1 admin user");
  console.log("- 2 artists with profiles");
  console.log("- 1 enthusiast");
  console.log("- 2 artworks");
  console.log("- 1 collection");
  console.log("- Sample interactions (likes, follows, comments)");
  console.log("- System settings");

  console.log("\n🔐 Demo Credentials:");
  console.log("Admin: admin@artportfolio.com");
  console.log("Artist 1: sarah.artist@example.com");
  console.log("Artist 2: mike.photographer@example.com");
  console.log("Enthusiast: emma.collector@example.com");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

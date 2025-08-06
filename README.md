# Art Portfolio Hub

A comprehensive web platform for artists to showcase their work and build professional portfolios, while providing art enthusiasts with a curated space to discover and engage with creative content.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/abubakarraza64gmailcoms-projects/v0-art-portfolio-hub)

## 🎨 Features

- **Artist Portfolios**: Professional portfolio management with customizable profiles
- **Artwork Management**: Upload, categorize, and showcase artwork with detailed metadata
- **Social Features**: Like, comment, follow artists, and create collections
- **Admin Dashboard**: Comprehensive platform management and content moderation
- **Search & Discovery**: Advanced filtering and categorization system
- **Responsive Design**: Mobile-first design with modern UI components

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Node.js, Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **File Storage**: Cloudinary
- **Deployment**: Vercel

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (recommended) or npm
- **PostgreSQL** database
- **Git**

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/art-portfolio-hub.git
cd art-portfolio-hub
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory and add the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/art_portfolio_hub"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
NEXTAUTH_SECRET="your-nextauth-secret"

# Cloudinary (for image storage)
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Push database schema
pnpm db:push

# Seed database with sample data
pnpm db:seed
```

### 5. Run the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## 🗄️ Database Management

### View Database with Prisma Studio

```bash
npx prisma studio
```

This opens a visual database browser at [http://localhost:5555](http://localhost:5555)

### Reset Database (Development Only)

```bash
npx prisma migrate reset
```

## 🌐 Live Demo

**🔗 Application URL**: [Art Portfolio Hub Demo](https://vercel.com/abubakarraza64gmailcoms-projects/v0-art-portfolio-hub)

### Demo Credentials

Test the application with these pre-configured accounts:

| User Type  | Email                          | Password         | Features                    |
| ---------- | ------------------------------ | ---------------- | --------------------------- |
| **Admin**  | `admin@artportfolio.com`       | `AdminDemo123!`  | Full platform management    |
| **Artist** | `demo.artist@artportfolio.com` | `DemoArtist123!` | Portfolio & upload features |
| **User**   | `demo.user@artportfolio.com`   | `DemoUser123!`   | Browse & social features    |

## 📁 Project Structure

```
art-portfolio-hub/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── artist/            # Artist pages
│   ├── browse/            # Browse artworks
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── admin/            # Admin-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding
├── public/               # Static assets
└── styles/               # Additional stylesheets
```

## 🛠️ Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:seed          # Seed database with sample data

# Utilities
pnpm type-check       # Run TypeScript checks
```

## 🔧 Configuration

### Cloudinary Setup

1. Create a [Cloudinary account](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret
3. Add them to your `.env.local` file
4. Configure upload presets in your Cloudinary dashboard

### Database Configuration

1. Set up a PostgreSQL database (local or cloud)
2. Update the `DATABASE_URL` in your `.env.local`
3. Run database migrations

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Set environment variables in Vercel dashboard
4. Deploy automatically on every push

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform:

- `DATABASE_URL`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_APP_URL`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Deployed on [Vercel](https://vercel.com)
- UI components by [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

If you have any questions or need help, please open an issue or contact the development team.

---

**Happy coding! 🎨✨**

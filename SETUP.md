# Art Portfolio Hub - Setup Guide

Quick start guide to get the Art Portfolio Hub running on your local machine.

## 📋 System Requirements

### Required Software

- **Node.js** v18.0.0 or higher
- **pnpm** v8.0.0 or higher (recommended) or npm v9.0.0+

### Hardware Requirements

- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: At least 1GB free space
- **Network**: Internet connection for dependencies

## 🚀 Quick Start

### 1. Extract Project Folder

```bash
# Extract the provided project folder
# Navigate to the project directory
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

The project comes with a pre-configured `.env` file that includes all necessary environment variables for development. No additional setup required!

### 4. Generate Prisma Client

```bash
# Generate Prisma client (required)
npx prisma generate
```

### 5. Start Development Server

```bash
pnpm dev
```

**Application will be available at:** [http://localhost:3000](http://localhost:3000)

## ✅ What's Pre-Configured

- ✅ **Database**: Already set up and configured
- ✅ **Environment Variables**: Pre-configured in `.env` file
- ✅ **Cloudinary**: Image storage already configured
- ✅ **Sample Data**: Database already seeded with demo content
- ✅ **Authentication**: JWT tokens and security configured

## � Optional: Advanced Setup

### Database Management

If you need to manage the database:

```bash
# View database in browser
npx prisma studio
```

Opens visual database browser at: [http://localhost:5555](http://localhost:5555)

### Development Commands

```bash
# Development
pnpm dev                 # Start dev server
pnpm build              # Build for production
pnpm start              # Start production server
pnpm lint               # Run ESLint

# Database (if needed)
pnpm db:generate        # Generate Prisma client
pnpm db:push            # Push schema changes
pnpm db:seed            # Seed database
```

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
pnpm dev -- -p 3001
```

#### Missing Dependencies

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## 🎯 Testing the Setup

### 1. Access Application

- Open [http://localhost:3000](http://localhost:3000)
- You should see the homepage with featured artworks

### 2. Test Login with Demo Accounts

Use the provided demo accounts to test different user roles

### 3. Test Features

- **Admin**: Access admin dashboard, manage users and content
- **Artist**: Upload artworks, manage portfolio
- **User**: Browse artworks, create collections, follow artists

## 🔐 Demo Accounts

Test the application with these pre-configured accounts:

| Role   | Email                  | Password  |
| ------ | ---------------------- | --------- |
| Admin  | fybubab@mailinator.com | 12345678  |
| Artist | serup@mailinator.com   | Pa$$w0rd! |
| User   | wyref@mailinator.com   | Pa$$w0rd! |

## 💡 Tips

- **Use pnpm**: Faster and more efficient than npm
- **Keep environment files secure**: Never share or commit `.env` files
- **Database browser**: Use `npx prisma studio` to explore data
- **Port conflicts**: Use `-p` flag to run on different port if needed

## 📞 Need Help?

- **Installation Issues**: Ensure Node.js v18+ is installed
- **Port Conflicts**: Use different port with `-p` flag
- **Build Errors**: Clear node_modules and reinstall dependencies

---

**Setup Time**: ~5 minutes  
**First Run**: ~1-2 minutes after dependencies install

Ready to explore! 🎨✨

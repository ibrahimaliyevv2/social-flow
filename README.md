# Social Flow

A social media platform built with Next.js, featuring user authentication, posts, likes, comments, and user profiles.

## Features

- **User Authentication**: Secure sign-in and sign-up using Clerk
- **Post Creation**: Create text posts with optional image uploads
- **Social Interactions**: Like and comment on posts
- **User Profiles**: View and edit personal profiles with bio, location, and website
- **Follow System**: Follow and unfollow other users
- **Notifications**: Real-time notifications for likes, comments, and follows
- **Responsive Design**: Mobile-friendly interface with dark/light mode support
- **Image Uploads**: Upload and display images using UploadThing

## Tech Stack

### Frontend
- **Next.js 16** - React framework for production
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn UI** - Accessible UI components
- **Lucide React** - Beautiful icons

### Backend & Database
- **Prisma** - Database ORM
- **PostgreSQL via Neon** - Relational database
- **Clerk** - Authentication and user management

### Additional Libraries
- **UploadThing** - File upload service
- **React Hot Toast** - Toast notifications
- **Date-fns** - Date formatting
- **Next Themes** - Theme management

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database (I used Neon provider)
- Clerk account for authentication
- UploadThing account for file uploads

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd social-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the following variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/social_app"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

### For Users
1. **Sign Up/Sign In**: Create an account or sign in using Clerk authentication
2. **Create Posts**: Share your thoughts with text and optional images
3. **Interact**: Like and comment on posts from other users
4. **Follow Users**: Follow interesting users to see their posts in your feed
5. **Edit Profile**: Customize your profile with bio, location, and website
6. **View Notifications**: Stay updated with likes, comments, and new followers

### For Developers
- **Development**: Use `npm run dev` for development server
- **Building**: Use `npm run build` to create production build
- **Linting**: Use `npm run lint` to check code quality

## Project Structure

```
social-app/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── profile/           # User profile pages
│   └── page.tsx           # Home page
├── components/            # Reusable UI components
├── lib/                   # Utility functions and configurations
├── prisma/                # Database schema and migrations
├── actions/               # Server actions for data operations
└── public/                # Static assets
```

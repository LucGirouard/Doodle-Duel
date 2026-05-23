# Authentication Backend Setup Guide

This guide explains how to set up the Supabase authentication backend for the Art Battle HTM application.

## Overview

The authentication system uses:
- **NextAuth.js** - For session management and authentication
- **Supabase** - As the database backend
- **bcryptjs** - For password hashing

## Prerequisites

1. Node.js 18+ installed
2. A Supabase account and project

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

The required dependencies are:
- `next-auth` - Authentication library
- `@supabase/supabase-js` - Supabase client
- `bcryptjs` - Password hashing
- `@types/bcryptjs` - TypeScript types (already included)

### 2. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the `supabase-schema.sql` file to create the required tables

The schema creates:
- `users` table - Stores user accounts with hashed passwords
- `sessions` table - (Optional) For session management

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

2. Update the following variables in `.env.local`:

| Variable | Description | How to Get |
|----------|-------------|------------|
| `NEXTAUTH_SECRET` | Secret for NextAuth session encryption | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your app URL | `http://localhost:3000` for development |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | From Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | From Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | From Supabase project settings |

### 4. Generate NextAuth Secret

Generate a secure random string for `NEXTAUTH_SECRET`:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 5. Run the Application

```bash
npm run dev
```

## API Routes

### Authentication

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/signin` | POST | Sign in with credentials |
| `/api/auth/signout` | POST | Sign out and clear session |
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/session` | GET | Get current session |
| `/api/auth/callback/credentials` | POST | Callback for credentials provider |

### Usage Examples

#### Register a New User

```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securepassword',
    confirmPassword: 'securepassword'
  })
});

const data = await response.json();
```

#### Sign In

```javascript
import { signIn } from 'next-auth/react';

const result = await signIn('credentials', {
  email: 'user@example.com',
  password: 'securepassword',
  redirect: false
});
```

#### Sign Out

```javascript
import { signOut } from 'next-auth/react';

await signOut({ callbackUrl: '/login' });
```

#### Get Session

```javascript
import { useSession } from 'next-auth/react';

const { data: session } = useSession();
// session.user.id, session.user.email, session.user.name
```

## Protected Routes

The middleware automatically protects routes matching the pattern in `middleware.ts`. By default, all routes except:
- `/api/auth/*` - Authentication routes
- `/login` - Login page
- `/signin` - Signin page
- Static files (`_next/static`, `_next/image`, `favicon.ico`)
- Files with extensions (e.g., `.png`, `.css`)

To customize protected routes, edit the `matcher` array in `middleware.ts`.

## Database Schema

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | TEXT | Unique email address |
| `password_hash` | TEXT | Bcrypt hashed password |
| `name` | TEXT | Optional user name |
| `created_at` | TIMESTAMP | Account creation date |
| `updated_at` | TIMESTAMP | Last update date |

### Sessions Table (Optional)

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to users |
| `expires_at` | TIMESTAMP | Session expiration |
| `created_at` | TIMESTAMP | Session creation date |

## Security Features

1. **Password Hashing** - All passwords are hashed using bcryptjs with salt rounds of 10
2. **JWT Sessions** - Sessions are stored in encrypted JWT tokens
3. **Row Level Security (RLS)** - Database policies restrict data access
4. **CSRF Protection** - NextAuth includes built-in CSRF protection
5. **Secure Cookies** - Session cookies are httpOnly and secure in production

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Ensure the user exists in the database
   - Verify the password matches

2. **"Failed to create user" error**
   - Check if the email already exists
   - Verify Supabase connection and permissions

3. **Session not persisting**
   - Ensure `NEXTAUTH_SECRET` is set correctly
   - Check browser cookie settings

4. **Middleware redirecting to login**
   - Verify the user is authenticated
   - Check middleware matcher configuration

## Production Deployment

Before deploying to production:

1. Set a strong `NEXTAUTH_SECRET`
2. Update `NEXTAUTH_URL` to your production domain
3. Use environment variables for all secrets
4. Enable HTTPS for secure cookie transmission
5. Review and tighten RLS policies if needed
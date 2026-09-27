# Voyara Live Deployment Guide

Voyara now supports:

- React + Vite frontend
- Vercel serverless REST API
- PostgreSQL persistence through `DATABASE_URL`
- Register/login with hashed passwords and signed auth tokens
- User-specific bookings in My Trips
- Protected admin stats and package creation
- PDF travel ticket generation

## Local Run

```bash
npm install
npm run dev
```

Open:

- Frontend: `http://localhost:5173/`
- Backend: `http://localhost:4000/api/health`
- Bookings API: `http://localhost:4000/api/bookings`

Without `DATABASE_URL`, the local server uses `server/data/db.json` as a fallback.

## Real PostgreSQL Setup

Create a free PostgreSQL database on Neon or Supabase, then set:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/voyara
JWT_SECRET=replace-with-a-long-random-secret
ADMIN_EMAIL=vanisha@example.com
ADMIN_PASSWORD=vanisha123
```

The backend creates these tables automatically:

- `users`
- `packages`
- `bookings`

## Vercel Deployment

1. Push this project to GitHub.
2. Open Vercel and import the GitHub repository.
3. Use:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add the PostgreSQL/auth environment variables in Vercel.
5. Redeploy.

## Admin Login

Use the configured admin account:

```text
Email: vanisha@example.com
Password: vanisha123
```

Change these values in production through `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Interview Talking Points

- JWT-style token authentication
- Password hashing with Node.js crypto
- PostgreSQL schema for users, packages, and bookings
- User-specific booking history
- Protected admin APIs
- Vercel deployment with serverless API routes
- JSON fallback for easy local development

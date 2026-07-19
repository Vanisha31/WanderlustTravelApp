# Voyara Live Deployment Guide

This project now has:

- React + Vite frontend
- Node.js REST backend
- Booking API
- My Trips dashboard
- Local JSON booking storage for portfolio demo

## Local Run

```bash
npm install
npm run dev
```

Open:

- Frontend: `http://localhost:5173/`
- Backend: `http://localhost:4000/api/health`
- Bookings API: `http://localhost:4000/api/bookings`

## GitHub Push

```bash
git add .
git commit -m "Add Voyara backend and booking dashboard"
git push
```

## Vercel Frontend Deployment

1. Push this project to GitHub.
2. Open Vercel and import the GitHub repository.
3. Use:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add this Vercel environment variable after backend deployment:

```text
VITE_API_BASE_URL=https://YOUR-BACKEND-URL/api
```

## Backend Deployment

Vercel is excellent for the frontend. For this Node backend, the easiest student-friendly deployment is Render or Railway.

### Render

1. Push this project to GitHub.
2. Create a new Render Web Service.
3. Connect the GitHub repo.
4. Use:
   - Build Command: `npm install`
   - Start Command: `npm run dev:server`
5. After Render gives you a backend URL, add it in Vercel:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

## Important For Real Users

The current backend stores bookings in `server/data/db.json`, which is good for local demo and portfolio proof.

For real public users, use a hosted database:

- PostgreSQL: Neon or Supabase
- MongoDB: MongoDB Atlas

Then update the backend to save bookings in that database instead of the JSON file.

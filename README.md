# Wanderlust Travel App

Wanderlust is a React + Vite travel planning app for exploring destinations, browsing travel packages, planning itineraries, and simulating bookings in one polished interface.

## Features

- Destination search for Manali, Shimla, and Bir Billing
- Travel package cards with region, budget, and price sorting filters
- Booking flow for flights, hotels, trains, and buses
- Vehicle results, seat selection, checkout, and confirmation ticket UI
- Interactive Leaflet itinerary map with street, satellite, and minimal map layers
- Drag-and-drop itinerary planner
- Nearby scan/radar markers for useful local points
- AI-style travel assistant with altitude, weather, packing, and SOS guidance
- Trip wallet with budget tracking and expense entry
- PIN-protected offline travel vault demo

## Tech Stack

- React
- Vite
- Leaflet
- React Leaflet
- CSS

## Getting Started

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal, usually `http://localhost:5173/`.

## Production Build

```bash
npm run build
npm run preview
```

## Deploy

This is a static Vite React app, so it is suitable for Vercel.

1. Push this folder to GitHub.
2. Import the GitHub repository in Vercel.
3. Use these Vercel settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

## Notes

The app currently uses mock travel data from `src/mockData.js`, so no backend or database is required for deployment.

# Grassroots Football Session Planner

A specialized web application for grassroots football coaches to plan, customize, and export training sessions using a library of 755+ drills.

## Project Overview
- **Purpose:** MVP for personal use by football coaches.
- **Main Technologies:**
    - **Framework:** Next.js 15 (App Router)
    - **Styling:** Tailwind CSS + shadcn/ui
    - **Drag and Drop:** @dnd-kit
    - **PDF Export:** @react-pdf/renderer
    - **Storage:** Browser `localStorage` (No backend/auth required)
- **Data Source:** `drills-data.json` (755 drills)
- **Media Assets:** Video files located in `public/videos/` (to be moved from root `videos/`)

## Architecture & Features
- **Auto Session Builder:** Generates sessions based on player count, number of drills, and themes.
- **Manual Session Builder:** Searchable sidebar of drills to drag and drop into a timeline.
- **My Sessions:** Persistent storage of saved sessions via `localStorage`.
- **PDF Export:** Generates printable session plans.
- **Mobile First:** Optimized for use on the pitch.

## Development Commands
- **Install Dependencies:** `npm install`
- **Run Development Server:** `npm run dev`
- **Build for Production:** `npm run build`
- **Linting:** `npm run lint`

## Project Structure (Target)
- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components (shadcn/ui + custom).
- `lib/`: Utility functions, types, and data loading logic.
- `public/`: Static assets, including `drills-data.json` and `videos/`.
- `hooks/`: Custom React hooks for session management.

## Key Files
- `spec.md`: Original product specification.
- `drills-data.json`: Master drill library.
- `GEMINI.md`: This instruction file.

## Conventions
- Use TypeScript for all new code.
- Follow shadcn/ui patterns for components.
- Keep the UI clean, modern, and mobile-friendly.
- Ensure video paths are correctly mapped to `/videos/*.mp4`.

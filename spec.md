# Grassroots Football Session Planner – MVP Spec (Single Coach Use)

## Project Overview
Build a simple web app that helps me (a grassroots football coach) quickly plan, customize, and export training sessions using a library of 755 drills provided in `drills-data.json`.

**Goal:** Minimal viable product (MVP) for personal use only. No auth, no backend, no fancy features.

## Core Requirements
- Load drills from `drills_final_tagged.json`
- Two ways to build sessions: Auto Builder and Manual Builder
- View sessions with videos and details
- Reorder drills
- Export session as clean PDF
- Save and load sessions using browser `localStorage` only
- Mobile-friendly (I will use it on my phone at training)

## Tech Stack
- Next.js 15 (App Router)
- Tailwind CSS + shadcn/ui
- @dnd-kit for drag and drop
- @react-pdf/renderer for PDF export
- Load JSON directly (place in `public` or `lib` folder)

## Features

### 1. Auto Session Builder (Main / Default Screen)

**Input Form:**
- Number of players (number input, range 6–22, default 12)
- Number of drills (radio: 1, 2, or 3)
- Themes: multi-select up to 2 tags (dynamically load unique `drill_tags` from JSON)
- Age group (optional dropdown: U8-U12, U13-U16, Senior)

**Generate Button** creates the session.

**Session View:**
- Editable session title (auto-suggest e.g. "U14 Passing Session – 60 min")
- Drill cards in order:
  - Title
  - Video player (`<video>` tag using `video_file_path`)
  - Instructions
  - Coaching notes
  - Progression 1 (if available)
  - Progression 2 (if available)
  - Extra info: `number_of_players`, `pitch_size`
- Per-drill "Focus Mode" toggle (show only this drill, hide others)
- Drag handles to reorder drills
- Action buttons:
  - Export to PDF (clean printable layout)
  - Save Session (to localStorage)
  - New Session

### 2. Manual Session Builder

- Left sidebar: Searchable list of all 755 drills
  - Filters: keyword search (title), `drill_tags` (multi-select), `number_of_players`
  - Display: title + short preview
- Central timeline area:
  - Drag drills from sidebar into timeline
  - Reorder, remove, or duplicate drills
  - Option to add "Custom Block" (text area for warm-up, cool-down, etc.)
- Same session view as Auto Builder (videos, focus toggles, PDF export, Save)

### 3. My Sessions

- Simple list of saved sessions from localStorage
- Show: session title + date saved
- Click to load session into builder
- Delete option

## Navigation
- Top navigation or tabs: **Auto Builder** | **Manual Builder** | **My Sessions**

## Additional Details
- Design: Clean, modern, mobile-first (Tailwind + shadcn/ui)
- Videos: Prominent player with controls
- PDF Export: Professional look – session title at top, then each drill with all details
- Storage: Sessions saved as JSON in localStorage (include id, title, date, array of drills)
- Auto generation logic: Match selected tags and player count. Avoid duplicate drills.

## JSON Fields Used
- `drill_id`, `title`, `instructions_setup`, `coaching_notes`, `progression_one`, `progression_two`, `video_file_path`, `number_of_players`, `pitch_size`, `drill_tags`

## Success Criteria
- Generate a session in under 10 seconds
- Drag & drop works smoothly
- Videos play correctly
- PDF export looks good when printed
- Sessions persist after browser refresh

## Deliverables
Please generate the complete Next.js project with:
- Project structure and setup instructions
- All necessary components
- Working Auto Builder first, then Manual Builder
- PDF export functionality
- localStorage save/load

Start coding with the main layout and Auto Session Builder page.

---


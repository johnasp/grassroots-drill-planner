# Grassroots Football Session Planner
## Release Readiness and Architecture Plan

## Current State

The app is a functional prototype, but it is not ready for public release yet.

Current architecture:

- Next.js App Router
- Mostly client-side React pages
- Drill data loaded from a static JSON file through `lib/drills.ts`
- Sessions and favorites saved only in `localStorage`
- Videos and thumbnails stored in `public/`
- No authentication
- No database
- No server API
- Admin page is publicly accessible
- No automated tests or deployment checks

The main architectural issue is that the browser currently acts as the database. That works for one person on one device, but it cannot support accounts, sharing, backups, or reliable multi-device use.

## Biggest Release Blockers

### 1. No authentication

Anyone can currently access routes such as `/admin`, `/my-sessions`, and `/favorites`. There is no concept of a user, ownership, or permissions.

The admin route is especially important because it should never be public.

### 2. Data is stored only in the browser

The save logic in `app/page.tsx`, `app/manual/page.tsx`, and `app/my-sessions/page.tsx` uses `localStorage`.

This means:

- Sessions disappear if browser storage is cleared
- Sessions are not available on another phone or computer
- Sessions cannot be shared reliably
- There is no backup
- Large session collections may eventually exceed browser storage limits

### 3. Drill data is loaded inefficiently

Every client page loads the entire JSON file through `lib/drills.ts`, including the Auto Builder, Manual Builder, Favorites, and Admin pages.

A database would allow searching and filtering without downloading all drill records to every browser.

### 4. Videos are not production media

Videos inside `public/videos` will make deployments large and slow. They should eventually be moved to object storage or a video hosting service such as Supabase Storage, Cloudflare R2, Mux, Cloudinary, or Bunny Stream.

### 5. The admin page is not actually administrative

`app/admin/page.tsx` processes videos in the browser and downloads a ZIP and replacement JSON file. It does not update a database or upload thumbnails.

For release, this should become a protected admin workflow that:

- Requires an admin user
- Imports or edits drills
- Uploads media
- Updates database records
- Reports failed imports
- Keeps an audit log

### 6. Important business logic is incomplete

In `lib/drills.ts`:

- `playerCount` is accepted but not used
- The generator can return drills for completely different player counts
- Random selection uses `sort(() => 0.5 - Math.random())`
- There is no guarantee of enough matching drills
- There are no validation rules for empty or invalid input

This conflicts with the requirement that a requested player count should match exactly, or within one player.

### 7. There is no release-quality validation

The app currently has no visible:

- Unit tests
- End-to-end tests
- Database migration process
- CI pipeline
- Error monitoring
- Backup strategy
- Accessibility audit
- Mobile device test plan

There is also a TypeScript diagnostic involving deprecated `baseUrl` configuration in `tsconfig.json`.

## Recommended Production Architecture

```text
Browser
  |
  v
Next.js application
  |
  +-- Supabase Auth
  +-- Supabase PostgreSQL
  +-- Supabase Storage
  |
  +-- Public share pages
  +-- Protected coach pages
  +-- Protected admin pages
```

Recommended services:

- Hosting: Vercel
- Database: Supabase Postgres
- Authentication: Supabase Auth
- Media storage: Supabase Storage initially
- Error monitoring: Sentry
- Analytics: Plausible or PostHog
- Email: Supabase Auth email provider or Resend

This keeps the system relatively simple and avoids building a custom backend from scratch.

## Database Plan

### `profiles`

Stores application-level user information.

```text
id
email
display_name
role              -- coach or admin
created_at
```

### `drills`

Stores the drill library.

```text
id
title
drill_url
number_of_players
pitch_size
instructions_setup
coaching_notes
progression_one
progression_two
video_url
thumbnail_url
drill_tags
created_at
updated_at
```

The existing data shape is defined in `lib/types.ts`.

### `sessions`

Stores a coach's saved training plan.

```text
id
owner_id
title
player_count
age_group
is_public
share_token
created_at
updated_at
```

### `session_drills`

Stores the drills in a session in their chosen order.

```text
id
session_id
drill_id
position
custom_notes
created_at
```

### `favorites`

Stores each coach's favorite drills.

```text
user_id
drill_id
created_at
```

### `session_comments`

Add this when the coaching review feature is built.

```text
id
session_id
user_id
what_went_well
what_to_change
general_notes
created_at
updated_at
```

### Why use `session_drills` instead of JSON?

The current app stores complete drill objects in a session. That is convenient initially, but it creates stale copies.

A normalized database means:

- One drill record is maintained centrally
- Sessions refer to drills by ID
- Drill updates are consistent
- Search and reporting are easier
- Sessions can support custom notes and ordering properly

## Authentication Plan

Start with a simple model:

1. Email and password login
2. Password reset
3. Optional magic-link login
4. User profile
5. Coach role
6. Admin role

Do not build team invitations or complex permissions initially.

Permissions should be:

- Public users can view explicitly shared sessions
- Authenticated coaches can manage their own sessions
- Admins can manage drills and users
- Coaches cannot edit other coaches' private sessions

Supabase Row Level Security should enforce these rules in the database. Do not rely only on hidden buttons or client-side checks.

## Sharing Plan

When a coach clicks **Save and Share**:

1. Save the session to the database
2. Generate a secure random share token
3. Mark the session as public
4. Copy a URL such as `https://yourapp.com/share/abc123securetoken`

Create a public route:

```text
app/share/[token]/page.tsx
```

The share page should:

- Show the session title
- Show the date and player count
- Show the drills in order
- Play the videos
- Offer PDF export
- Not expose the coach's email or private account details

Add controls for:

- Copy link
- Disable sharing
- Regenerate link
- Delete session

Use a random token rather than exposing sequential database IDs.

## Application Structure Improvements

The current pages contain repeated UI and business logic. A stronger structure would be:

```text
app/
  (public)/
    share/[token]/page.tsx
  (auth)/
    login/page.tsx
    reset-password/page.tsx
  (coach)/
    builder/page.tsx
    manual/page.tsx
    my-sessions/page.tsx
    favorites/page.tsx
  (admin)/
    drills/page.tsx
    imports/page.tsx
  api/
    sessions/
    drills/

components/
  drills/
  sessions/
  builder/
  auth/
  shared/

lib/
  db/
  auth/
  validation/
  session-service.ts
  drill-service.ts
```

Create shared services for:

- Loading drills
- Creating sessions
- Updating sessions
- Deleting sessions
- Creating share links
- Validating user input

The Auto Builder and Manual Builder should use the same session-saving function.

## Product Improvements Before Release

### Must fix

- Enforce player-count matching
- Add loading states
- Add error states
- Validate all form inputs
- Prevent saving empty sessions
- Prevent duplicate save actions
- Confirm destructive actions
- Handle missing videos and thumbnails
- Make buttons and dialogs keyboard accessible
- Add meaningful image alt text
- Test on mobile Safari and Chrome
- Fix TypeScript diagnostics
- Decide whether the app targets Next 15 or Next 16 and make the package and specification consistent

### Should fix

- Replace duplicated drill-detail markup with one shared component
- Replace duplicated session-save logic with one service
- Add pagination or server-side filtering for drills
- Add session editing and renaming
- Add custom blocks to the data model
- Add a proper empty state for every page
- Add a useful 404 page
- Add a global error page
- Add privacy policy and terms pages

### Later

- Team accounts
- Coach invitations
- Shared team libraries
- Comments and post-session reviews
- Session templates
- Calendar integration
- Attendance tracking
- Usage analytics
- Native mobile app

## Testing Strategy

### Unit tests

Test:

- Player-count matching
- Tag filtering
- Session generation
- Duplicate prevention
- Session validation
- Share-token handling

### Component tests

Test:

- Save button states
- Empty sessions
- Loading states
- Dialog behavior
- Drag-and-drop ordering
- Mobile layout behavior

### End-to-end tests

Use Playwright to test:

1. Sign up or log in
2. Generate a session
3. Save the session
4. Refresh the page
5. Edit the title
6. Create a share link
7. Open the share link in a logged-out browser
8. Export the session PDF
9. Delete the session

## Recommended Release Plan

### Phase 1: Make the prototype dependable

Goal: Make the current app trustworthy for personal use.

- Fix player-count filtering
- Fix TypeScript diagnostics
- Add input validation
- Add loading and error states
- Prevent empty saves
- Extract shared session-saving logic
- Extract shared drill-detail component
- Hide or protect `/admin`
- Add basic unit tests
- Verify the app on mobile Safari and Chrome

Exit condition: You can use the app for several real training sessions without losing data or encountering broken screens.

### Phase 2: Add accounts and cloud storage

Goal: Make data persistent across devices.

- Create Supabase project
- Add database migrations
- Import the drill library
- Add Supabase Auth
- Add profiles and roles
- Move sessions from `localStorage` to Postgres
- Move favorites to Postgres
- Keep `localStorage` temporarily as a migration fallback
- Add Row Level Security
- Protect coach and admin routes

Exit condition: A coach can log in on two devices and see the same sessions and favorites.

### Phase 3: Add sharing and media storage

Goal: Make the app genuinely shareable.

- Add `session_drills`
- Add secure share tokens
- Add `/share/[token]`
- Add copy-link controls
- Add disable-sharing controls
- Move videos and thumbnails to object storage
- Add upload and validation tools for admins
- Add media failure handling

Exit condition: A logged-out person can open a shared session and view it successfully on a phone.

### Phase 4: Private beta

Goal: Test with a small number of coaches.

- Deploy to Vercel
- Add a production domain
- Add Sentry
- Add privacy and terms pages
- Add analytics
- Invite 5 to 20 coaches
- Collect feedback on session creation, sharing, and mobile use
- Monitor slow pages and failed video loads

Exit condition: Coaches can complete their main workflow without assistance.

### Phase 5: Public release

Goal: Release a stable professional product.

- Complete security review
- Confirm backups and restore process
- Add rate limiting
- Add abuse protection for public share links
- Add database indexes
- Add automated deployment checks
- Add Playwright smoke tests
- Add support/contact process
- Document admin workflows
- Remove prototype-only code and unused dependencies

## Recommended First Three Tasks

Do these in this order:

1. Harden the current prototype:
   - Fix player matching
   - Add validation and error handling
   - Remove or protect `/admin`
   - Add basic tests

2. Move sessions and favorites to Supabase:
   - Keep drills as JSON temporarily if needed
   - Add authentication
   - Add user-owned sessions
   - Add Row Level Security

3. Add public session sharing:
   - Add secure share tokens
   - Add `/share/[token]`
   - Add copy-link and disable-link controls

This sequence gives you a dependable personal app first, then a secure cloud product, then the sharing feature. It avoids trying to build authentication, media storage, sharing, and a redesigned frontend all at once.

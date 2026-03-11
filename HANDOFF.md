# SKIM.YT - PROJECT CONTEXT & PENDING TASKS

## 🏗️ Project Architecture
- **Frontend:** Next.js (App Router), Tailwind CSS, Framer Motion (Liquid Glass UI).
- **Backend:** Supabase (PostgreSQL, Auth).
- **ETL Pipeline:** Python script (`pipeline.py`) running via GitHub Actions chron job. It fetches YouTube transcripts, uses Gemini 2.5 Flash to summarize them into "nuggets", and pushes to Supabase.
- **Current Pivot:** We are abandoning "Sync Google Subs" (OAuth scopes are too slow for tomorrow's launch). Users will manually add channels via YouTube IDs or `@handles`. We are also moving from a "Tinder discard" swipe deck to a bi-directional "Carousel" deck.

## 🚨 Immediate Execution Required
Act as a Senior Full-Stack Engineer and QA Automation Expert. Read the current codebase and implement the following 5 tasks. Do not break the Liquid Glass styling.

### Task 1: The Swipe Deck Carousel Pivot
1. Modify `src/components/SwipeDeck.tsx`. Remove the swipe-to-dismiss logic that permanently hides cards.
2. Change the swipe interaction: Swiping left navigates to the *next* card (index + 1). Swiping right navigates to the *previous* card (index - 1).
3. Modify `src/lib/queries.ts`. `fetchFeedVideos` should pull the newest 100 videos from subscribed channels, ordered by `published_at` descending. Do not filter out swiped videos.
4. Add a "Favorite" button to `SkimCard.tsx`, backed by a new `user_favorites` table in Supabase.

### Task 2: Bulletproof Channel Management
1. In `src/components/GlassSidebar.tsx`, remove ALL logic/UI related to "Sync Google Subs".
2. Ensure the "Add Channel" input robustly handles `@handles` (e.g., `@MKBHD`, `@ayejude`). The backend `pipeline.py` must intercept these handles, use the YouTube Search API to resolve them to a raw `UC...` ID, and proceed.
3. Add a "Trash/Delete" icon next to each channel in the sidebar list to allow users to delete channels from `user_channels`.

### Task 3: Visual Polish & Metadata
1. **Broken Avatars:** In `next.config.ts`, whitelist YouTube/Google image domains. In `SkimCard.tsx`, add an `onError` fallback to the channel `<img />`. If a 404 occurs, show a sleek glassmorphism circle with the first letter of the channel name. NEVER show a broken image icon.
2. **Vignette:** In `globals.css`, darken `.skim-card__vignette` so white text is highly readable against bright thumbnails.
3. **Upload Date:** In `SkimCard.tsx`, render the `video.publishedAt` data nicely formatted (e.g., "Oct 24, 2025" or "2 hours ago") next to the channel name.
4. **User Menu:** Turn the top-right 'P' avatar into a dropdown with the user's initial and a "Sign Out" button (`supabase.auth.signOut()`).

### Task 4: AI Prompt Optimization & Scaling
1. In `skim-backend/pipeline.py`, change the prompt to strictly require: "Exactly 6 to 7 bullet points. Each bullet point MUST be exactly one sentence long. Use simple, easy-to-read English."
2. Change the YouTube API parameter in the pipeline from `maxResults=3` to `maxResults=10`.
3. Update `.github/workflows/etl.yml` to run every 4 hours (`cron: '0 */4 * * *'`).

### Mandatory QA Protocol
Test with `@MKBHD`, `@ayejude`, `@Mrwhosetheboss`, and `@JerryRigEverything`. Verify no broken avatars, verify left/right carousel swiping works without cards disappearing, and ensure the UI looks clean.
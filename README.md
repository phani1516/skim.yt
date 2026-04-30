# skim.yt

skim.yt is a mobile-first PWA that helps users keep up with their favorite YouTube channels without having to watch every new upload immediately.

Many people subscribe to a large number of YouTube channels and miss important updates simply because there is too much content to keep up with. skim.yt solves that problem by letting users follow their favorite channels inside the app and view each new video as a swipeable summary tile. Instead of committing minutes or hours to every upload, users can quickly understand what a video covers, what was announced, and whether it is worth watching. If they want the full content, they can jump straight to the original YouTube video.

## Why I built it

I wanted a faster way to stay informed by my favorite creators without drowning in long video queues. The goal was to create a lightweight “content triage” experience: open the app, skim the latest uploads, decide what matters, and only watch the videos worth your time.

## Core idea

- Users add their favorite YouTube channels to their account.
- The app fetches the latest videos from those channels.
- Each video is turned into a short, easy-to-consume summary.
- Summaries are presented as swipeable cards for a mobile-friendly experience.
- Users can open the original YouTube link whenever they want to watch the full video.

## Features

- Favorite channel tracking
- Mobile-first PWA experience
- Swipeable summary tiles
- AI-assisted video summaries
- Channel management and favorites
- User accounts and backend integration
- Direct link-out to original YouTube videos

## Tech stack

### Frontend
- Next.js
- TypeScript
- CSS
- PWA architecture

### Backend / Data
- Python scripts for ETL and processing
- Supabase for database/auth workflows
- GitHub Actions / workflow-based automation
- AI-assisted summarization pipeline

## How it works

skim.yt is designed as a layered workflow:

1. Users choose the YouTube channels they care about.
2. The pipeline collects the newest video metadata.
3. Transcript/content extraction is used when available.
4. The app generates a short summary or fallback description.
5. The frontend presents videos as swipeable summary cards.
6. Users decide whether to watch the full video on YouTube.

## Current project status

The app is live and the product experience is functional, but the automated content pipeline is currently paused.

YouTube has been blocking GitHub-hosted and Azure-hosted IPs used in the scraping/transcript workflow for this hobby project. Because of that, the always-on cloud pipeline is not currently running in production. I can still run the workflow from my desktop environment, but I paused the hosted pipeline rather than paying for third-party transcript scraping services for a personal side project.

In short:

- The app and product concept are live.
- The production scraping/transcript pipeline is paused.
- The project still works as a strong proof of concept and engineering build.
- Local/desktop-triggered pipeline execution remains possible.

## What this project demonstrates

This project is more than a UI experiment. It demonstrates:

- Product thinking around information overload
- Mobile-first PWA design
- Full-stack application structure
- Workflow/pipeline thinking for ingestion and summarization
- Practical handling of real-world platform constraints
- Fallback design when ideal data sources are unavailable

## Challenges

One of the biggest challenges in this project was dealing with platform restrictions around transcript/data extraction. For a hobby project, it was important to balance technical ambition with realistic infrastructure cost. Rather than forcing a brittle paid solution, I treated the limitation transparently and designed the project so the concept, app flow, and engineering decisions are still visible.

## Live project

[skim-yt.vercel.app](https://skim-yt.vercel.app/)

## Future improvements

- Resume and harden the ingestion pipeline with a more reliable source strategy
- Improve transcript and fallback summary quality
- Add better personalization for channel prioritization
- Introduce “must-watch” scoring or importance ranking
- Add notification digests for important creator updates
- Expand analytics around watched vs skipped summaries

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`

## Notes

This project is currently maintained as a personal product and engineering experiment focused on summarization, user relevance, and practical workflow design for overloaded YouTube subscribers.

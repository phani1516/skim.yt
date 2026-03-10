// Run: npx tsx scripts/seed.ts
// Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Import mock data — use relative path since this runs outside Next.js
const mockVideos = [
    {
        videoId: "dQw4w9WgXcQ",
        channelName: "Fireship",
        channelAvatar:
            "https://yt3.ggpht.com/ytc/AIdro_nT-TlFAaVOhBsUbW-CKSD6MkUX2vjzKh4GBdz0Sw=s88-c-k-c0x00ffffff-no-rj",
        thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
        title: "God-Tier Developer Roadmap 2025",
        publishedAt: "2025-03-01T12:00:00Z",
        isHighSignal: true,
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        nuggets: [
            "Rust is overtaking C++ in systems programming job postings",
            "AI-assisted coding is now expected in 70% of dev roles",
            "WebAssembly adoption grew 340% in enterprise backends",
            "TypeScript has become the default for all new JS projects",
        ],
    },
    {
        videoId: "jNQXAC9IVRw",
        channelName: "ThePrimeagen",
        channelAvatar:
            "https://yt3.ggpht.com/dBEHBMCaNX93e1VlnUhFjSb_5gr-RF7FAdM_x7wBjJdcPMqL1qt97Ge5bJVvEajOIQdi6sVJsA=s88-c-k-c0x00ffffff-no-rj",
        thumbnailUrl: "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
        title: "Why I Quit My $500K Netflix Job",
        publishedAt: "2025-03-02T15:30:00Z",
        isHighSignal: true,
        videoUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
        nuggets: [
            "Corporate engineering culture stifles innovation at scale",
            "Streaming companies are shifting to AI-generated content pipelines",
            "Independent content creation now rivals FAANG compensation",
            "Vim workflows increase productivity by 3x—proven by time studies",
            "The future of tech is in small, focused teams under 10 people",
        ],
    },
    {
        videoId: "S0_qX4VJhMQ",
        channelName: "3Blue1Brown",
        channelAvatar:
            "https://yt3.ggpht.com/ytc/AIdro_nMS1GVHJ-o24_2xbak2Yz50txwAYjBMifUkAKKlg=s88-c-k-c0x00ffffff-no-rj",
        thumbnailUrl: "https://i.ytimg.com/vi/S0_qX4VJhMQ/hqdefault.jpg",
        title: "The Hidden Beauty of Neural Network Gradients",
        publishedAt: "2025-03-03T08:00:00Z",
        isHighSignal: true,
        videoUrl: "https://www.youtube.com/watch?v=S0_qX4VJhMQ",
        nuggets: [
            "Gradient descent is essentially a ball rolling downhill in 10,000 dimensions",
            "Backpropagation was invented in 1986 but ignored for 25 years",
            "Visualizing loss landscapes reveals why some models train faster",
            "The chain rule is the single most important concept in deep learning",
        ],
    },
    {
        videoId: "Ks-_Mh1QhMc",
        channelName: "Traversy Media",
        channelAvatar:
            "https://yt3.ggpht.com/ytc/AIdro_lGRm-rMYYGAMfAgSOqf3ypO74BSTs70Tq9FhJpOeo=s88-c-k-c0x00ffffff-no-rj",
        thumbnailUrl: "https://i.ytimg.com/vi/Ks-_Mh1QhMc/hqdefault.jpg",
        title: "Build a Full-Stack App with Next.js 15 in 2 Hours",
        publishedAt: "2025-03-01T20:00:00Z",
        isHighSignal: false,
        videoUrl: "https://www.youtube.com/watch?v=Ks-_Mh1QhMc",
        nuggets: [
            "Server Components reduce client-side JavaScript by up to 80%",
            "The new App Router eliminates the need for getServerSideProps",
            "Streaming SSR allows progressive page rendering in Next.js 15",
            "Tailwind v4 uses a Rust-based engine that's 10x faster",
        ],
    },
    {
        videoId: "9bZkp7q19f0",
        channelName: "Fireship",
        channelAvatar:
            "https://yt3.ggpht.com/ytc/AIdro_nT-TlFAaVOhBsUbW-CKSD6MkUX2vjzKh4GBdz0Sw=s88-c-k-c0x00ffffff-no-rj",
        thumbnailUrl: "https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg",
        title: "10 Frameworks That Will Die in 2025",
        publishedAt: "2025-02-28T10:00:00Z",
        isHighSignal: true,
        videoUrl: "https://www.youtube.com/watch?v=9bZkp7q19f0",
        nuggets: [
            "jQuery still powers 77% of all websites, but new adoption is near zero",
            "Angular faces an existential crisis as React Server Components mature",
            "Gatsby has been abandoned by its maintainers",
            "Svelte 5 runes make it the most ergonomic framework available",
            "HTMX is capturing the simplicity crowd from full frameworks",
        ],
    },
    {
        videoId: "QH2-TGUlwu4",
        channelName: "ThePrimeagen",
        channelAvatar:
            "https://yt3.ggpht.com/dBEHBMCaNX93e1VlnUhFjSb_5gr-RF7FAdM_x7wBjJdcPMqL1qt97Ge5bJVvEajOIQdi6sVJsA=s88-c-k-c0x00ffffff-no-rj",
        thumbnailUrl: "https://i.ytimg.com/vi/QH2-TGUlwu4/hqdefault.jpg",
        title: "Hot Take: LLMs Can't Actually Code",
        publishedAt: "2025-02-27T14:00:00Z",
        isHighSignal: true,
        videoUrl: "https://www.youtube.com/watch?v=QH2-TGUlwu4",
        nuggets: [
            "LLMs produce syntactically correct but logically flawed code 40% of the time",
            "Copilot users show decreased algorithmic understanding over 6 months",
            "The best use of AI coding is boilerplate generation, not architecture",
            "Senior devs benefit from AI more than juniors—contrary to expectations",
        ],
    },
    {
        videoId: "aircAruvnKk",
        channelName: "3Blue1Brown",
        channelAvatar:
            "https://yt3.ggpht.com/ytc/AIdro_nMS1GVHJ-o24_2xbak2Yz50txwAYjBMifUkAKKlg=s88-c-k-c0x00ffffff-no-rj",
        thumbnailUrl: "https://i.ytimg.com/vi/aircAruvnKk/hqdefault.jpg",
        title: "Transformers Explained with Pure Linear Algebra",
        publishedAt: "2025-02-26T09:00:00Z",
        isHighSignal: true,
        videoUrl: "https://www.youtube.com/watch?v=aircAruvnKk",
        nuggets: [
            "Attention is fundamentally a weighted average with learned weights",
            "The key-query-value paradigm mirrors how databases do lookups",
            "Positional encoding is a hack that somehow works brilliantly",
            "Multi-head attention lets the model attend to different relationship types simultaneously",
        ],
    },
    {
        videoId: "pUADP4m_TFo",
        channelName: "Traversy Media",
        channelAvatar:
            "https://yt3.ggpht.com/ytc/AIdro_lGRm-rMYYGAMfAgSOqf3ypO74BSTs70Tq9FhJpOeo=s88-c-k-c0x00ffffff-no-rj",
        thumbnailUrl: "https://i.ytimg.com/vi/pUADP4m_TFo/hqdefault.jpg",
        title: "Docker & Kubernetes Crash Course for Web Devs",
        publishedAt: "2025-02-25T18:00:00Z",
        isHighSignal: false,
        videoUrl: "https://www.youtube.com/watch?v=pUADP4m_TFo",
        nuggets: [
            "Containers are not VMs—they share the host kernel",
            "Kubernetes orchestration is overkill for projects under 50 microservices",
            "Docker Compose handles 90% of local development needs",
            "Multi-stage builds can reduce image sizes by 10x",
        ],
    },
    {
        videoId: "kCc8FmEb1nY",
        channelName: "Fireship",
        channelAvatar:
            "https://yt3.ggpht.com/ytc/AIdro_nT-TlFAaVOhBsUbW-CKSD6MkUX2vjzKh4GBdz0Sw=s88-c-k-c0x00ffffff-no-rj",
        thumbnailUrl: "https://i.ytimg.com/vi/kCc8FmEb1nY/hqdefault.jpg",
        title: "Every React Concept Explained in 12 Minutes",
        publishedAt: "2025-02-24T11:00:00Z",
        isHighSignal: true,
        videoUrl: "https://www.youtube.com/watch?v=kCc8FmEb1nY",
        nuggets: [
            "React Server Components eliminate the waterfall fetch problem",
            "useOptimistic is the most underused hook in React 19",
            "Suspense boundaries have replaced loading spinners in modern apps",
            "The compiler in React 19 auto-memoizes everything—no more useMemo",
            "Signals vs state: React chose a different path from every other framework",
        ],
    },
    {
        videoId: "fJ9rUzIMcZQ",
        channelName: "ThePrimeagen",
        channelAvatar:
            "https://yt3.ggpht.com/dBEHBMCaNX93e1VlnUhFjSb_5gr-RF7FAdM_x7wBjJdcPMqL1qt97Ge5bJVvEajOIQdi6sVJsA=s88-c-k-c0x00ffffff-no-rj",
        thumbnailUrl: "https://i.ytimg.com/vi/fJ9rUzIMcZQ/hqdefault.jpg",
        title: "The REAL Reason Developers Burn Out",
        publishedAt: "2025-02-23T16:00:00Z",
        isHighSignal: true,
        videoUrl: "https://www.youtube.com/watch?v=fJ9rUzIMcZQ",
        nuggets: [
            "Burnout is caused by lack of autonomy, not long hours",
            "Context switching between 3+ projects destroys deep work capacity",
            "The most productive devs work only 4-5 focused hours per day",
            "Open floor plans reduce coding productivity by 15%",
        ],
    },
];

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seed() {
    console.log("🌱 Seeding skim.yt database...\n");

    // Extract unique channels
    const channelMap = new Map<
        string,
        { name: string; avatar: string }
    >();
    for (const v of mockVideos) {
        if (!channelMap.has(v.channelName)) {
            channelMap.set(v.channelName, {
                name: v.channelName,
                avatar: v.channelAvatar,
            });
        }
    }

    // Insert channels
    const channelIds = new Map<string, string>();
    for (const [key, ch] of channelMap) {
        const { data, error } = await supabase
            .from("channels")
            .upsert(
                {
                    youtube_id: key.toLowerCase().replace(/\s/g, ""),
                    name: ch.name,
                    avatar_url: ch.avatar,
                },
                { onConflict: "youtube_id" }
            )
            .select("id")
            .single();

        if (error) {
            console.error(`❌ Error inserting channel ${ch.name}:`, error.message);
            continue;
        }
        channelIds.set(key, data.id);
        console.log(`  ✅ Channel: ${ch.name} → ${data.id}`);
    }
    console.log(`\n📺 Seeded ${channelIds.size} channels\n`);

    // Insert videos
    let videoCount = 0;
    for (const v of mockVideos) {
        const channelId = channelIds.get(v.channelName);
        if (!channelId) {
            console.error(`  ⚠️  Skipping video "${v.title}" — channel not found`);
            continue;
        }

        const { error } = await supabase.from("videos").upsert(
            {
                video_id: v.videoId,
                channel_id: channelId,
                title: v.title,
                thumbnail_url: v.thumbnailUrl,
                video_url: v.videoUrl,
                published_at: v.publishedAt,
                is_high_signal: v.isHighSignal,
                nuggets: v.nuggets,
            },
            { onConflict: "video_id" }
        );

        if (error) {
            console.error(`  ❌ Error inserting video "${v.title}":`, error.message);
            continue;
        }
        videoCount++;
        console.log(`  ✅ Video: ${v.title}`);
    }
    console.log(`\n🎬 Seeded ${videoCount} videos`);
    console.log("\n✨ Done!");
}

seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});

// Temporary script to create database schema
// Run: npx tsx scripts/create-schema.ts

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const schema = `
-- CHANNELS
CREATE TABLE IF NOT EXISTS channels (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  youtube_id  TEXT UNIQUE NOT NULL,
  name        TEXT NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- VIDEOS
CREATE TABLE IF NOT EXISTS videos (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  video_id        TEXT UNIQUE NOT NULL,
  channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  thumbnail_url   TEXT,
  video_url       TEXT NOT NULL,
  published_at    TIMESTAMPTZ NOT NULL,
  is_high_signal  BOOLEAN DEFAULT true,
  nuggets         TEXT[] DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_videos_channel ON videos(channel_id);
CREATE INDEX IF NOT EXISTS idx_videos_published ON videos(published_at DESC);

-- USER CHANNEL SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS user_channels (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id  UUID REFERENCES channels(id) ON DELETE CASCADE,
  added_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, channel_id)
);

-- SWIPE HISTORY
CREATE TABLE IF NOT EXISTS swipe_history (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id    UUID REFERENCES videos(id) ON DELETE CASCADE,
  direction   TEXT CHECK (direction IN ('left', 'right')),
  swiped_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, video_id)
);

-- ROW LEVEL SECURITY
ALTER TABLE channels       ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos          ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_channels   ENABLE ROW LEVEL SECURITY;
ALTER TABLE swipe_history   ENABLE ROW LEVEL SECURITY;

-- Policies (using IF NOT EXISTS workaround)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read channels') THEN
    CREATE POLICY "Public read channels" ON channels FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read videos') THEN
    CREATE POLICY "Public read videos" ON videos FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own subs') THEN
    CREATE POLICY "Users manage own subs" ON user_channels FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own swipes') THEN
    CREATE POLICY "Users manage own swipes" ON swipe_history FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
`;

async function createSchema() {
    console.log("🏗️  Creating database schema...\n");

    const { error } = await supabase.rpc("exec_sql", { sql: schema });

    if (error) {
        // If exec_sql doesn't exist, try the REST SQL endpoint
        console.log("Using direct SQL approach...\n");

        const response = await fetch(
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
                    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
                },
                body: JSON.stringify({ sql: schema }),
            }
        );

        if (!response.ok) {
            console.log(
                "⚠️  Could not auto-create schema. Please run the SQL manually in the Supabase SQL Editor.\n"
            );
            console.log("📋 Copy the SQL from: scripts/schema.sql\n");
            return false;
        }
    }

    console.log("✅ Schema created successfully!\n");
    return true;
}

createSchema().catch(console.error);

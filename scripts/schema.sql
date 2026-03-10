-- =============================================
-- skim.yt Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

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

-- Everyone can read channels & videos
CREATE POLICY "Public read channels"  ON channels  FOR SELECT USING (true);
CREATE POLICY "Public read videos"    ON videos     FOR SELECT USING (true);

-- Users manage their own subscriptions
CREATE POLICY "Users manage own subs" ON user_channels
  FOR ALL USING (auth.uid() = user_id);

-- Users manage their own swipe history
CREATE POLICY "Users manage own swipes" ON swipe_history
  FOR ALL USING (auth.uid() = user_id);

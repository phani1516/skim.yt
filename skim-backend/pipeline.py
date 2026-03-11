import os
import sys
import json
import time
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai
from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi
import time

# 1. Load Environment Variables
from pathlib import Path
dotenv_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=dotenv_path)
sys.stdout.reconfigure(encoding='utf-8')  # Fix Windows emoji output
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use service key to bypass Row Level Security
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Initialize Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
genai.configure(api_key=GEMINI_API_KEY)

# Use the free and fast Gemini Flash model
model = genai.GenerativeModel('gemini-2.5-flash')

def resolve_channel(channel_row):
    """Resolves a channel's youtube_id to a real UC... ID if needed.
    Also fetches and updates the channel's name and avatar in Supabase."""
    youtube_id = channel_row['youtube_id']
    db_id = channel_row['id']
    
    # Already a real channel ID — just fetch metadata if name/avatar is missing
    if youtube_id.startswith('UC'):
        # Fetch channel metadata to update name and avatar
        try:
            ch_response = youtube.channels().list(
                part="snippet",
                id=youtube_id
            ).execute()
            items = ch_response.get('items', [])
            if items:
                snippet = items[0]['snippet']
                real_name = snippet['title']
                avatar_url = snippet['thumbnails']['default']['url']
                supabase.table('channels').update({
                    'name': real_name,
                    'avatar_url': avatar_url
                }).eq('id', db_id).execute()
                print(f"  📇 Updated metadata: {real_name}")
        except Exception as e:
            print(f"  ⚠️ Could not fetch metadata for {youtube_id}: {e}")
        return youtube_id
    
    # Not a UC... ID — resolve via YouTube Search API
    search_query = youtube_id.lstrip('@')
    print(f"  🔍 Resolving handle '{youtube_id}'...")
    
    try:
        search_response = youtube.search().list(
            part="snippet",
            q=search_query,
            type="channel",
            maxResults=1
        ).execute()
        items = search_response.get('items', [])
        if not items:
            print(f"  ⚠️ Could not resolve '{youtube_id}' to a channel")
            return None
        
        resolved_id = items[0]['snippet']['channelId']
        channel_title = items[0]['snippet']['channelTitle']
        avatar_url = items[0]['snippet']['thumbnails']['default']['url']
        
        # CRITICAL: Update the channels table with the real ID, name, and avatar
        supabase.table('channels').update({
            'youtube_id': resolved_id,
            'name': channel_title,
            'avatar_url': avatar_url
        }).eq('id', db_id).execute()
        
        print(f"  ✅ Resolved: {youtube_id} → {resolved_id} ({channel_title})")
        return resolved_id
    except Exception as e:
        print(f"  ❌ Error resolving '{youtube_id}': {e}")
        return None

def get_channel_uploads(channel_id):
    """Fetches the latest videos from a channel using its UC... ID."""
    try:
        # YouTube channel IDs start with UC. Their upload playlist replaces it with UU.
        upload_playlist_id = channel_id.replace('UC', 'UU', 1)

        request = youtube.playlistItems().list(
            part="snippet",
            playlistId=upload_playlist_id,
            maxResults=10  # Check the last 10 videos per channel
        )
        response = request.execute()
        return response.get('items', [])
    except Exception as e:
        print(f"  ❌ Error fetching uploads for '{channel_id}': {e}")
        return []

def get_transcript(video_id):
    """Fetches the auto-generated transcript using youtube-transcript-api v1.x."""
    try:
        ytt_api = YouTubeTranscriptApi()
        transcript = ytt_api.fetch(video_id)
        # v1.x returns a TranscriptData object; iterate its snippets
        full_text = " ".join([snippet.text for snippet in transcript])
        return full_text
    except Exception as e:
        print(f"Transcript unavailable for {video_id}: {e}")
        return None

def extract_nuggets(content_text, title):
    """The Ruthless Editor Prompt — with rate-limit retry."""
    prompt = f"""
    You are a ruthless editor for a tech news aggregator. 
    Analyze this video context (Title: "{title}").
    
    Rule 1: If the video is mostly fluff, repetition, or has no highly actionable/novel tech insights, output exactly: {{"is_high_signal": false, "nuggets": []}}
    Rule 2: If the video contains highly valuable, novel information, extract exactly 6 to 7 bullet points.
    Rule 3: Each bullet point MUST be exactly one sentence long. Use simple, easy-to-read English. Do not use filler words.
    
    Output strictly valid JSON matching this schema:
    {{
      "is_high_signal": boolean,
      "nuggets": ["point 1", "point 2", "point 3", "point 4", "point 5", "point 6"]
    }}
    
    Context: {content_text[:25000]}
    """
    
    for attempt in range(3):
        try:
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            return json.loads(response.text)
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                wait_time = 15 * (attempt + 1)
                print(f"  [Rate limit] Waiting {wait_time}s before retry...")
                time.sleep(wait_time)
            else:
                raise
    raise Exception("Failed after 3 retries")

def process_channel(channel):
    try:
        print(f"\n{'='*50}")
        print(f"📺 Processing: {channel['name']} ({channel['youtube_id']})")
        
        # Step 1: Resolve handle → real UC... ID (and update DB with metadata)
        resolved_id = resolve_channel(channel)
        if not resolved_id:
            print(f"  ⏭️ Skipping — could not resolve channel")
            return
        
        # Step 2: Fetch recent uploads
        videos = get_channel_uploads(resolved_id)
        print(f"  📹 Found {len(videos)} recent videos")
        
        processed = 0
        for video in videos:
            vid_id = video['snippet']['resourceId']['videoId']
            title = video['snippet']['title']
            thumb = video['snippet']['thumbnails']['high']['url']
            published = video['snippet']['publishedAt']
            description = video['snippet'].get('description', '')
            
            # Check if we already summarized this video
            existing = supabase.table('videos').select('id').eq('video_id', vid_id).execute()
            if existing.data:
                continue
                
            print(f"  📥 New video: {title[:50]}...")
            
            # Extract Content (Transcript or Fallback to Description)
            target_text = ""
            transcript = get_transcript(vid_id)
            if transcript:
                target_text = transcript
                print("  🧠 AI is summarizing transcript...")
            elif description.strip():
                target_text = description
                print("  ⚠️ No transcript — falling back to video description...")
            else:
                print(f"  ⚠️ No transcript or description — skipping")
                continue
                
            # Transform: AI Summarization
            ai_result = extract_nuggets(target_text, title)
            
            # Load: Push to Supabase
            video_data = {
                "video_id": vid_id,
                "channel_id": channel['id'],
                "title": title,
                "thumbnail_url": thumb,
                "video_url": f"https://www.youtube.com/watch?v={vid_id}",
                "published_at": published,
                "is_high_signal": ai_result['is_high_signal'],
                "nuggets": ai_result['nuggets']
            }
            
            supabase.table('videos').insert(video_data).execute()
            processed += 1
            print(f"  ✅ Saved! (nuggets: {len(ai_result['nuggets'])})")
            
            # Respect Gemini free tier rate limit (15 req/min)
            time.sleep(15)
        
        print(f"  📊 {processed} new videos processed for {channel['name']}")
    except Exception as e:
        print(f"\n  ❌ Error processing channel '{channel['name']}': {e}")
        print("  ➡️ Skipping to next channel...")

def run_worker():
    print("🚀 Starting real-time Skim.yt ETL Worker...")
    visited_channels = set()
    last_full_sync = 0
    SYNC_INTERVAL = 14400 # 4 hours

    while True:
        try:
            now = time.time()
            is_full_sync = (now - last_full_sync) > SYNC_INTERVAL
            
            # Fetch channels from Supabase
            channels_response = supabase.table('channels').select('id, youtube_id, name').execute()
            channels = channels_response.data
            
            for channel in channels:
                chan_id = channel['id']
                if is_full_sync or chan_id not in visited_channels:
                    if is_full_sync and chan_id in visited_channels:
                        print(f"🔄 Full Sync for existing channel: {channel['name']}")
                    else:
                        print(f"⚡ New Channel Detected: {channel['name']}")
                    
                    process_channel(channel)
                    visited_channels.add(chan_id)
            
            if is_full_sync:
                last_full_sync = time.time()
                print(f"💤 Sync complete. Sleeping... Polling for new channels every 30 seconds.")
                
        except Exception as e:
            print(f"Worker iteration error: {e}")
            
        # Poll every 30 seconds for new channels
        time.sleep(30)

if __name__ == "__main__":
    run_worker()

import os
import sys
import json
import time
from dotenv import load_dotenv
from supabase import create_client, Client
import google.generativeai as genai
from googleapiclient.discovery import build
from youtube_transcript_api import YouTubeTranscriptApi

# 1. Load Environment Variables
load_dotenv()
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

def get_channel_uploads(channel_id):
    """Fetches the latest videos from a channel. Resolves handles to real IDs if needed."""
    try:
        # If not a real channel ID (UC...), resolve via YouTube search API
        if not channel_id.startswith('UC'):
            search_query = channel_id.lstrip('@')
            search_response = youtube.search().list(
                part="snippet",
                q=search_query,
                type="channel",
                maxResults=1
            ).execute()
            items = search_response.get('items', [])
            if not items:
                print(f"  ⚠️ Could not resolve handle '{channel_id}' to a channel ID")
                return []
            channel_id = items[0]['snippet']['channelId']
            print(f"  🔗 Resolved to channel ID: {channel_id}")

        # YouTube channel IDs start with UC. Their upload playlist replaces it with UU.
        upload_playlist_id = channel_id.replace('UC', 'UU', 1)

        request = youtube.playlistItems().list(
            part="snippet",
            playlistId=upload_playlist_id,
            maxResults=3  # Only check the last 3 videos to save quota
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

def extract_nuggets(transcript, title):
    """The Ruthless Editor Prompt — with rate-limit retry."""
    prompt = f"""
    You are a ruthless editor for a tech news aggregator. 
    Analyze this video transcript (Title: "{title}").
    
    Rule 1: If the video is mostly fluff, repetition, or has no highly actionable/novel tech insights, output exactly: {{"is_high_signal": false, "nuggets": []}}
    Rule 2: If the video contains highly valuable, novel information, extract 3 to 5 concise, actionable bullet points. Do not use filler words.
    
    Output strictly valid JSON matching this schema:
    {{
      "is_high_signal": boolean,
      "nuggets": ["point 1", "point 2", "point 3"]
    }}
    
    Transcript: {transcript[:25000]}
    """
    
    for attempt in range(3):
        try:
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            return json.loads(response.text)
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                wait = 15 * (attempt + 1)
                print(f"  [Rate limit] Waiting {wait}s before retry...")
                time.sleep(wait)
            else:
                raise
    raise Exception("Failed after 3 retries")

def run_pipeline():
    print("🚀 Starting Skim.yt ETL Pipeline...")
    
    # Extract: Get all channels from our database
    channels_response = supabase.table('channels').select('id, youtube_id, name').execute()
    channels = channels_response.data
    
    for channel in channels:
        try:
            print(f"\n✅ Checking {channel['name']}...")
            videos = get_channel_uploads(channel['youtube_id'])
            
            for video in videos:
                vid_id = video['snippet']['resourceId']['videoId']
                title = video['snippet']['title']
                thumb = video['snippet']['thumbnails']['high']['url']
                published = video['snippet']['publishedAt']
                
                # Check if we already summarized this video
                existing = supabase.table('videos').select('id').eq('video_id', vid_id).execute()
                if existing.data:
                    print(f"  ⏭️ Already processed: {title[:30]}...")
                    continue
                    
                print(f"  📥 Processing: {title[:30]}...")
                
                # Extract Transcript
                transcript = get_transcript(vid_id)
                if not transcript:
                    print(f"  ⚠️ Skipping {title[:30]} (no transcript available)")
                    continue
                    
                # Transform: AI Summarization
                print("  🧠 AI is reading...")
                ai_result = extract_nuggets(transcript, title)
                
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
                print("  ✅ Saved to Database!")
                
                # Respect Gemini free tier rate limit (5 req/min)
                time.sleep(15)
        except Exception as e:
            print(f"\n  ❌ Error processing channel '{channel['name']}': {e}")
            print("  ➡️ Skipping to next channel...")
            continue

if __name__ == "__main__":
    run_pipeline()

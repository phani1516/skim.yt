import os
import datetime
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client

dotenv_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=dotenv_path)

supabase = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# Find MKBHD channel
res = supabase.table("channels").select("id").eq("name", "MKBHD").execute()
if not res.data:
    print("MKBHD not found in channels tabel.")
    exit(1)

mkbhd_id = res.data[0]["id"]

# Insert mock videos
videos = [
    {
        "video_id": "mock_mkbhd_1",
        "channel_id": mkbhd_id,
        "title": "M4 Mac Mini Review: Flawless!",
        "thumbnail_url": "https://i.ytimg.com/vi/mock_mkbhd_1/hqdefault.jpg",
        "video_url": "https://www.youtube.com/watch?v=mock_mkbhd_1",
        "published_at": (datetime.datetime.utcnow() - datetime.timedelta(hours=2)).isoformat(),
        "is_high_signal": True,
        "nuggets": ["The M4 chip is insanely fast.", "It runs very cool.", "Base model is 16GB RAM now."]
    },
    {
        "video_id": "mock_mkbhd_2",
        "channel_id": mkbhd_id,
        "title": "Apple Vision Pro: 1 Year Later",
        "thumbnail_url": "https://i.ytimg.com/vi/mock_mkbhd_2/hqdefault.jpg",
        "video_url": "https://www.youtube.com/watch?v=mock_mkbhd_2",
        "published_at": (datetime.datetime.utcnow() - datetime.timedelta(days=4)).isoformat(),
        "is_high_signal": False,
        "nuggets": ["It's still too heavy.", "Not enough killer apps.", "Wait for generation 2."]
    }
]

for v in videos:
    try:
        supabase.table("videos").insert(v).execute()
        print(f"Inserted: {v['title']}")
    except Exception as e:
        print(f"Already exists or error: {e}")

print("Done inserting mock data.")

"""
Quick script to update channel youtube_ids in Supabase from handle-style
to real YouTube channel IDs (UC...) so the ETL pipeline can fetch uploads.

Run: venv\\Scripts\\python.exe update_channels.py
"""
import os
import sys
sys.stdout.reconfigure(encoding='utf-8')

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

supabase = create_client(
    os.getenv("NEXT_PUBLIC_SUPABASE_URL"),
    os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

# Real YouTube channel IDs for our channels
CHANNEL_MAP = {
    "fireship":       "UCsBjURrPoezykLs9EqgamOA",
    "theprimeagen":   "UCUyeluBRhGPCW4rPe_UvBZQ",
    "3blue1brown":    "UCYO_jab_esuFRV4b17AJtAw",
    "traversymedia":  "UC29ju8bIPH5as8OGnQzwJyA",
}

channels = supabase.table("channels").select("id, youtube_id, name").execute()

for ch in channels.data:
    old_id = ch["youtube_id"]
    new_id = CHANNEL_MAP.get(old_id)
    if new_id:
        supabase.table("channels").update({"youtube_id": new_id}).eq("id", ch["id"]).execute()
        print(f"[OK] {ch['name']}: {old_id} -> {new_id}")
    else:
        print(f"[SKIP] No mapping for {ch['name']} ({old_id})")

print("\nDone! Channels now have real YouTube IDs.")

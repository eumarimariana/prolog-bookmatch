import os
import asyncio
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    # Try reading from .env
    with open("bookmatch/backend-api/.env") as f:
        for line in f:
            if line.startswith("SUPABASE_URL="):
                url = line.strip().split("=", 1)[1]
            elif line.startswith("SUPABASE_KEY="):
                key = line.strip().split("=", 1)[1]

supabase = create_client(url, key)

print("Testing user_profiles...")
res = supabase.table('user_profiles').select('*').execute()
print("Select result:", res.data)

print("\nTesting upsert...")
try:
    res = supabase.table('user_profiles').upsert({
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Test",
        "liked_genres": ["fantasy"],
        "liked_tropes": ["magic"]
    }).execute()
    print("Upsert successful:", res.data)
except Exception as e:
    print("Upsert failed:", e)


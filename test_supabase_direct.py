import os
import sys
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

if not url or not key:
    with open("bookmatch/backend-api/.env") as f:
        for line in f:
            if line.startswith("SUPABASE_URL="):
                url = line.strip().split("=", 1)[1]
            elif line.startswith("SUPABASE_KEY="):
                key = line.strip().split("=", 1)[1]

print(f"URL: {url}")
print(f"KEY: {key[:15]}...{key[-15:]}")

supabase = create_client(url, key)

try:
    res = supabase.table('user_profiles').upsert({
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Leitor Teste Direct"
    }).execute()
    print("Direct Upsert success!")
except Exception as e:
    print("Direct Upsert error:", e)


import sys
from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
try:
    response = supabase.table("books").select("*").execute()
    print("Total books:", len(response.data))
except Exception as e:
    print("Error:", e)

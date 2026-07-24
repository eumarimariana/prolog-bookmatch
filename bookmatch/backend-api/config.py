import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print(
        "AVISO: faltam as credenciais do Supabase no arquivo .env "
        "(SUPABASE_URL / SUPABASE_KEY). A API vai subir, mas sem "
        "sincronizar livros até que as credenciais sejam configuradas."
    )
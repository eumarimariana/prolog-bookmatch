import os
from pyswip import Prolog
from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_KEY

# Só cria o client do Supabase se as credenciais estiverem configuradas.
# Sem isso, a API ainda sobe, só fica sem dados até o .env ser corrigido.
supabase: Client | None = None

if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)    

prolog = Prolog()

def escape_prolog_string(value: str):
    """Escapa aspas simples para evitar quebra/injeção na query Prolog"""
    return value.replace("\\", "\\\\").replace("'", "\\'")

def load_rules():
    prolog_path = os.path.join("..", "backend-prolog", "recommender.pl")
    prolog.consult(prolog_path)

def sync_supabase_to_prolog():
    """Procura os livros no Supabase e injeta-os como factos no Prolog"""
    if supabase is None:
        raise RuntimeError("Credenciais do Supabase não configuradas, sincronização pulada")

    print("Sincronizando dados do Supabase com o Prolog...")
    
    # Limpa factos dinâmicos antigos para evitar duplicados
    prolog.retractall("book(_, _)")
    prolog.retractall("has_genre(_, _)")
    prolog.retractall("has_trope(_, _)")
    
    # Procura todos os livros na tabela 'books' do Supabase
    response = supabase.table("books").select("*").execute()
    books = response.data
    
    for book in books:
        book_id = str(book["id"])
        # Escapa aspas simples para não quebrar a sintaxe do Prolog
        title = escape_prolog_string(book["title"])
        
        # Cria os factos dinâmicos no Prolog
        prolog.assertz(f"book('{book_id}', '{title}')")
        
        for genre in book.get("genres", []):
            prolog.assertz(f"has_genre('{book_id}', '{genre}')")
            
        for trope in book.get("tropes", []):
            prolog.assertz(f"has_trope('{book_id}', '{trope}')")
            
    print(f"Sincronização concluída com sucesso! {len(books)} livros carregados.")
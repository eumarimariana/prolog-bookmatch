import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pyswip import Prolog
from supabase import create_client, Client
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware

# Carrega as credenciais do arquivo .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("Faltam as credenciais do Supabase no arquivo .env")

# Inicializa o cliente do Supabase e o Prolog
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
prolog = Prolog()

def sync_supabase_to_prolog():
    """Procura os livros no Supabase e injeta-os como factos no Prolog"""
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
        title = book["title"].replace("'", "\\'")
        
        # Cria os factos dinâmicos no Prolog
        prolog.assertz(f"book('{book_id}', '{title}')")
        
        for genre in book.get("genres", []):
            prolog.assertz(f"has_genre('{book_id}', '{genre}')")
            
        for trope in book.get("tropes", []):
            prolog.assertz(f"has_trope('{book_id}', '{trope}')")
            
    print(f"Sincronização concluída com sucesso! {len(books)} livros carregados.")

# Utiliza o ciclo de vida (lifespan) do FastAPI para rodar ao iniciar o servidor
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Carrega as regras lógicas estáticas do arquivo .pl
    prolog_path = os.path.join("..", "backend-prolog", "recommender.pl")
    prolog.consult(prolog_path)
    
    # Sincroniza a base de dados
    try:
        sync_supabase_to_prolog()
    except Exception as e:
        print(f"Erro ao sincronizar dados: {e}")
    yield

app = FastAPI(title="BookMatch API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permite que qualquer origem (como o teu React) aceda à API
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RecommendationRequest(BaseModel):
    genre: str

@app.post("/recommend/genre")
async def get_recommendation_by_genre(req: RecommendationRequest):
    query = f"recommend_by_genre('{req.genre}', Title)"
    recommended_books = []
    
    try:
        for result in prolog.query(query):
            recommended_books.append(result["Title"])
        return {"genre_requested": req.genre, "recommendations": recommended_books}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na inferência lógica: {str(e)}")
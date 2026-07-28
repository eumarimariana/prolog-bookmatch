from fastapi import APIRouter, Query, HTTPException
from open_library_service import search_open_library
from schemas import BookImportSchema
from prolog_services import prolog, supabase, escape_prolog_string

router = APIRouter(prefix="/books", tags=["books"])

@router.get("/openlibrary/search")
async def search_books_openlibrary(
    q: str = Query(..., min_length=2, description="Termo para pesquisar na Open Library"),
    page: int = Query(1, ge=1, description="Página da busca")
):
    """
    Busca de livros na API Open Library.
    Consulta a base oficial e aberta respeitando caching e termos legais.
    """
    limit = 20
    offset = (page - 1) * limit
    results = search_open_library(q, limit=limit, offset=offset)
    return {"query": q, "count": len(results), "page": page, "books": results}

@router.post("/import")
async def import_book(book_data: BookImportSchema):
    """
    Importa um livro do Open Library (ou formulário) para o banco Supabase
    e insere dinamicamente os fatos correspondentes no motor Prolog!
    """
    try:
        # 1. Salva no Supabase (se a tabela existir e não houver duplicatas)
        record = {
            "title": book_data.title,
            "author": book_data.author,
            "cover_url": book_data.cover_url,
            "genres": book_data.genres or [],
            "tropes": book_data.tropes or []
        }
        
        db_res = None
        try:
            # Verifica se já existe
            existing = supabase.table("books").select("id").eq("title", book_data.title).execute()
            if existing.data and len(existing.data) > 0:
                return {
                    "status": "success",
                    "message": f"Livro '{book_data.title}' já existe no catálogo Supabase.",
                    "book": record
                }
                
            db_res = supabase.table("books").insert(record).execute()
        except Exception as err:
            print(f"Aviso ao salvar no Supabase (seguindo com injeção no Prolog): {err}")

        # 2. Injeta fatos dinâmicos no motor Prolog
        safe_title = escape_prolog_string(book_data.title)
        book_id = str(db_res.data[0]["id"]) if db_res and db_res.data else safe_title.lower().replace(" ", "_")
        
        prolog.assertz(f"book('{book_id}', '{safe_title}')")
        for g in (book_data.genres or []):
            safe_g = escape_prolog_string(g.lower())
            prolog.assertz(f"has_genre('{book_id}', '{safe_g}')")
            
        for t in (book_data.tropes or []):
            safe_t = escape_prolog_string(t.lower())
            prolog.assertz(f"has_trope('{book_id}', '{safe_t}')")

        return {
            "status": "success",
            "message": f"Livro '{book_data.title}' importado com sucesso e indexado no Prolog!",
            "book": record
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao importar livro: {str(e)}")

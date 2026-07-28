from fastapi import APIRouter, HTTPException
from schemas import ProfileSchema, UserProfileSaveRequest, FavoriteBookRequest
from prolog_services import supabase

router = APIRouter(prefix="/profiles", tags=["profiles"])

# Memória fallback para perfis caso a tabela no Supabase ainda esteja em provisionamento
in_memory_profiles = {
    "user_default": {
        "id": "user_default",
        "name": "Laura Ribeiro",
        "location": "São Paulo, BR",
        "reading_since": "2019",
        "bio": "Apaixonada por ficção e fantasia contemporânea.",
        "favorite_genres": ["Fantasia", "Ficção", "Romance"],
        "avatar_url": None
    }
}

in_memory_user_profiles = {}

@router.get("/{user_id}")
async def get_profile(user_id: str):
    """
    Busca o perfil do leitor no Supabase (com fallback gracioso).
    """
    try:
        res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
    except Exception as e:
        print(f"Nota ao consultar Supabase profiles: {e}")

    if user_id in in_memory_profiles:
        return in_memory_profiles[user_id]
    
    return {
        "id": user_id,
        "name": "Leitor BookMatch",
        "location": "Brasil",
        "reading_since": "2023",
        "bio": "",
        "favorite_genres": [],
        "avatar_url": None
    }

@router.post("")
async def create_or_update_profile(profile: ProfileSchema):
    """
    Cria ou atualiza o perfil do leitor no banco de dados Supabase e retorna os dados atualizados.
    """
    profile_dict = profile.model_dump()
    user_id = profile.id or "user_default"
    profile_dict["id"] = user_id

    # 1. Atualiza no Supabase
    supabase_success = False
    try:
        res = supabase.table("profiles").upsert(profile_dict).execute()
        supabase_success = True
    except Exception as err:
        print(f"Erro ao salvar no Supabase (salvando em fallback): {err}")

    # 2. Atualiza na memória local (garante persistência funcional na sessão)
    in_memory_profiles[user_id] = profile_dict

    return {
        "status": "success",
        "saved_to_supabase": supabase_success,
        "profile": profile_dict
    }

@router.get("/user_profiles/{user_id}")
async def get_user_profile(user_id: str):
    """
    Busca o perfil do leitor na tabela user_profiles e seus favoritos na user_library.
    """
    profile_data = None
    try:
        # Busca perfil básico
        res = supabase.table("user_profiles").select("*").eq("id", user_id).execute()
        if res.data and len(res.data) > 0:
            profile_data = res.data[0]
        
        # Busca livros lidos/favoritos
        if profile_data:
            lib_res = supabase.table("user_library").select("book_id").eq("user_id", user_id).execute()
            if lib_res.data:
                profile_data["read_books"] = [row["book_id"] for row in lib_res.data]
            else:
                profile_data["read_books"] = []
            return profile_data

    except Exception as e:
        print(f"Nota ao consultar Supabase user_profiles/user_library: {e}")

    # Fallback
    if user_id in in_memory_user_profiles:
        return in_memory_user_profiles[user_id]
    
    return None

@router.post("/user_profiles")
async def save_user_profile(profile: UserProfileSaveRequest):
    """
    Salva o perfil de usuário na tabela user_profiles ignorando RLS ou usando fallback em memória.
    """
    profile_dict = profile.model_dump(exclude_none=True)
    user_id = profile_dict["id"]
    
    try:
        supabase.table("user_profiles").upsert(profile_dict).execute()
    except Exception as err:
        print(f"Erro ao salvar user_profiles no Supabase (salvando em fallback): {err}")
        
    in_memory_user_profiles[user_id] = profile_dict
    
    return {"status": "success", "profile": profile_dict}

@router.post("/user_library")
async def add_favorite_book(req: FavoriteBookRequest):
    """
    Adiciona um livro aos favoritos do usuário na tabela user_library.
    """
    try:
        # Verifica se já existe a relação
        existing = supabase.table("user_library").select("id").eq("user_id", req.user_id).eq("book_id", req.book_id).execute()
        if existing.data and len(existing.data) > 0:
            return {"status": "success", "message": "Livro já favoritado"}

        # Insere na tabela
        supabase.table("user_library").insert({
            "user_id": req.user_id,
            "book_id": req.book_id,
            "status": "favoritado"
        }).execute()

        # Atualiza fallback em memória se necessário
        if req.user_id in in_memory_user_profiles:
            if "read_books" not in in_memory_user_profiles[req.user_id]:
                in_memory_user_profiles[req.user_id]["read_books"] = []
            if req.book_id not in in_memory_user_profiles[req.user_id]["read_books"]:
                in_memory_user_profiles[req.user_id]["read_books"].append(req.book_id)

        return {"status": "success", "message": "Livro adicionado aos favoritos"}
    except Exception as err:
        print(f"Erro ao salvar na user_library (salvando no fallback): {err}")
        # Tenta salvar no fallback de qualquer forma
        if req.user_id in in_memory_user_profiles:
            if "read_books" not in in_memory_user_profiles[req.user_id]:
                in_memory_user_profiles[req.user_id]["read_books"] = []
            if req.book_id not in in_memory_user_profiles[req.user_id]["read_books"]:
                in_memory_user_profiles[req.user_id]["read_books"].append(req.book_id)
        raise HTTPException(status_code=500, detail=f"Erro ao salvar na user_library: {err}")

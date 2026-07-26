from fastapi import APIRouter, HTTPException
from schemas import ProfileSchema
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

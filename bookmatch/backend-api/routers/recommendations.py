from fastapi import APIRouter, HTTPException
from schemas import (
    RecommendationRequest, SimilarRequest, CombinedTropesRequest, 
    AdvancedRecommendationRequest, ScoreRequest, ExplainRequest, UserProfileRequest
)
from prolog_services import prolog, escape_prolog_string

router = APIRouter(prefix="/recommend", tags=["recommendations"])


@router.post("/genre")
async def get_recommendation_by_genre(req: RecommendationRequest):
    genre = escape_prolog_string(req.genre.strip().lower())
    query = f"recommend_by_genre('{genre}', Title)"

    try:
        results = [r["Title"] for r in prolog.query(query)]
        return {"genre_requested": req.genre, "recommendations": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na inferência lógica: {str(e)}")


@router.post("/similar")
async def get_recommendation_by_similarity(req: SimilarRequest):
    title = escape_prolog_string(req.title)
    query = f"recommend_similar('{title}', Title)"

    try:
        results = [r["Title"] for r in prolog.query(query)]
        return {"title_requested": req.title, "recommendations": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na inferência lógica: {str(e)}")


@router.post("/tropes")
async def get_recommendation_by_combined_tropes(req: CombinedTropesRequest):
    trope1 = escape_prolog_string(req.trope1.strip().lower())
    trope2 = escape_prolog_string(req.trope2.strip().lower())
    query = f"recommend_by_combined_tropes('{trope1}', '{trope2}', Title)"

    try:
        results = [r["Title"] for r in prolog.query(query)]
        return {
            "tropes_requested": [req.trope1, req.trope2],
            "recommendations": results,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na inferência lógica: {str(e)}")


@router.post("/advanced")
async def get_advanced_recommendation(req: AdvancedRecommendationRequest):
    results = []

    # 1. Busca por tropos/humores/temas no Prolog
    tropes_to_check = list((req.moods or []) + (req.themes or []))
    if req.prompt:
        words = [w.strip().lower() for w in req.prompt.split() if len(w) > 3]
        tropes_to_check.extend(words)

    for trope in tropes_to_check:
        safe_trope = escape_prolog_string(trope.lower())
        query = f"recommend_by_trope('{safe_trope}', Title)"
        try:
            for r in prolog.query(query):
                title = r["Title"]
                if title not in results:
                    results.append(title)
        except Exception:
            pass

    # 2. Busca por gênero se especificado
    if req.genre:
        safe_genre = escape_prolog_string(req.genre.lower())
        query = f"recommend_by_genre('{safe_genre}', Title)"
        try:
            for r in prolog.query(query):
                title = r["Title"]
                if title not in results:
                    results.append(title)
        except Exception:
            pass

    # 3. Fallback inteligente: se não encontrou específico, consulta todos os livros do Prolog
    if not results:
        try:
            for r in prolog.query("book(_, Title)"):
                title = r["Title"]
                if title not in results:
                    results.append(title)
        except Exception:
            pass

    return {
        "genre_requested": req.genre,
        "moods": req.moods,
        "themes": req.themes,
        "recommendations": results
    }

@router.post("/score")
async def get_best_match_by_score(req: ScoreRequest):
    title = escape_prolog_string(req.reference_title)
    query = f"recommend_best_match('{title}', RecommendedTitle, Score)"
    try:
        results = [{"title": r["RecommendedTitle"], "score": r["Score"]} for r in prolog.query(query)]
        return {"reference_title": req.reference_title, "recommendations": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na inferência lógica: {str(e)}")

@router.post("/user_profile")
async def get_recommendation_for_user(req: UserProfileRequest):
    # Setup temporary user facts
    user_id = escape_prolog_string(req.user_id)
    
    try:
        for g in req.liked_genres:
            prolog.assertz(f"user_likes_genre('{user_id}', '{escape_prolog_string(g.lower())}')")
        for t in req.liked_tropes:
            prolog.assertz(f"user_likes_trope('{user_id}', '{escape_prolog_string(t.lower())}')")
        for dt in req.disliked_tropes:
            prolog.assertz(f"user_dislikes_trope('{user_id}', '{escape_prolog_string(dt.lower())}')")
        for b in req.read_books:
            prolog.assertz(f"user_read('{user_id}', '{escape_prolog_string(b)}')")
            
        query = f"recommend_for_user('{user_id}', Title)"
        results = [r["Title"] for r in prolog.query(query)]
        
        # Cleanup temporary user facts (in a real system you'd manage this differently or keep it if it's cached)
        prolog.retractall(f"user_likes_genre('{user_id}', _)")
        prolog.retractall(f"user_likes_trope('{user_id}', _)")
        prolog.retractall(f"user_dislikes_trope('{user_id}', _)")
        prolog.retractall(f"user_read('{user_id}', _)")
        
        return {"user_id": req.user_id, "recommendations": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na inferência lógica: {str(e)}")

@router.post("/explain")
async def explain_recommendation(req: ExplainRequest):
    genre = escape_prolog_string(req.genre.lower())
    trope = escape_prolog_string(req.trope.lower())
    query = f"recommend_with_reason('{genre}', '{trope}', Title, Reason)"
    try:
        results = [{"title": r["Title"], "reason": r["Reason"]} for r in prolog.query(query)]
        return {"genre": req.genre, "trope": req.trope, "recommendations": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na inferência lógica: {str(e)}")

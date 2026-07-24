from fastapi import APIRouter, HTTPException
from schemas import RecommendationRequest, SimilarRequest, CombinedTropesRequest
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
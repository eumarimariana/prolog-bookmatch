from fastapi import APIRouter, HTTPException
from schemas import RecommendationRequest
from prolog_services import prolog, escape_prolog_string

router = APIRouter(prefix="/recommend", tags=["recommendations"])


@router.post("/genre")
async def get_recommendation_by_genre(req: RecommendationRequest):
    genre = escape_prolog_string(req.genre)
    query = f"recommend_by_genre('{genre}', Title)"

    try:
        results = [r["Title"] for r in prolog.query(query)]
        return {"genre_requested": req.genre, "recommendations": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na inferência lógica: {str(e)}")
from pydantic import BaseModel

class RecommendationRequest(BaseModel):
    genre: str
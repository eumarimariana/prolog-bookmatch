from pydantic import BaseModel

class RecommendationRequest(BaseModel):
    genre: str

class SimilarRequest(BaseModel):
    title: str

class CombinedTropesRequest(BaseModel):
    trope1: str
    trope2: str
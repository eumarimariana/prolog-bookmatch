from pydantic import BaseModel
from typing import List, Optional

class RecommendationRequest(BaseModel):
    genre: str

class SimilarRequest(BaseModel):
    title: str

class CombinedTropesRequest(BaseModel):
    trope1: str
    trope2: str

class AdvancedRecommendationRequest(BaseModel):
    prompt: Optional[str] = None
    moods: Optional[List[str]] = []
    themes: Optional[List[str]] = []
    size: Optional[str] = None
    rhythm: Optional[str] = None
    genre: Optional[str] = None

class ProfileSchema(BaseModel):
    id: Optional[str] = "user_default"
    name: str
    location: Optional[str] = "São Paulo, BR"
    reading_since: Optional[str] = "2019"
    bio: Optional[str] = None
    favorite_genres: Optional[List[str]] = []
    avatar_url: Optional[str] = None

class BookImportSchema(BaseModel):
    title: str
    author: str
    cover_url: Optional[str] = None
    genres: Optional[List[str]] = []
    tropes: Optional[List[str]] = []

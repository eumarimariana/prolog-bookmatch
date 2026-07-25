import requests
from functools import lru_cache
from typing import List, Dict, Any, Optional

OPEN_LIBRARY_SEARCH_URL = "https://openlibrary.org/search.json"
OPEN_LIBRARY_COVERS_URL = "https://covers.openlibrary.org/b/id"

# User-Agent amigável para identificação ética conforme os termos da Open Library
HEADERS = {
    "User-Agent": "BookMatchApp/1.0 (https://bookmatch-app.local; contato@bookmatch.app)",
    "Accept": "application/json"
}

@lru_cache(maxsize=128)
def search_open_library(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Busca livros na API pública e aberta da Open Library.
    Utiliza LRU cache para respeitar a taxa de requisições e evitar spam.
    """
    if not query or len(query.strip()) < 2:
        return []

    try:
        response = requests.get(
            OPEN_LIBRARY_SEARCH_URL,
            params={"q": query.strip(), "limit": limit, "fields": "key,title,author_name,first_publish_year,cover_i,subject"},
            headers=HEADERS,
            timeout=8
        )
        response.raise_for_status()
        data = response.json()

        results = []
        for doc in data.get("docs", []):
            cover_id = doc.get("cover_i")
            cover_url = (
                f"{OPEN_LIBRARY_COVERS_URL}/{cover_id}-L.jpg"
                if cover_id
                else "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80"
            )

            authors = doc.get("author_name", [])
            author = authors[0] if authors else "Autor Desconhecido"
            subjects = doc.get("subject", [])[:5]

            results.append({
                "open_library_key": doc.get("key"),
                "title": doc.get("title"),
                "author": author,
                "first_publish_year": doc.get("first_publish_year"),
                "cover_url": cover_url,
                "genres": subjects
            })

        return results
    except Exception as e:
        print(f"Aviso ao consultar Open Library: {e}")
        return []

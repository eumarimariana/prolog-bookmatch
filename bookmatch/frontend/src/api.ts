export const API_URL = "http://localhost:8000";

export async function recommendForUserProfile(userId: string, genres: string[], tropes: string[]) {
  const res = await fetch(`${API_URL}/recommend/user_profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      liked_genres: genres,
      liked_tropes: tropes,
      disliked_tropes: [],
      read_books: []
    })
  });
  if (!res.ok) throw new Error("Erro na API");
  return res.json();
}

export async function recommendByScore(referenceTitle: string) {
  const res = await fetch(`${API_URL}/recommend/score`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reference_title: referenceTitle })
  });
  if (!res.ok) throw new Error("Erro na API");
  return res.json();
}

export async function recommendWithExplanation(genre: string, trope: string) {
  const res = await fetch(`${API_URL}/recommend/explain`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ genre, trope })
  });
  if (!res.ok) throw new Error("Erro na API");
  return res.json();
}

export async function searchOpenLibrary(query: string) {
  const res = await fetch(`${API_URL}/books/openlibrary/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Erro ao buscar livros na Open Library");
  return res.json();
}

export async function importBookToProlog(book: { title: string; author: string; cover_url?: string; genres?: string[], tropes?: string[] }) {
  const res = await fetch(`${API_URL}/books/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  if (!res.ok) throw new Error("Erro ao importar livro");
  return res.json();
}

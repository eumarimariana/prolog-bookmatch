export const API_URL = "http://localhost:8000";

export async function recommendForUserProfile(userId: string, genres: string[], tropes: string[], readBooks: string[] = []) {
  const res = await fetch(`${API_URL}/recommend/user_profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      liked_genres: genres,
      liked_tropes: tropes,
      disliked_tropes: [],
      read_books: readBooks
    })
  });
  if (!res.ok) throw new Error("Erro na API");
  return res.json();
}

export async function saveUserProfile(profileData: any) {
  const res = await fetch(`${API_URL}/profiles/user_profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profileData)
  });
  if (!res.ok) throw new Error("Erro ao salvar perfil");
  return res.json();
}

export async function getUserProfile(userId: string) {
  const res = await fetch(`${API_URL}/profiles/user_profiles/${userId}`);
  if (!res.ok) return null;
  return res.json();
}

export async function addFavoriteBook(userId: string, bookId: string) {
  const res = await fetch(`${API_URL}/profiles/user_library`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, book_id: bookId })
  });
  if (!res.ok) throw new Error("Erro ao adicionar favorito");
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

export async function recommendAdvanced(prompt: string) {
  const res = await fetch(`${API_URL}/recommend/advanced`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, moods: [], themes: [] })
  });
  if (!res.ok) throw new Error("Erro na API");
  return res.json();
}

export async function searchOpenLibrary(query: string, page: number = 1) {
  const res = await fetch(`${API_URL}/books/openlibrary/search?q=${encodeURIComponent(query)}&page=${page}`);
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

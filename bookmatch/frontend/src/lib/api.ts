// Cliente da API FastAPI (backend Prolog)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/** Fetch com timeout — o backend pode estar desligado */
async function fetchWithTimeout(input: string, init?: RequestInit, timeoutMs = 5000): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...init, signal: ctrl.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    throw e;
  }
}

export interface RecommendationResult {
  genre_requested?: string;
  recommendations: string[];
}

export interface AdvancedRecommendationParams {
  prompt?: string;
  moods?: string[];
  themes?: string[];
  size?: string;
  rhythm?: string;
  genre?: string;
}

/** Busca recomendações de livros por gênero usando o motor de inferência Prolog */
export async function recommendByGenre(genre: string): Promise<RecommendationResult> {
  const res = await fetchWithTimeout(`${API_URL}/recommend/genre`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ genre }),
  });

  if (!res.ok) throw new Error(`Erro na API de recomendação: ${res.status}`);
  return res.json();
}

/** Busca recomendações de livros avançadas (humor, temas, tamanho, ritmo, frase) usando Prolog */
export async function recommendAdvanced(params: AdvancedRecommendationParams): Promise<RecommendationResult> {
  const res = await fetchWithTimeout(`${API_URL}/recommend/advanced`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) throw new Error(`Erro na API de recomendação avançada: ${res.status}`);
  return res.json();
}

export interface UserProfile {
  id?: string;
  name: string;
  location?: string;
  reading_since?: string;
  bio?: string;
  favorite_genres?: string[];
  avatar_url?: string;
}

export interface OpenLibraryBook {
  open_library_key: string;
  title: string;
  author: string;
  first_publish_year?: number;
  cover_url: string;
  genres: string[];
}

/** Busca livros na API oficial da Open Library através do backend — timeout de 8s */
export async function searchOpenLibrary(query: string): Promise<OpenLibraryBook[]> {
  const res = await fetchWithTimeout(
    `${API_URL}/books/openlibrary/search?q=${encodeURIComponent(query)}`,
    undefined,
    8000
  );
  if (!res.ok) throw new Error(`Erro ao buscar livros na Open Library: ${res.status}`);
  const data = await res.json();
  return data.books || [];
}

/** Importa um livro do Open Library para o Supabase e indexa no motor Prolog */
export async function importBookToProlog(book: { title: string; author: string; cover_url?: string; genres?: string[] }) {
  const res = await fetchWithTimeout(`${API_URL}/books/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(book),
  });
  if (!res.ok) throw new Error(`Erro ao importar livro: ${res.status}`);
  return res.json();
}

/** Busca o perfil do leitor no backend / Supabase */
export async function getProfile(userId: string = "user_default"): Promise<UserProfile> {
  const res = await fetchWithTimeout(`${API_URL}/profiles/${userId}`);
  if (!res.ok) throw new Error(`Erro ao carregar perfil: ${res.status}`);
  return res.json();
}

/** Cria ou atualiza o perfil do leitor no Supabase */
export async function saveProfile(profile: UserProfile): Promise<UserProfile> {
  const res = await fetchWithTimeout(`${API_URL}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });
  if (!res.ok) throw new Error(`Erro ao salvar perfil: ${res.status}`);
  const data = await res.json();
  return data.profile;
}
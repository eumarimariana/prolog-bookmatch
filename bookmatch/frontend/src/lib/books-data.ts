import { supabase } from "./supabase";

export interface Book {
  slug: string;
  title: string;
  author: string;
  genre: string;
  mood: string[];
  rating: number;
  pages: number;
  year: number;
  cover: string;
  accent: string;
  synopsis: string;
  why: string;
}

// Função assíncrona para buscar todos os livros do Supabase mantendo o formato visual
export async function getBooks(): Promise<Book[]> {
  const { data, error } = await supabase.from("books").select("*");
  
  if (error || !data || data.length === 0) {
    return []; // Retorna vazio se houver erro
  }

  return data.map((b: any) => ({
    slug: b.id, // O ID do Supabase vira o slug da rota
    title: b.title,
    author: b.author,
    genre: b.genre || "Ficção",
    mood: b.tropes || ["Reflexivo"],
    rating: b.rating || 4.5,
    pages: b.pages || 300,
    year: b.year || 2024,
    cover: b.cover || "linear-gradient(135deg, #024a10 0%, #036c17 100%)",
    accent: b.accent || "#e87305",
    synopsis: b.synopsis || "Sinopse não disponível.",
    why: b.why || "Recomendação baseada no seu perfil."
  }));
}

// Função para buscar um livro específico pelo slug/ID na página de detalhes
export async function getBook(slug: string): Promise<Book | undefined> {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", slug)
    .single();

  if (error || !data) return undefined;

  return {
    slug: data.id,
    title: data.title,
    author: data.author,
    genre: data.genre || "Ficção",
    mood: data.tropes || ["Reflexivo"],
    rating: data.rating || 4.5,
    pages: data.pages || 300,
    year: data.year || 2024,
    cover: data.cover || "linear-gradient(135deg, #024a10 0%, #036c17 100%)",
    accent: data.accent || "#e87305",
    synopsis: data.synopsis || "Sinopse não disponível.",
    why: data.why || "Recomendação baseada no seu perfil."
  };
}
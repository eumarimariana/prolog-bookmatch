import { supabase } from "./supabase";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const isSupabaseConfigured = SUPABASE_URL.startsWith("https://");

/** Wraps a promise with a hard timeout — prevents Supabase from hanging forever */
function withTimeout<T>(promise: Promise<T>, ms = 3000): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Supabase timeout")), ms)
  );
  return Promise.race([promise, timeout]);
}

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

// Capas via Open Library Covers API: https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg
export const DEFAULT_BOOKS: Book[] = [
  {
    slug: "dom-casmurro",
    title: "Dom Casmurro",
    author: "Machado de Assis",
    genre: "Romance",
    mood: ["Reflexivo", "Melancólico", "Íntimo"],
    rating: 4.8,
    pages: 256,
    year: 1899,
    cover: "https://covers.openlibrary.org/b/isbn/9788535910070-L.jpg",
    accent: "#facc15",
    synopsis: "Um dos maiores clássicos da literatura brasileira: a dúvida de Bentinho sobre a fidelidade de Capitu, narrada pelo ciúme e pela memória.",
    why: "Recomendado por inferência lógica de tropos reflexivos e melancólicos."
  },
  {
    slug: "o-alquimista",
    title: "O Alquimista",
    author: "Paulo Coelho",
    genre: "Ficção",
    mood: ["Aventura", "Poético", "Espiritual"],
    rating: 4.6,
    pages: 208,
    year: 1988,
    cover: "https://covers.openlibrary.org/b/isbn/9788531611612-L.jpg",
    accent: "#c084fc",
    synopsis: "A jornada mágica do jovem pastor Santiago em busca de seu tesouro e de seu destino pessoal.",
    why: "Jornada transformadora e inspiradora, lida em mais de 80 países."
  },
  {
    slug: "1984",
    title: "1984",
    author: "George Orwell",
    genre: "Distopia",
    mood: ["Denso", "Misterioso", "Reflexivo"],
    rating: 4.9,
    pages: 328,
    year: 1949,
    cover: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
    accent: "#ef4444",
    synopsis: "Em um regime totalitário que reescreve a história, Winston Smith tenta resistir ao Grande Irmão e encontrar a verdade.",
    why: "Obra prima da ficção distópica, mais atual do que nunca."
  },
  {
    slug: "torto-arado",
    title: "Torto Arado",
    author: "Itamar Vieira Junior",
    genre: "Ficção",
    mood: ["Reflexivo", "Denso", "Família"],
    rating: 4.9,
    pages: 264,
    year: 2019,
    cover: "https://covers.openlibrary.org/b/isbn/9788551003220-L.jpg",
    accent: "#10b981",
    synopsis: "A história de Bibiana e Belonísia, duas irmãs no sertão baiano cujas vidas são marcadas por um segredo e pela luta por terra.",
    why: "Maior fenômeno da literatura brasileira contemporânea."
  },
  {
    slug: "pequeno-principe",
    title: "O Pequeno Príncipe",
    author: "Antoine de Saint-Exupéry",
    genre: "Fábula",
    mood: ["Poético", "Reflexivo", "Aventura"],
    rating: 4.8,
    pages: 96,
    year: 1943,
    cover: "https://covers.openlibrary.org/b/isbn/9788535902778-L.jpg",
    accent: "#f59e0b",
    synopsis: "Um aviador perdido no deserto encontra um pequeno príncipe vindo de outro planeta, e com ele aprende sobre o essencial da vida.",
    why: "O livro mais lido do mundo após a Bíblia — atemporal e poético."
  },
  {
    slug: "memorias-postumas",
    title: "Memórias Póstumas de Brás Cubas",
    author: "Machado de Assis",
    genre: "Romance",
    mood: ["Irônico", "Filosófico", "Reflexivo"],
    rating: 4.7,
    pages: 270,
    year: 1881,
    cover: "https://covers.openlibrary.org/b/isbn/9788535914290-L.jpg",
    accent: "#8b5cf6",
    synopsis: "Um defunto autor narra suas memórias com ironia e cinismo, explorando a condição humana e as hipocrisias da sociedade.",
    why: "Marco do realismo brasileiro, narrado por um morto com humor único."
  },
  {
    slug: "100-anos-de-solidao",
    title: "Cem Anos de Solidão",
    author: "Gabriel García Márquez",
    genre: "Realismo Mágico",
    mood: ["Épico", "Poético", "Família"],
    rating: 4.9,
    pages: 448,
    year: 1967,
    cover: "https://covers.openlibrary.org/b/isbn/9788501012043-L.jpg",
    accent: "#f97316",
    synopsis: "A saga da família Buendía ao longo de sete gerações na cidade mítica de Macondo — uma das maiores obras da literatura mundial.",
    why: "Ganhador do Nobel, obra fundadora do realismo mágico."
  },
  {
    slug: "a-menina-que-roubava-livros",
    title: "A Menina que Roubava Livros",
    author: "Markus Zusak",
    genre: "Ficção Histórica",
    mood: ["Melancólico", "Família", "Reflexivo"],
    rating: 4.8,
    pages: 560,
    year: 2005,
    cover: "https://covers.openlibrary.org/b/isbn/9788535918342-L.jpg",
    accent: "#64748b",
    synopsis: "Narrado pela Morte, conta a história de Liesel, uma garota na Alemanha nazista que encontra refúgio nos livros roubados.",
    why: "Beleza e dor em igual medida — uma história inesquecível."
  },
];


// Função assíncrona para buscar todos os livros do Supabase mantendo o formato visual
export async function getBooks(): Promise<Book[]> {
  // Se Supabase não estiver configurado, retorna imediatamente com dados padrão
  if (!isSupabaseConfigured) return DEFAULT_BOOKS;

  try {
    const { data, error } = await withTimeout(
      Promise.resolve(supabase.from("books").select("*")),
      3000
    );
    
    if (error || !data || data.length === 0) {
      return DEFAULT_BOOKS;
    }

    return data.map((b: any) => ({
      slug: b.id || b.slug || b.title.toLowerCase().replace(/\s+/g, "-"),
      title: b.title,
      author: b.author || "Autor Desconhecido",
      genre: b.genre || "Ficção",
      mood: b.tropes || b.mood || ["Reflexivo"],
      rating: b.rating || 4.5,
      pages: b.pages || 300,
      year: b.year || 2024,
      cover: b.cover_url || b.cover || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
      accent: b.accent || "#facc15",
      synopsis: b.synopsis || "Sinopse não disponível.",
      why: b.why || "Recomendação baseada no seu perfil."
    }));
  } catch (err) {
    return DEFAULT_BOOKS;
  }
}

// Função para buscar um livro específico pelo slug/ID na página de detalhes
export async function getBook(slug: string): Promise<Book | undefined> {
  if (!isSupabaseConfigured) {
    return DEFAULT_BOOKS.find((b) => b.slug === slug) || DEFAULT_BOOKS[0];
  }
  try {
    const { data, error } = await withTimeout(
      Promise.resolve(supabase.from("books").select("*").eq("id", slug).single()),
      3000
    );

    if (error || !data) {
      return DEFAULT_BOOKS.find((b) => b.slug === slug || b.title.toLowerCase() === slug.toLowerCase()) || DEFAULT_BOOKS[0];
    }

    return {
      slug: data.id || slug,
      title: data.title,
      author: data.author,
      genre: data.genre || "Ficção",
      mood: data.tropes || ["Reflexivo"],
      rating: data.rating || 4.5,
      pages: data.pages || 300,
      year: data.year || 2024,
      cover: data.cover_url || data.cover || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&q=80",
      accent: data.accent || "#facc15",
      synopsis: data.synopsis || "Sinopse não disponível.",
      why: data.why || "Recomendação baseada no seu perfil."
    };
  } catch {
    return DEFAULT_BOOKS[0];
  }
}
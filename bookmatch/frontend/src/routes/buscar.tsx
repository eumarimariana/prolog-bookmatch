import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { BookCard } from "@/components/book-card";
import { getBooks, type Book } from "@/lib/books-data";
import { Search, SlidersHorizontal } from "lucide-react";

export const Route = createFileRoute("/buscar")({
  head: () => ({
    meta: [
      { title: "Buscar livros | Estante" },
      { name: "description", content: "Busque por título, autor ou gênero. Filtre por humor, tamanho e nota." },
    ],
  }),
  component: BuscarPage,
});

function BuscarPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<"rating" | "recent" | "short">("rating");

  useEffect(() => {
    async function loadCatalog() {
      const data = await getBooks();
      setBooks(data);
      setLoading(false);
    }
    loadCatalog();
  }, []);

  const genres = useMemo(() => Array.from(new Set(books.map((b) => b.genre))), [books]);
  const allMoods = useMemo(() => Array.from(new Set(books.flatMap((b) => b.mood))), [books]);

  const filtered = useMemo(() => {
    let list = books.filter((b) => {
      const matchQ =
        !q ||
        b.title.toLowerCase().includes(q.toLowerCase()) ||
        b.author.toLowerCase().includes(q.toLowerCase());
      const matchG = !genre || b.genre === genre;
      const matchM = !mood || b.mood.includes(mood);
      const matchR = b.rating >= minRating;
      return matchQ && matchG && matchM && matchR;
    });
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "recent") list = [...list].sort((a, b) => b.year - a.year);
    if (sort === "short") list = [...list].sort((a, b) => a.pages - b.pages);
    return list;
  }, [q, genre, mood, minRating, sort, books]);

  return (
    <div className="min-h-screen">
      <SiteNav />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Catálogo</p>
            <h1 className="mt-2 font-display text-5xl text-primary">Buscar</h1>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Título ou autor…"
              className="w-full rounded-full border border-input bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-[240px_1fr]">
          {/* Filters */}
          <aside className="space-y-6 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <SlidersHorizontal className="h-4 w-4" />
              Filtros
            </div>

            <FilterGroup title="Gênero">
              <FilterList
                options={genres}
                value={genre}
                onChange={setGenre}
              />
            </FilterGroup>

            <FilterGroup title="Humor">
              <FilterList options={allMoods} value={mood} onChange={setMood} />
            </FilterGroup>

            <FilterGroup title={`Nota mínima: ${minRating.toFixed(1)}`}>
              <input
                type="range"
                min={0}
                max={5}
                step={0.1}
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full accent-[color:var(--brand-purple)]"
              />
            </FilterGroup>

            <button
              onClick={() => {
                setQ("");
                setGenre(null);
                setMood(null);
                setMinRating(0);
              }}
              className="w-full rounded-full border border-border py-2 text-xs text-muted-foreground hover:bg-muted"
            >
              Limpar filtros
            </button>
          </aside>

          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{filtered.length}</span> resultado(s)
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-full border border-input bg-background px-3 py-2 text-xs"
              >
                <option value="rating">Melhor avaliados</option>
                <option value="recent">Mais recentes</option>
                <option value="short">Mais curtos</option>
              </select>
            </div>

            {loading ? (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
                Carregando catálogo do Supabase...
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
                Nenhum livro encontrado. Tente afrouxar os filtros.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                {filtered.map((b) => (
                  <BookCard key={b.slug} book={b} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-secondary">{title}</p>
      {children}
    </div>
  );
}

function FilterList({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(active ? null : o)}
            className={
              "rounded-lg px-3 py-1.5 text-left text-sm transition " +
              (active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted")
            }
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
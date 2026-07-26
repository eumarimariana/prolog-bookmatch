import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { BookCard } from "@/components/book-card";
import { getBooks, DEFAULT_BOOKS, type Book } from "@/lib/books-data";
import { searchOpenLibrary, importBookToProlog, type OpenLibraryBook } from "@/lib/api";
import { Search, SlidersHorizontal, Library, Loader2, Plus, Check } from "lucide-react";

export const Route = createFileRoute("/buscar")({
  head: () => ({
    meta: [
      { title: "Buscar livros | Estante" },
      { name: "description", content: "Busque por título ou autor na Open Library e filtre por humor, gênero e nota." },
    ],
  }),
  component: BuscarPage,
});

function BuscarPage() {
  const [localBooks, setLocalBooks] = useState<Book[]>(DEFAULT_BOOKS);

  // Campo de texto — apenas local, não dispara nada automaticamente
  const [inputValue, setInputValue] = useState("");
  // Query efetiva que foi submetida (Enter ou botão)
  const [submittedQuery, setSubmittedQuery] = useState("");

  const [genre, setGenre] = useState<string | null>(null);
  const [mood, setMood] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<"rating" | "recent" | "short">("rating");

  // Open Library results
  const [olResults, setOlResults] = useState<OpenLibraryBook[]>([]);
  const [olLoading, setOlLoading] = useState(false);
  const [olSearched, setOlSearched] = useState(false);
  const [importedSlugs, setImportedSlugs] = useState<Set<string>>(new Set());
  const [importingSlug, setImportingSlug] = useState<string | null>(null);

  // AbortController ref to cancel previous in-flight OL requests
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    getBooks().then((data) => {
      if (data && data.length > 0) setLocalBooks(data);
    }).catch(() => {});
  }, []);

  // Busca na Open Library APENAS quando submittedQuery muda (Enter ou botão)
  useEffect(() => {
    if (!submittedQuery || submittedQuery.length < 2) return;

    // Cancela request anterior se houver
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setOlLoading(true);
    setOlSearched(true);

    searchOpenLibrary(submittedQuery)
      .then((results) => {
        setOlResults(results);
      })
      .catch(() => {
        // Silently fail (backend down, timeout, etc.)
        setOlResults([]);
      })
      .finally(() => {
        setOlLoading(false);
      });
  }, [submittedQuery]);

  function handleSearch() {
    const q = inputValue.trim();
    if (q.length >= 2) {
      setSubmittedQuery(q);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") {
      setInputValue("");
      setSubmittedQuery("");
      setOlResults([]);
      setOlSearched(false);
    }
  }

  const genres = useMemo(() => Array.from(new Set(localBooks.map((b) => b.genre))), [localBooks]);
  const allMoods = useMemo(() => Array.from(new Set(localBooks.flatMap((b) => b.mood))), [localBooks]);

  const filtered = useMemo(() => {
    if (submittedQuery.length >= 2) return []; // Mostra OL results em vez do catálogo local
    let list = localBooks.filter((b) => {
      const matchQ =
        !inputValue ||
        b.title.toLowerCase().includes(inputValue.toLowerCase()) ||
        b.author.toLowerCase().includes(inputValue.toLowerCase());
      const matchG = !genre || b.genre === genre;
      const matchM = !mood || b.mood.includes(mood);
      const matchR = b.rating >= minRating;
      return matchQ && matchG && matchM && matchR;
    });
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "recent") list = [...list].sort((a, b) => b.year - a.year);
    if (sort === "short") list = [...list].sort((a, b) => a.pages - b.pages);
    return list;
  }, [inputValue, submittedQuery, genre, mood, minRating, sort, localBooks]);

  async function handleImport(book: OpenLibraryBook) {
    const key = book.open_library_key || book.title;
    setImportingSlug(key);
    try {
      await importBookToProlog({
        title: book.title,
        author: book.author,
        cover_url: book.cover_url,
        genres: book.genres,
      });
      setImportedSlugs((prev) => new Set(prev).add(key));
    } catch {
      // silently fail
    } finally {
      setImportingSlug(null);
    }
  }

  const isShowingOL = submittedQuery.length >= 2;

  return (
    <div className="min-h-screen">
      <SiteNav />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">Catálogo</p>
            <h1 className="mt-2 font-display text-5xl text-primary">Buscar</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pesquise na{" "}
              <span className="font-semibold text-primary">Open Library</span> — pressione{" "}
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">Enter</kbd>{" "}
              para buscar
            </p>
          </div>

          {/* Search bar */}
          <div className="flex w-full items-center gap-2 md:w-auto">
            <div className="relative flex-1 md:w-96">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Título, autor… (Enter para buscar)"
                className="w-full rounded-full border border-input bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={inputValue.trim().length < 2 || olLoading}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-md disabled:opacity-40 hover:bg-purple-700 active:scale-95 transition-all"
            >
              {olLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Buscar
            </button>
            {isShowingOL && (
              <button
                onClick={() => {
                  setInputValue("");
                  setSubmittedQuery("");
                  setOlResults([]);
                  setOlSearched(false);
                }}
                className="rounded-full border border-border px-4 py-3 text-xs font-medium text-muted-foreground hover:bg-muted"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-[240px_1fr]">
          {/* Filters */}
          <aside className="h-fit space-y-6 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <SlidersHorizontal className="h-4 w-4" />
              {isShowingOL ? "Buscando na Open Library" : "Filtros"}
            </div>

            {isShowingOL ? (
              <div className="rounded-xl bg-purple-50 p-3 text-xs text-purple-700">
                <p className="font-semibold">Open Library ativa</p>
                <p className="mt-1 text-purple-600/80">
                  Clique em "Limpar" para voltar ao catálogo local com filtros.
                </p>
              </div>
            ) : (
              <>
                <FilterGroup title="Gênero">
                  <FilterList options={genres} value={genre} onChange={setGenre} />
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
                  onClick={() => { setInputValue(""); setGenre(null); setMood(null); setMinRating(0); }}
                  className="w-full rounded-full border border-border py-2 text-xs text-muted-foreground hover:bg-muted"
                >
                  Limpar filtros
                </button>
              </>
            )}
          </aside>

          {/* Results */}
          <div>
            {isShowingOL ? (
              <div>
                <div className="mb-5 flex items-center gap-2.5">
                  <Library className="h-5 w-5 text-primary" />
                  <p className="text-sm font-semibold text-foreground">
                    Open Library
                    <span className="ml-1 font-normal text-muted-foreground">
                      {olLoading ? "— buscando..." : `— ${olResults.length} resultado(s) para "${submittedQuery}"`}
                    </span>
                  </p>
                </div>

                {olLoading ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="aspect-[2/3] w-full rounded-xl bg-purple-100" />
                        <div className="mt-2 h-3 rounded bg-purple-100" />
                        <div className="mt-1 h-2 w-2/3 rounded bg-purple-50" />
                      </div>
                    ))}
                  </div>
                ) : olResults.length === 0 && olSearched ? (
                  <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
                    Nenhum livro encontrado para "{submittedQuery}".
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                    {olResults.map((book) => {
                      const key = book.open_library_key || book.title;
                      const imported = importedSlugs.has(key);
                      const importing = importingSlug === key;
                      return (
                        <div key={key} className="group flex flex-col">
                          <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-purple-900 shadow-md">
                            <img
                              src={book.cover_url}
                              alt={book.title}
                              className="h-full w-full object-cover"
                              loading="lazy"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                            <button
                              onClick={() => handleImport(book)}
                              disabled={imported || importing}
                              title={imported ? "Já indexado no Prolog" : "Importar para o Prolog"}
                              className={
                                "absolute bottom-2 right-2 grid h-8 w-8 place-items-center rounded-full backdrop-blur-sm shadow transition active:scale-90 " +
                                (imported ? "bg-emerald-500 text-white" : "bg-purple-600 text-white hover:bg-purple-700")
                              }
                            >
                              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : imported ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                            </button>
                          </div>
                          <div className="mt-2">
                            <p className="line-clamp-2 text-sm font-semibold leading-tight">{book.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{book.author}</p>
                            {book.first_publish_year && (
                              <p className="mt-0.5 text-[10px] text-muted-foreground">{book.first_publish_year}</p>
                            )}
                            {book.genres.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {book.genres.slice(0, 2).map((g) => (
                                  <span key={g} className="rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-medium text-purple-700">
                                    {g}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{filtered.length}</span> livro(s) no catálogo
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
                {filtered.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
                    Nenhum livro. Tente afrouxar os filtros ou pesquise na Open Library.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
                    {filtered.map((b) => (
                      <BookCard key={b.slug} book={b} />
                    ))}
                  </div>
                )}
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

function FilterList({ options, value, onChange }: { options: string[]; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div className="flex flex-col gap-1">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(active ? null : o)}
            className={"rounded-lg px-3 py-1.5 text-left text-sm transition " + (active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted")}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
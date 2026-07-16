import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { BookCard } from "@/components/book-card";
import { getBooks, type Book } from "@/lib/books-data";
import { BookOpen, Bookmark, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({
    meta: [
      { title: "Minha estante | Estante" },
      { name: "description", content: "Seus livros salvos, lendo e lidos em um só lugar." },
    ],
  }),
  component: Library,
});

function Library() {
  const [tab, setTab] = useState<"reading" | "wishlist" | "read">("reading");
  const [booksList, setBooksList] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserLibrary() {
      const data = await getBooks();
      if (data.length > 0) {
        setBooksList(data);
      }
      setLoading(false);
    }
    loadUserLibrary();
  }, []);

  // Organiza dinamicamente os livros vindos do Supabase nas abas
  const tabs = [
    { id: "reading", label: "Lendo agora", icon: BookOpen, items: booksList.slice(0, 1) },
    { id: "wishlist", label: "Quero ler", icon: Bookmark, items: booksList.slice(1, 4) },
    { id: "read", label: "Já lidos", icon: CheckCircle2, items: booksList.slice(4) },
  ] as const;

  const active = tabs.find((t) => t.id === tab)!;

  const stats = [
    { label: "Livros lidos", value: 24 },
    { label: "Este ano", value: 7 },
    { label: "Páginas", value: "6.482" },
    { label: "Autores", value: 19 },
  ];

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* Profile header */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(120deg, var(--brand-purple-deep), var(--brand-brown))" }}
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 text-primary-foreground md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-5">
            <span
              className="grid h-20 w-20 place-items-center rounded-full font-display text-3xl font-semibold"
              style={{ background: "var(--brand-yellow)", color: "var(--brand-purple-deep)" }}
            >
              L
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                Perfil
              </p>
              <h1 className="mt-1 font-display text-4xl md:text-5xl">Laura Ribeiro</h1>
              <p className="mt-1 text-primary-foreground/70">Lendo desde 2019 · São Paulo, BR</p>
            </div>
          </div>
          <Link
            to="/descobrir"
            className="inline-flex items-center gap-2 self-start rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground md:self-auto"
          >
            Nova recomendação
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-6xl px-6 -mt-10">
        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-lg md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-muted/50 p-4 text-center">
              <p className="font-display text-3xl text-primary">{s.value}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-wrap gap-2 border-b border-border">
          {tabs.map((t) => {
            const isActive = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={
                  "-mb-px inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition " +
                  (isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground")
                }
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                <span
                  className={
                    "rounded-full px-2 py-0.5 text-[10px] " +
                    (isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")
                  }
                >
                  {t.items.length}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="py-16 text-center text-muted-foreground">Carregando estante do Supabase...</div>
          ) : active.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
              Nada por aqui ainda.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {active.items.map((b) => (
                <BookCard key={b.slug} book={b} />
              ))}
            </div>
          )}
        </div>

        {/* Reading goal */}
        <div className="mt-16 rounded-3xl border border-border bg-card p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
                Meta de leitura 2026
              </p>
              <h3 className="mt-2 font-display text-3xl text-primary">
                7 <span className="text-muted-foreground">de 20 livros</span>
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">35% · você está no ritmo</p>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{ width: "35%", background: "linear-gradient(90deg, var(--brand-purple), var(--brand-yellow))" }}
            />
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
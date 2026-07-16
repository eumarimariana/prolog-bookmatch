import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { BookCard, BookCover } from "@/components/book-card";
import { getBook, getBooks, type Book } from "@/lib/books-data";
import { ArrowLeft, BookmarkPlus, Check, Share2, Star } from "lucide-react";

export const Route = createFileRoute("/livro/$slug")({
  loader: async ({ params }) => {
    const book = await getBook(params.slug);
    if (!book) throw notFound();
    return { book };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.book.title} — ${loaderData.book.author} | Estante` },
          { name: "description", content: loaderData.book.synopsis },
          { property: "og:title", content: `${loaderData.book.title} — ${loaderData.book.author}` },
          { property: "og:description", content: loaderData.book.synopsis },
        ]
      : [{ title: "Livro não encontrado | Estante" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="min-h-screen">
      <SiteNav />
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl text-primary">Livro não encontrado</h1>
        <Link to="/buscar" className="mt-6 inline-block text-primary hover:underline">
          ← Voltar para busca
        </Link>
      </div>
    </div>
  ),
  component: BookDetail,
});

function BookDetail() {
  const { book } = Route.useLoaderData();
  const [similar, setSimilar] = useState<Book[]>([]);

  useEffect(() => {
    async function loadSimilarBooks() {
      const allBooks = await getBooks();
      const filtered = allBooks.filter((b) => b.slug !== book.slug).slice(0, 4);
      setSimilar(filtered);
    }
    loadSimilarBooks();
  }, [book.slug]);

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* Hero */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, var(--brand-purple-deep), var(--brand-brown))" }}
      >
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[280px_1fr] md:py-24">
          <div>
            <Link
              to="/buscar"
              className="mb-6 inline-flex items-center gap-1 text-sm text-primary-foreground/70 hover:text-primary-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
            <BookCover book={book} />
          </div>
          <div className="text-primary-foreground">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: book.accent }}>
              {book.genre}
            </p>
            <h1 className="mt-3 font-display text-5xl leading-tight md:text-6xl">{book.title}</h1>
            <p className="mt-2 text-lg text-primary-foreground/80">por {book.author}</p>

            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-primary-foreground/80">
              <span className="inline-flex items-center gap-1">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-semibold text-primary-foreground">{book.rating.toFixed(1)}</span> / 5
              </span>
              <span>{book.pages} páginas</span>
              <span>{book.year}</span>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {book.mood.map((m: string) => (
                <span
                  key={m}
                  className="rounded-full bg-white/10 px-3 py-1 text-xs backdrop-blur"
                >
                  {m}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground">
                <BookmarkPlus className="h-4 w-4" />
                Quero ler
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm text-primary-foreground hover:bg-white/10">
                <Check className="h-4 w-4" />
                Já li
              </button>
              <button className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm text-primary-foreground hover:bg-white/10">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:grid-cols-[1fr_280px]">
        <div>
          <h2 className="font-display text-3xl text-primary">Sinopse</h2>
          <p className="mt-4 text-lg leading-relaxed text-foreground/80">{book.synopsis}</p>

          <div className="mt-10 rounded-2xl border border-accent/40 bg-accent/15 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Por que recomendamos
            </p>
            <p className="mt-2 font-display text-xl text-foreground">{book.why}</p>
          </div>

          <h2 className="mt-14 font-display text-3xl text-primary">O que os leitores dizem</h2>
          <div className="mt-6 space-y-4">
            {[
              { name: "Marina", text: "Li em dois dias. Aquele tipo de livro que muda o humor da semana." },
              { name: "Rafael", text: "A escrita é linda demais, precisei parar pra copiar frases." },
            ].map((r) => (
              <div key={r.name} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                    {r.name[0]}
                  </span>
                  <span className="text-sm font-medium">{r.name}</span>
                </div>
                <p className="mt-3 text-sm text-foreground/80">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Ficha técnica
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <Info label="Autor" value={book.author} />
              <Info label="Ano" value={String(book.year)} />
              <Info label="Páginas" value={String(book.pages)} />
              <Info label="Gênero" value={book.genre} />
            </dl>
          </div>
        </aside>
      </section>

      {/* Similar */}
      <section className="mx-auto max-w-6xl px-6 pb-8">
        <h2 className="font-display text-3xl text-primary">Se gostou, leia também</h2>
        <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          {similar.map((b) => (
            <BookCard key={b.slug} book={b} />
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { BookCard, BookCover } from "@/components/book-card";
import { getBooks, type Book } from "@/lib/books-data";
import { ArrowRight, Sparkles, Compass, Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const [booksList, setBooksList] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      const data = await getBooks();
      setBooksList(data);
      setLoading(false);
    }
    loadHomeData();
  }, []);

  const featured = booksList[0];
  const rest = booksList.slice(1, 5);

  const moods = [
    { label: "Reflexivo", color: "oklch(0.38 0.14 305)" },
    { label: "Aventura", color: "oklch(0.42 0.07 55)" },
    { label: "Melancólico", color: "oklch(0.5 0.15 305)" },
    { label: "Divertido", color: "oklch(0.83 0.16 88)" },
    { label: "Poético", color: "oklch(0.42 0.07 55)" },
    { label: "Misterioso", color: "oklch(0.28 0.11 305)" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <div className="flex h-[60vh] items-center justify-center text-muted-foreground">
          Carregando a Estante do Supabase...
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--brand-yellow)" }}
        />
        <div
          aria-hidden
          className="absolute -left-24 top-40 h-72 w-72 rounded-full opacity-25 blur-3xl"
          style={{ background: "var(--brand-purple)" }}
        />
        <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-16 md:grid-cols-[1.15fr_1fr] md:pt-24">
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Recomendação personalizada
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight text-primary md:text-7xl">
              O próximo livro <em className="italic text-secondary">certo</em> pra você está a uma conversa de distância.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              Nos conte seu humor, o que você acabou de ler e quanto tempo você tem.
              A Estante monta uma lista feita à mão, sem algoritmo genérico.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/descobrir"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5"
              >
                Recomende um livro pra mim
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/buscar"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-foreground hover:bg-muted"
              >
                Explorar catálogo
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-2">
              {moods.map((m) => (
                <span
                  key={m.label}
                  className="rounded-full px-3 py-1 text-xs font-medium"
                  style={{ backgroundColor: `color-mix(in oklab, ${m.color} 15%, transparent)`, color: m.color }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            {booksList[2] && (
              <div className="absolute -left-6 top-8 hidden rotate-[-6deg] md:block">
                <BookCover book={booksList[2]} className="w-40" />
              </div>
            )}
            {booksList[3] && (
              <div className="absolute -right-4 top-24 hidden rotate-[8deg] md:block">
                <BookCover book={booksList[3]} className="w-40" />
              </div>
            )}
            {featured && (
              <div className="relative mx-auto w-56 md:w-64">
                <BookCover book={featured} />
                <div className="absolute -bottom-6 left-1/2 w-64 -translate-x-1/2 rounded-2xl border border-border bg-card p-4 shadow-xl">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-secondary">
                    Escolhido para você
                  </p>
                  <p className="mt-1 font-display text-base leading-tight">{featured.title}</p>
                  <p className="text-xs text-muted-foreground">{featured.why}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto mt-16 max-w-6xl px-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Heart,
              title: "1. Diga o que você sente",
              text: "Humor, ritmo, tema, tamanho — a gente escuta antes de sugerir.",
            },
            {
              icon: Compass,
              title: "2. Receba uma lista curada",
              text: "3 a 5 títulos escolhidos por leitores de verdade, não por métrica.",
            },
            {
              icon: Sparkles,
              title: "3. Guarde na sua estante",
              text: "Marque como lendo, lido ou pra depois — e refine o próximo pedido.",
            },
          ].map((step) => (
            <div key={step.title} className="rounded-2xl border border-border bg-card p-6">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl text-primary">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* RECOMMENDED */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
              Recomendações da semana
            </p>
            <h2 className="mt-2 font-display text-4xl text-primary">Para começar bem</h2>
          </div>
          <Link to="/buscar" className="text-sm font-medium text-primary hover:underline">
            Ver tudo →
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
          {rest.map((b) => (
            <BookCard key={b.slug} book={b} />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-6xl px-6">
        <div
          className="overflow-hidden rounded-3xl px-8 py-14 text-center md:px-16"
          style={{ background: "linear-gradient(120deg, var(--brand-purple-deep), var(--brand-brown))" }}
        >
          <h2 className="font-display text-4xl text-primary-foreground md:text-5xl">
            Sem ideia do que ler hoje?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Descreva o livro dos seus sonhos em uma frase. Devolvemos três sugestões em segundos.
          </p>
          <Link
            to="/descobrir"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground shadow-xl"
          >
            Começar minha recomendação
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
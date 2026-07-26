import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { BookCard, BookCover } from "@/components/book-card";
import { getBooks, DEFAULT_BOOKS, type Book } from "@/lib/books-data";
import { recommendByGenre } from "@/lib/api";
import { getLocalProfile, type LocalProfile } from "@/lib/user-store";
import { OnboardingModal } from "@/components/onboarding-modal";
import {
  ArrowRight,
  Sparkles,
  Compass,
  Heart,
  Loader2,
  Wand2,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Estante — Recomendações de livros feitas para você" },
      {
        name: "description",
        content:
          "Descubra seu próximo livro favorito com recomendações personalizadas pelo motor Prolog.",
      },
    ],
  }),
  component: Home,
});

const QUICK_GENRES = ["fantasia", "distopia", "romance", "mistério"];

function Home() {
  const [booksList, setBooksList] = useState<Book[]>(DEFAULT_BOOKS);

  // Inicializa SINCRONAMENTE — sem useEffect, sem re-render, sem perder foco no input
  const [localProfile, setLocalProfile] = useState<LocalProfile>(() => getLocalProfile());
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Recomendação rápida da home
  const [quickGenre, setQuickGenre] = useState("fantasia");
  const [quickResults, setQuickResults] = useState<string[]>([]);
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickSearched, setQuickSearched] = useState(false);

  useEffect(() => {
    // Só carrega livros em background — perfil já foi lido sincronamente
    getBooks().then((data) => {
      if (data && data.length > 0) setBooksList(data);
    }).catch(() => {});
  }, []);

  function handleOnboardingComplete(profile: LocalProfile) {
    setLocalProfile(profile);
    setShowOnboarding(false);
  }

  // Filtra os livros pelos gêneros favoritos do perfil
  const favoriteGenres = localProfile.favoriteGenres ?? [];
  const profileDone = localProfile.onboardingDone;

  const personalizedBooks = useMemo(() => {
    if (favoriteGenres.length === 0) return booksList;
    // Prioriza livros cujo gênero bate com os favoritos, coloca o resto depois
    const matched = booksList.filter((b) =>
      favoriteGenres.some((g) => b.genre.toLowerCase().includes(g.toLowerCase()) || g.toLowerCase().includes(b.genre.toLowerCase()))
    );
    const rest = booksList.filter((b) => !matched.includes(b));
    return [...matched, ...rest];
  }, [booksList, favoriteGenres]);

  const featured = personalizedBooks[0];
  const rest = personalizedBooks.slice(1, 5);

  // Agrupa por gêneros favoritos para a seção "Para você"
  const genreGroups = useMemo(() => {
    if (favoriteGenres.length === 0) return [];
    return favoriteGenres.slice(0, 3).map((genre) => ({
      genre,
      books: booksList.filter((b) =>
        b.genre.toLowerCase().includes(genre.toLowerCase()) || genre.toLowerCase().includes(b.genre.toLowerCase())
      ).slice(0, 4),
    })).filter((g) => g.books.length > 0);
  }, [booksList, favoriteGenres]);

  const quickBooks = booksList.filter((b) =>
    quickResults.some((r) => r.toLowerCase() === b.title.toLowerCase())
  );

  async function handleQuickRecommend(g: string) {
    setQuickLoading(true);
    setQuickSearched(true);
    try {
      const data = await recommendByGenre(g);
      setQuickResults(data.recommendations);
    } catch {
      setQuickResults([]);
    } finally {
      setQuickLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Onboarding modal — só abre quando o usuário clica, não bloqueia automaticamente */}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Soft background ambient glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-40 blur-3xl"
          style={{ background: "#fef08a" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-20 h-80 w-80 rounded-full opacity-30 blur-3xl"
          style={{ background: "#e9d5ff" }}
        />
        <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1.15fr_1fr]">
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-purple-300/60 bg-purple-100/80 px-4 py-1.5 text-xs font-semibold text-purple-700 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              {profileDone ? `Olá, ${localProfile.name}! 👋` : "Recomendação personalizada"}
            </span>
            <h1 className="mt-6 font-display text-5xl leading-[0.98] tracking-tight text-primary md:text-6xl lg:text-7xl">
              {favoriteGenres.length > 0 ? (
                <>
                  Os melhores de{" "}
                  <em className="italic font-serif text-[#6b3a19]">{favoriteGenres[0]}</em>{" "}
                  escolhidos para você.
                </>
              ) : (
                <>
                  O próximo livro{" "}
                  <em className="italic font-serif text-[#6b3a19]">certo</em> pra você está a
                  uma conversa de distância.
                </>
              )}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-[#6b3a19]/80 md:text-lg">
              Nos conte seu humor, o que você acabou de ler e quanto tempo você
              tem. A Estante monta uma lista feita à mão, sem algoritmo genérico.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <Link
                to="/descobrir"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-bold text-primary-foreground shadow-xl shadow-purple-600/30 transition-all hover:scale-105 active:scale-95"
              >
                Recomende um livro pra mim
                <ArrowRight className="h-4 w-4" />
              </Link>

              {profileDone ? (
                /* Usuário já tem perfil — botão vai pra estante */
                <Link
                  to="/biblioteca"
                  className="inline-flex items-center gap-2 rounded-full border border-purple-300 bg-purple-50 px-7 py-3.5 text-sm font-bold text-purple-700 shadow-sm transition-all hover:bg-purple-100"
                >
                  <Heart className="h-4 w-4" />
                  Minha estante
                </Link>
              ) : (
                /* Usuário sem perfil — abre onboarding */
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-amber-50/90 px-7 py-3.5 text-sm font-bold text-amber-950 shadow-sm transition-all hover:bg-amber-100"
                >
                  <Sparkles className="h-4 w-4" />
                  Configurar meu perfil
                </button>
              )}
            </div>

            <div className="mt-10 flex flex-wrap gap-2.5">
              {[
                { label: "Reflexivo", bg: "#e9d5ff", color: "#6b21a8" },
                { label: "Aventura", bg: "#fef3c7", color: "#92400e" },
                { label: "Melancólico", bg: "#fae8ff", color: "#86198f" },
                { label: "Divertido", bg: "#fef08a", color: "#854d0e" },
                { label: "Poético", bg: "#ede9fe", color: "#5b21b6" },
                { label: "Misterioso", bg: "#e2e8f0", color: "#334155" },
              ].map((m) => (
                <span
                  key={m.label}
                  className="rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm transition-all hover:scale-105"
                  style={{
                    backgroundColor: m.bg,
                    color: m.color,
                  }}
                >
                  {m.label}
                </span>
              ))}
            </div>
          </div>

          <div className="relative">
            {booksList[2] && (
              <div className="absolute -left-6 top-8 hidden rotate-[-6deg] transition-all hover:rotate-0 md:block">
                <BookCover book={booksList[2]} className="w-40" />
              </div>
            )}
            {booksList[3] && (
              <div className="absolute -right-4 top-24 hidden rotate-[8deg] transition-all hover:rotate-0 md:block">
                <BookCover book={booksList[3]} className="w-40" />
              </div>
            )}
            {featured && (
              <div className="relative mx-auto w-56 md:w-64">
                <BookCover book={featured} />
                <div className="absolute -bottom-6 left-1/2 w-64 -translate-x-1/2 rounded-2xl border border-amber-200/80 bg-amber-50/95 p-4 shadow-xl backdrop-blur-md">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#6b3a19]">
                    Escolhido para você
                  </p>
                  <p className="mt-1 font-display text-base font-bold leading-tight text-primary">
                    {featured.title}
                  </p>
                  <p className="mt-1 text-xs text-[#6b3a19]/80">{featured.why}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* QUICK RECOMMEND */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
        <div
          className="overflow-hidden rounded-3xl border border-border p-8 shadow-sm md:p-12"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in oklab, var(--brand-purple) 8%, var(--card)) 0%, color-mix(in oklab, var(--brand-yellow) 8%, var(--card)) 100%)",
          }}
        >
          <div className="flex flex-col gap-2">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-xs font-medium text-secondary">
              <Wand2 className="h-3.5 w-3.5" />
              Recomendação rápida
            </span>
            <h2 className="font-display text-3xl text-primary md:text-4xl">
              Teste agora: escolha um gênero
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              Veja o motor de inferência Prolog em ação direto na home.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {QUICK_GENRES.map((g) => {
              const active = quickGenre === g;
              return (
                <button
                  key={g}
                  onClick={() => setQuickGenre(g)}
                  className={
                    "rounded-full px-4 py-2 text-sm font-medium capitalize transition " +
                    (active
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "border border-border bg-card text-foreground hover:bg-muted")
                  }
                >
                  {g}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handleQuickRecommend(quickGenre)}
            disabled={quickLoading}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground shadow-md shadow-accent/30 transition-transform hover:-translate-y-0.5 disabled:opacity-60"
          >
            {quickLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Inferindo...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Recomendar
              </>
            )}
          </button>

          {quickSearched && !quickLoading && (
            <div className="mt-8">
              {quickBooks.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {quickBooks.map((b) => (
                    <BookCard key={b.slug} book={b} />
                  ))}
                </div>
              ) : quickResults.length > 0 ? (
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm font-medium text-foreground">
                    Títulos do Prolog:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {quickResults.map((r) => (
                      <li
                        key={r}
                        className="text-sm text-muted-foreground"
                      >
                        • {r}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum livro encontrado (o backend está rodando?).
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto mt-20 max-w-6xl px-6">
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
            <div
              key={step.title}
              className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground">
                <step.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-xl text-primary">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PERSONALIZED GENRE SECTIONS — shown when user has set favorite genres */}
      {genreGroups.length > 0 ? (
        <>
          {genreGroups.map(({ genre, books }) => (
            <section key={genre} className="mx-auto mt-20 max-w-6xl px-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
                    Porque você gosta de
                  </p>
                  <h2 className="mt-2 font-display text-4xl text-primary">{genre}</h2>
                </div>
                <Link to="/buscar" className="text-sm font-medium text-primary hover:underline">
                  Ver tudo →
                </Link>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
                {books.map((b) => (
                  <BookCard key={b.slug} book={b} />
                ))}
                {books.length === 0 && (
                  <p className="col-span-4 rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
                    Ainda não temos livros de {genre} — pesquise na{" "}
                    <Link to="/buscar" className="text-primary underline">Open Library</Link>.
                  </p>
                )}
              </div>
            </section>
          ))}
        </>
      ) : (
        /* RECOMMENDED — fallback genérico */
        <section className="mx-auto mt-20 max-w-6xl px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-secondary">
                Recomendações da semana
              </p>
              <h2 className="mt-2 font-display text-4xl text-primary">
                Para começar bem
              </h2>
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
      )}

      {/* CTA */}
      <section className="mx-auto mt-24 max-w-6xl px-6">
        <div
          className="overflow-hidden rounded-3xl border border-border px-8 py-14 text-center shadow-sm md:px-16"
          style={{
            background:
              "linear-gradient(135deg, var(--brand-purple-deep), var(--brand-brown))",
          }}
        >
          <h2 className="font-display text-4xl text-primary-foreground md:text-5xl">
            Sem ideia do que ler hoje?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Descreva o livro dos seus sonhos em uma frase. Devolvemos três
            sugestões em segundos.
          </p>
          <Link
            to="/descobrir"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-accent-foreground shadow-lg shadow-accent/30 transition-transform hover:-translate-y-0.5"
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
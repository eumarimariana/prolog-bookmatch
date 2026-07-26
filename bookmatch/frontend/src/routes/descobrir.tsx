import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { BookCard } from "@/components/book-card";
import { getBooks, type Book } from "@/lib/books-data";
import { recommendAdvanced } from "@/lib/api";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/descobrir")({
  head: () => ({
    meta: [
      { title: "Descobrir | Estante" },
      {
        name: "description",
        content:
          "Conte seu humor, temas e ritmo e receba recomendações personalizadas geradas pelo motor de inferência Prolog.",
      },
    ],
  }),
  component: DescobrirPage,
});

const MOOD_OPTIONS = [
  "Reflexivo",
  "Divertido",
  "Melancólico",
  "Aventura",
  "Poético",
  "Misterioso",
  "Íntimo",
  "Denso",
];

const THEME_OPTIONS = [
  "Amor",
  "Amizade",
  "Luto",
  "Distopia",
  "Família",
  "Viagem",
  "Trabalho",
  "Identidade",
];

const SIZE_OPTIONS = [
  { id: "curto", label: "Curto (< 250 pág)" },
  { id: "medio", label: "Médio" },
  { id: "longo", label: "Longo (> 400 pág)" },
];

const RHYTHM_OPTIONS = [
  { id: "contemplativo", label: "Contemplativo" },
  { id: "equilibrado", label: "Equilibrado" },
  { id: "rapido", label: "Página vira sozinha" },
];

function DescobrirPage() {
  const [allBooks, setAllBooks] = useState<Book[]>([]);

  // Form State
  const [prompt, setPrompt] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedSize, setSelectedSize] = useState<string>("medio");
  const [selectedRhythm, setSelectedRhythm] = useState<string>("equilibrado");

  // Results State
  const [results, setResults] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getBooks();
      setAllBooks(data);
    }
    load();
  }, []);

  function toggleMood(mood: string) {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  }

  function toggleTheme(theme: string) {
    setSelectedThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  }

  async function handleGenerateRecs() {
    setLoadingRecs(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await recommendAdvanced({
        prompt: prompt.trim() || undefined,
        moods: selectedMoods,
        themes: selectedThemes,
        size: selectedSize,
        rhythm: selectedRhythm,
      });

      setResults(response.recommendations || []);
    } catch (e: any) {
      setError(
        "Não foi possível conectar ao motor de recomendação Prolog. Verifique se a API backend está em execução."
      );
      setResults([]);
    } finally {
      setLoadingRecs(false);
    }
  }

  // Cruza os títulos retornados pelo Prolog com o catálogo completo do Supabase
  const recommendedBooks = allBooks.filter((b) =>
    results.some(
      (r) =>
        r.toLowerCase() === b.title.toLowerCase() ||
        b.title.toLowerCase().includes(r.toLowerCase())
    )
  );

  return (
    <div className="relative min-h-screen overflow-hidden">
      <SiteNav />

      {/* Purple Ambient Glowing Orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-purple-600/20 opacity-50 blur-3xl animate-pulse-glow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 top-80 h-96 w-96 rounded-full bg-indigo-500/20 opacity-40 blur-3xl animate-pulse-glow"
        style={{ animationDelay: "2s" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/3 bottom-20 h-80 w-80 rounded-full bg-purple-400/15 opacity-40 blur-3xl animate-pulse-glow"
        style={{ animationDelay: "1s" }}
      />

      {/* Header section */}
      <section className="relative z-10 overflow-hidden pt-12 pb-8 md:pt-16 md:pb-12 text-center px-6 animate-fade-in-up">
        <span className="inline-flex items-center gap-2 rounded-full border border-purple-300/80 bg-purple-100/80 px-4 py-1.5 text-xs font-bold text-purple-800 shadow-sm backdrop-blur-md mb-4">
          <Sparkles className="h-3.5 w-3.5 text-purple-600 animate-spin" style={{ animationDuration: "8s" }} />
          Motor de Inferência Prolog
        </span>
        <h1 className="font-display text-4xl font-bold tracking-tight text-primary md:text-5xl lg:text-6xl">
          Como você quer se sentir lendo?
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-base text-[#6b3a19]/80 md:text-lg">
          Preencha o que fizer sentido. Quanto mais detalhe, mais afiada fica a recomendação.
        </p>
      </section>

      {/* Main Recommendation Form */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-12 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <div className="rounded-3xl border border-purple-200/80 bg-[#fffdfa]/95 p-6 shadow-2xl shadow-purple-950/10 backdrop-blur-md md:p-10 transition-all hover:shadow-purple-950/15">
          
          {/* 1. Descreva em uma frase */}
          <div className="mb-8">
            <label htmlFor="prompt-input" className="block font-display text-xl font-bold text-primary mb-2">
              Descreva em uma frase
            </label>
            <div className="relative">
              <textarea
                id="prompt-input"
                rows={3}
                maxLength={400}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: quero um livro brasileiro, denso mas curto, que fale sobre memória e família..."
                className="w-full resize-none rounded-2xl border border-purple-200/70 bg-[#fcf8f2] p-4 text-sm text-[#4a2c11] placeholder:text-[#6b3a19]/50 focus:border-purple-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 shadow-inner"
              />
              <span className="absolute bottom-3 right-4 text-xs text-[#6b3a19]/60 font-semibold">
                {prompt.length}/400
              </span>
            </div>
          </div>

          {/* 2. Humor */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xl font-bold text-primary">Humor</h3>
              <span className="text-xs text-[#6b3a19]/70 font-semibold">Escolha um ou mais</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {MOOD_OPTIONS.map((mood) => {
                const isSelected = selectedMoods.includes(mood);
                return (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => toggleMood(mood)}
                    className={
                      "rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ease-out " +
                      (isSelected
                        ? "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white shadow-md shadow-purple-500/30 scale-[1.06] border-2 border-purple-400"
                        : "border border-purple-200/80 bg-[#fdfaf5] text-[#6b3a19] hover:border-purple-400 hover:bg-purple-50/60 hover:-translate-y-0.5")
                    }
                  >
                    {mood}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Temas */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xl font-bold text-primary">Temas</h3>
              <span className="text-xs text-[#6b3a19]/70 font-semibold">O que te chama hoje</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = selectedThemes.includes(theme);
                return (
                  <button
                    key={theme}
                    type="button"
                    onClick={() => toggleTheme(theme)}
                    className={
                      "rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ease-out " +
                      (isSelected
                        ? "bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-600 text-white shadow-md shadow-purple-500/30 scale-[1.06] border-2 border-purple-400"
                        : "border border-purple-200/80 bg-[#fdfaf5] text-[#6b3a19] hover:border-purple-400 hover:bg-purple-50/60 hover:-translate-y-0.5")
                    }
                  >
                    {theme}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Tamanho & Ritmo Grid */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            {/* Tamanho */}
            <div>
              <h3 className="font-display text-xl font-bold text-primary mb-3">Tamanho</h3>
              <div className="space-y-2.5">
                {SIZE_OPTIONS.map((size) => {
                  const isSelected = selectedSize === size.id;
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setSelectedSize(size.id)}
                      className={
                        "flex w-full items-center justify-between rounded-2xl p-3.5 text-sm font-semibold transition-all duration-300 " +
                        (isSelected
                          ? "border-2 border-purple-600 bg-purple-50/80 text-purple-950 shadow-sm font-bold scale-[1.01]"
                          : "border border-purple-100 bg-[#fcf8f2] text-[#6b3a19] hover:bg-purple-50/40 hover:border-purple-300")
                      }
                    >
                      <span>{size.label}</span>
                      <span
                        className={
                          "grid h-5 w-5 place-items-center rounded-full border transition-all duration-300 " +
                          (isSelected
                            ? "border-purple-600 bg-purple-600 text-white shadow-sm"
                            : "border-purple-300 bg-white")
                        }
                      >
                        {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ritmo */}
            <div>
              <h3 className="font-display text-xl font-bold text-primary mb-3">Ritmo</h3>
              <div className="space-y-2.5">
                {RHYTHM_OPTIONS.map((rhythm) => {
                  const isSelected = selectedRhythm === rhythm.id;
                  return (
                    <button
                      key={rhythm.id}
                      type="button"
                      onClick={() => setSelectedRhythm(rhythm.id)}
                      className={
                        "flex w-full items-center justify-between rounded-2xl p-3.5 text-sm font-semibold transition-all duration-300 " +
                        (isSelected
                          ? "border-2 border-purple-600 bg-purple-50/80 text-purple-950 shadow-sm font-bold scale-[1.01]"
                          : "border border-purple-100 bg-[#fcf8f2] text-[#6b3a19] hover:bg-purple-50/40 hover:border-purple-300")
                      }
                    >
                      <span>{rhythm.label}</span>
                      <span
                        className={
                          "grid h-5 w-5 place-items-center rounded-full border transition-all duration-300 " +
                          (isSelected
                            ? "border-purple-600 bg-purple-600 text-white shadow-sm"
                            : "border-purple-300 bg-white")
                        }
                      >
                        {isSelected && <span className="h-2 w-2 rounded-full bg-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit CTA */}
          <button
            onClick={handleGenerateRecs}
            disabled={loadingRecs}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 px-9 py-4 text-base font-bold text-white shadow-xl shadow-purple-600/35 transition-all duration-300 hover:scale-[1.03] hover:shadow-purple-600/50 hover:from-purple-500 hover:to-indigo-600 active:scale-95 disabled:opacity-60"
          >
            {loadingRecs ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Inferindo no Prolog...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 fill-white" />
                Gerar recomendações
              </>
            )}
          </button>

        </div>
      </section>

      {/* Results Section */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5 text-destructive animate-fade-in-up">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-bold">Aviso da API Prolog</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {!error && hasSearched && !loadingRecs && (
          <div className="animate-scale-in">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#6b3a19]">
                  Resultado da Inferência
                </span>
                <h2 className="mt-1 font-display text-3xl font-bold text-primary">
                  Livros Recomendados
                </h2>
                <p className="mt-1 text-sm text-[#6b3a19]/80">
                  {results.length > 0
                    ? `Encontrados ${results.length} resultado(s) no motor lógico Prolog`
                    : "Nenhum resultado direto para estes filtros. Tente selecionar outros humores."}
                </p>
              </div>
              <Link
                to="/buscar"
                className="text-sm font-bold text-primary hover:underline"
              >
                Ver catálogo completo →
              </Link>
            </div>

            {recommendedBooks.length > 0 ? (
              <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-4">
                {recommendedBooks.map((b) => (
                  <div key={b.slug} className="transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02]">
                    <BookCard book={b} />
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <div className="mt-8 rounded-2xl border border-purple-200 bg-white/90 p-6 shadow-md backdrop-blur-md">
                <p className="text-sm font-bold text-primary mb-3">
                  Títulos sugeridos pelas regras Prolog:
                </p>
                <ul className="space-y-2">
                  {results.map((r) => (
                    <li key={r} className="flex items-center gap-2.5 text-sm font-semibold text-[#4a2c11]">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  );
}
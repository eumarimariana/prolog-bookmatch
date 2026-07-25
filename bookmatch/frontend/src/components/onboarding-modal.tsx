import { useState } from "react";
import { BookOpen, ArrowRight, Check, Sparkles } from "lucide-react";
import { type LocalProfile, saveLocalProfile } from "@/lib/user-store";

const ALL_GENRES = [
  { label: "Fantasia", emoji: "🧙" },
  { label: "Ficção Científica", emoji: "🚀" },
  { label: "Romance", emoji: "💕" },
  { label: "Mistério", emoji: "🔍" },
  { label: "Terror", emoji: "👻" },
  { label: "Aventura", emoji: "🗺️" },
  { label: "Distopia", emoji: "🏙️" },
  { label: "Histórico", emoji: "📜" },
  { label: "Realismo Mágico", emoji: "✨" },
  { label: "Clássicos", emoji: "📚" },
  { label: "Autoajuda", emoji: "🌱" },
  { label: "Filosofia", emoji: "🧠" },
  { label: "Biografia", emoji: "👤" },
  { label: "Poesia", emoji: "🌸" },
  { label: "Suspense", emoji: "😱" },
  { label: "Literatura Brasileira", emoji: "🇧🇷" },
];

interface Props {
  onComplete: (profile: LocalProfile) => void;
}

export function OnboardingModal({ onComplete }: Props) {
  const [step, setStep] = useState<"name" | "genres">("name");
  const [name, setName] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  function toggleGenre(g: string) {
    setSelectedGenres((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]
    );
  }

  function handleFinish() {
    const profile: LocalProfile = {
      name: name.trim() || "Leitor BookMatch",
      location: "Brasil",
      reading_since: new Date().getFullYear().toString(),
      bio: "",
      favoriteGenres: selectedGenres,
      onboardingDone: true,
    };
    saveLocalProfile(profile);
    onComplete(profile);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-purple-200 bg-white shadow-2xl overflow-hidden">
        
        {/* Header roxo */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-purple-800 to-indigo-900 px-8 py-10 text-white">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-purple-400/20 blur-3xl" />
          <div className="relative z-10 flex items-center gap-3 mb-2">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-400">
              <BookOpen className="h-5 w-5 text-purple-900" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-300">
              Bem-vindo ao Estante
            </span>
          </div>
          <h2 className="relative z-10 font-display text-3xl font-bold leading-tight mt-2">
            {step === "name" ? "Como posso te chamar?" : "Que tipo de livro te encanta?"}
          </h2>
          <p className="relative z-10 mt-2 text-sm text-white/70">
            {step === "name"
              ? "Vamos personalizar sua experiência de leitura."
              : "Escolha pelo menos 1 gênero — sua home será montada para você."}
          </p>

          {/* Progress dots */}
          <div className="relative z-10 mt-5 flex gap-2">
            <div className={`h-1.5 w-8 rounded-full transition-all ${step === "name" ? "bg-amber-400" : "bg-white/30"}`} />
            <div className={`h-1.5 w-8 rounded-full transition-all ${step === "genres" ? "bg-amber-400" : "bg-white/30"}`} />
          </div>
        </div>

        <div className="p-8">
          {step === "name" ? (
            <>
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-700 mb-2">
                Seu nome ou apelido
              </label>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && name.trim()) setStep("genres");
                }}
                placeholder="Ex: Laura, João, Bê..."
                className="w-full rounded-2xl border-2 border-purple-200 bg-purple-50/80 p-4 text-lg text-purple-950 placeholder-purple-300 focus:border-purple-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-purple-600/10 transition-all"
              />
              <button
                onClick={() => setStep("genres")}
                disabled={!name.trim()}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-700 px-6 py-3.5 font-bold text-white shadow-lg shadow-purple-600/30 hover:bg-purple-800 disabled:opacity-40 transition-all cursor-pointer"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {ALL_GENRES.map(({ label, emoji }) => {
                  const selected = selectedGenres.includes(label);
                  return (
                    <button
                      key={label}
                      onClick={() => toggleGenre(label)}
                      className={
                        "flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition-all active:scale-95 " +
                        (selected
                          ? "bg-purple-700 text-white shadow-md shadow-purple-600/30 scale-105"
                          : "border border-purple-200 bg-purple-50 text-purple-700 hover:border-purple-400 hover:bg-purple-100")
                      }
                    >
                      <span>{emoji}</span>
                      {label}
                      {selected && <Check className="h-3.5 w-3.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  onClick={() => setStep("name")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  ← Voltar
                </button>
                <button
                  onClick={handleFinish}
                  disabled={selectedGenres.length < 1}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-700 px-7 py-3 font-bold text-white shadow-lg shadow-purple-600/30 hover:brightness-110 disabled:opacity-40 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  Montar minha estante
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

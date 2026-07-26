import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { BookCard } from "@/components/book-card";
import { getBooks, DEFAULT_BOOKS, type Book } from "@/lib/books-data";
import { getProfile, saveProfile, type UserProfile } from "@/lib/api";
import { useUserLibrary } from "@/lib/user-store";
import { BookOpen, Bookmark, CheckCircle2, Sparkles, Edit3, X, Check, Heart } from "lucide-react";

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
  const [tab, setTab] = useState<"reading" | "wishlist" | "read" | "favorites">("reading");
  // Inicializa com DEFAULT_BOOKS para renderizar IMEDIATAMENTE sem spinner
  const [booksList, setBooksList] = useState<Book[]>(DEFAULT_BOOKS);
  const { library } = useUserLibrary();

  // Profile State
  const [profile, setProfile] = useState<UserProfile>({
    id: "user_default",
    name: "Laura Ribeiro",
    location: "São Paulo, BR",
    reading_since: "2019",
    bio: "Apaixonada por ficção e fantasia contemporânea.",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [editingLocation, setEditingLocation] = useState("");
  const [editingReadingSince, setEditingReadingSince] = useState("");
  const [editingBio, setEditingBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    // Carrega em background — sem bloquear a tela
    getBooks().then((data) => {
      if (data && data.length > 0) setBooksList(data);
    }).catch(() => {});

    getProfile("user_default").then((profileData) => {
      if (profileData) setProfile(profileData);
    }).catch(() => {});
  }, []);

  function handleOpenEditModal() {
    setEditingName(profile.name);
    setEditingLocation(profile.location || "");
    setEditingReadingSince(profile.reading_since || "");
    setEditingBio(profile.bio || "");
    setIsEditingProfile(true);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const updated = await saveProfile({
        ...profile,
        name: editingName.trim() || profile.name,
        location: editingLocation.trim() || profile.location,
        reading_since: editingReadingSince.trim() || profile.reading_since,
        bio: editingBio.trim() || profile.bio,
      });
      setProfile(updated);
      setIsEditingProfile(false);
    } catch (err) {
      alert("Erro ao salvar perfil no Supabase.");
    } finally {
      setSavingProfile(false);
    }
  }

  // Filtra dinamicamente os livros das abas com base nos favoritados e salvos
  const readingBooks = booksList.filter((b) => library.reading.includes(b.slug))
    .concat(booksList.slice(0, library.reading.length === 0 ? 1 : 0));

  const wishlistBooks = booksList.filter((b) => library.saved.includes(b.slug))
    .concat(booksList.slice(1, library.saved.length === 0 ? 3 : 0));

  const readBooks = booksList.filter((b) => library.read.includes(b.slug))
    .concat(booksList.slice( library.read.length === 0 ? 2 : 0));

  const favoriteBooks = booksList.filter((b) => library.favorites.includes(b.slug));

  const tabs = [
    { id: "reading", label: "Lendo agora", icon: BookOpen, items: readingBooks },
    { id: "wishlist", label: "Quero ler (Salvos)", icon: Bookmark, items: wishlistBooks },
    { id: "read", label: "Já lidos", icon: CheckCircle2, items: readBooks },
    { id: "favorites", label: "Favoritos", icon: Heart, items: favoriteBooks },
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
        className="relative overflow-hidden pt-12 pb-24 md:pt-16 md:pb-28"
        style={{
          background:
            "linear-gradient(135deg, #5b21b6 0%, #7e22ce 50%, #6b3a19 100%)",
        }}
      >
        {/* Glow decorative ambient elements */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "#facc15" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 bottom-4 h-80 w-80 rounded-full opacity-25 blur-3xl"
          style={{ background: "#c084fc" }}
        />

        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-8 px-6 text-white md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-5">
            <span
              className="grid h-20 w-20 shrink-0 place-items-center rounded-full font-display text-3xl font-bold shadow-xl shadow-purple-950/40"
              style={{ background: "#facc15", color: "#3b0764" }}
            >
              {profile.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-300 backdrop-blur-md">
                  Perfil Leitor
                </span>
                <button
                  onClick={handleOpenEditModal}
                  className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-white/20"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Editar perfil
                </button>
              </div>
              <h1 className="mt-2 font-display text-4xl font-bold leading-tight text-white md:text-5xl">
                {profile.name}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                Lendo desde {profile.reading_since || "2019"} · {profile.location || "Brasil"}
              </p>
              {profile.bio && (
                <p className="mt-1.5 max-w-md text-xs italic text-amber-200/90">
                  "{profile.bio}"
                </p>
              )}
            </div>
          </div>
          <Link
            to="/descobrir"
            className="inline-flex items-center gap-2.5 self-start rounded-full bg-accent px-6 py-3 text-sm font-bold text-accent-foreground shadow-xl shadow-amber-500/30 transition-all hover:scale-105 hover:bg-amber-400 active:scale-95 md:self-auto"
          >
            <Sparkles className="h-4 w-4 fill-accent-foreground text-accent-foreground" />
            Nova recomendação
          </Link>
        </div>
      </section>

      {/* Stats (Card Flutuante Soft com divisores finos) */}
      <section className="relative z-10 mx-auto -mt-12 max-w-6xl px-6">
        <div className="grid grid-cols-2 divide-y border border-purple-200/70 bg-white/95 shadow-xl shadow-purple-950/10 backdrop-blur-md md:grid-cols-4 md:divide-y-0 md:divide-x divide-purple-100 rounded-2xl p-2">
          {stats.map((s) => (
            <div key={s.label} className="p-5 text-center transition-all hover:bg-purple-50/50">
              <p className="font-display text-3xl font-bold text-primary md:text-4xl">{s.value}</p>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{s.label}</p>
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
          {active.items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
              Nada por aqui ainda. Explore livros e clique em ❤️ ou 🔖 para adicioná-los!
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

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-purple-950/40 p-4 backdrop-blur-sm animate-fade-in-up">
          <div className="w-full max-w-md rounded-3xl border border-purple-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-purple-100 pb-4">
              <h3 className="font-display text-2xl font-bold text-primary">Editar Perfil</h3>
              <button
                onClick={() => setIsEditingProfile(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-purple-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full rounded-xl border border-purple-200 bg-purple-50/40 p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Localização
                </label>
                <input
                  type="text"
                  value={editingLocation}
                  onChange={(e) => setEditingLocation(e.target.value)}
                  placeholder="Ex: São Paulo, BR"
                  className="w-full rounded-xl border border-purple-200 bg-purple-50/40 p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Lendo Desde
                </label>
                <input
                  type="text"
                  value={editingReadingSince}
                  onChange={(e) => setEditingReadingSince(e.target.value)}
                  placeholder="Ex: 2019"
                  className="w-full rounded-xl border border-purple-200 bg-purple-50/40 p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary mb-1">
                  Biografia do Leitor
                </label>
                <textarea
                  rows={2}
                  value={editingBio}
                  onChange={(e) => setEditingBio(e.target.value)}
                  placeholder="Ex: Apaixonada por ficção e fantasia contemporânea..."
                  className="w-full rounded-xl border border-purple-200 bg-purple-50/40 p-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="rounded-full border border-border px-5 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="inline-flex items-center gap-2 rounded-full bg-[#9333ea] px-6 py-3 text-xs font-bold text-white shadow-lg shadow-purple-600/40 hover:bg-[#7e22ce] active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  <Check className="h-4 w-4 text-white" />
                  {savingProfile ? "Salvando no Supabase..." : "Salvar perfil"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  );
}
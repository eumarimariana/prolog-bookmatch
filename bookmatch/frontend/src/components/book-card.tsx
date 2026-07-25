import { Link } from "@tanstack/react-router";
import { Star, Heart, Bookmark } from "lucide-react";
import { useUserLibrary } from "@/lib/user-store";

// BookCover is a pure presentational component — sem hooks de estado global
// Recebe os estados como props para evitar que cada card assine o store
export function BookCover({
  book,
  className = "",
  favorite = false,
  saved = false,
  onToggleFavorite,
  onToggleSaved,
}: {
  book: any;
  className?: string;
  favorite?: boolean;
  saved?: boolean;
  onToggleFavorite?: () => void;
  onToggleSaved?: () => void;
}) {
  const genreText = book?.genre || "Ficção";
  const displayGenre = typeof genreText === "string" ? genreText.split(" ")[0] : "Ficção";
  const coverSource = book?.cover || book?.cover_url;
  const isImageUrl =
    typeof coverSource === "string" &&
    (coverSource.startsWith("http://") || coverSource.startsWith("https://") || coverSource.startsWith("/"));

  return (
    <div
      className={
        "relative aspect-[2/3] w-full max-w-full overflow-hidden rounded-xl shadow-[0_20px_40px_-20px_rgba(60,20,80,0.45)] bg-purple-900 group " +
        className
      }
      style={!isImageUrl && coverSource ? { background: coverSource } : undefined}
    >
      {isImageUrl ? (
        <img
          src={coverSource}
          alt={book?.title || "Capa do livro"}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLElement).style.display = "none";
          }}
        />
      ) : null}

      <div
        className="absolute inset-y-0 left-0 w-[6%] pointer-events-none"
        style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.35), transparent)" }}
      />

      {/* Action buttons — only rendered when handlers are provided */}
      {(onToggleFavorite || onToggleSaved) && (
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(); }}
              title={favorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
              className={
                "grid h-8 w-8 place-items-center rounded-full backdrop-blur-md transition-transform active:scale-90 " +
                (favorite
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/40"
                  : "bg-black/40 text-white/90 hover:bg-black/60")
              }
            >
              <Heart className={`h-4 w-4 ${favorite ? "fill-white" : ""}`} />
            </button>
          )}
          {onToggleSaved && (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSaved(); }}
              title={saved ? "Remover da lista" : "Salvar para ler"}
              className={
                "grid h-8 w-8 place-items-center rounded-full backdrop-blur-md transition-transform active:scale-90 " +
                (saved
                  ? "bg-amber-400 text-purple-950 shadow-md shadow-amber-400/40"
                  : "bg-black/40 text-white/90 hover:bg-black/60")
              }
            >
              <Bookmark className={`h-4 w-4 ${saved ? "fill-purple-950" : ""}`} />
            </button>
          )}
        </div>
      )}

      {/* Overlay de texto — só quando não há imagem */}
      {!isImageUrl && (
        <div className="flex h-full flex-col justify-between p-4 text-white">
          <span
            className="inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest shadow-sm"
            style={{ backgroundColor: book?.accent || "var(--accent)", color: "#3b0764" }}
          >
            {displayGenre}
          </span>
          <div>
            <p className="line-clamp-3 font-display text-lg font-bold leading-tight">{book?.title}</p>
            <p className="mt-1 line-clamp-1 text-xs opacity-90">{book?.author}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// BookCard assina o store UMA VEZ por card — os botões são passados como props para BookCover
export function BookCard({ book }: { book: any }) {
  const { isFavorite, isSaved, toggleFavorite, toggleSaved } = useUserLibrary();

  return (
    <Link
      to="/livro/$slug"
      params={{ slug: book.slug }}
      className="group block w-full"
    >
      <BookCover
        book={book}
        favorite={isFavorite(book.slug)}
        saved={isSaved(book.slug)}
        onToggleFavorite={() => toggleFavorite(book.slug)}
        onToggleSaved={() => toggleSaved(book.slug)}
        className="transition-transform group-hover:-translate-y-1 group-hover:shadow-[0_28px_50px_-20px_rgba(60,20,80,0.55)]"
      />
      <div className="mt-3">
        <p className="line-clamp-1 font-display text-base font-semibold text-foreground">
          {book.title}
        </p>
        <p className="line-clamp-1 text-sm text-muted-foreground">{book.author}</p>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="h-3 w-3 fill-accent text-accent" />
          <span>{book.rating?.toFixed(1) || "4.5"}</span>
          <span>·</span>
          <span>{book.pages || 320} pág.</span>
        </div>
      </div>
    </Link>
  );
}
import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";

export function BookCover({ book, className = "" }: { book: any; className?: string }) {
  // Blindagem segura contra strings vazias ou nulas do banco
  const genreText = book?.genre || "Ficção";
  const displayGenre = typeof genreText === "string" ? genreText.split(" ")[0] : "Ficção";

  return (
    <div
      className={
        "relative aspect-[2/3] w-full overflow-hidden rounded-lg shadow-[0_20px_40px_-20px_rgba(60,20,80,0.45)] " +
        className
      }
      style={{ background: book?.cover || "var(--primary)" }}
    >
      <div
        className="absolute inset-y-0 left-0 w-[6%]"
        style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.35), transparent)" }}
      />
      <div className="flex h-full flex-col justify-between p-4 text-white">
        <span
          className="inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest"
          style={{ backgroundColor: book?.accent || "var(--accent)", color: "oklch(0.22 0.05 305)" }}
        >
          {displayGenre}
        </span>
        <div>
          <p className="font-display text-lg leading-tight">{book?.title}</p>
          <p className="mt-1 text-xs opacity-80">{book?.author}</p>
        </div>
      </div>
    </div>
  );
}

export function BookCard({ book }: { book: any }) {
  return (
    <Link
      to="/livro/$slug"
      params={{ slug: book.slug }}
      className="group block"
    >
      <BookCover book={book} className="transition-transform group-hover:-translate-y-1 group-hover:shadow-[0_28px_50px_-20px_rgba(60,20,80,0.55)]" />
      <div className="mt-3">
        <p className="line-clamp-1 font-display text-base font-semibold text-foreground">
          {book.title}
        </p>
        <p className="text-sm text-muted-foreground">{book.author}</p>
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
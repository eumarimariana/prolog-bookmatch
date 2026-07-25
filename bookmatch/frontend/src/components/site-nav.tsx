import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Início" },
  { to: "/descobrir", label: "Descobrir" },
  { to: "/buscar", label: "Buscar" },
  { to: "/biblioteca", label: "Minha estante" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8dccb]/70 bg-[#f7f1e5]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-primary">Estante</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={
                  "rounded-full px-4 py-2 text-sm font-medium transition-all " +
                  (active
                    ? "bg-primary text-primary-foreground shadow-md shadow-purple-600/20"
                    : "text-foreground/80 hover:bg-black/5 hover:text-foreground")
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/descobrir"
          className="hidden items-center gap-2 rounded-full bg-accent px-5 py-2 text-xs font-bold text-accent-foreground shadow-md shadow-amber-500/20 transition-all hover:scale-105 hover:bg-amber-400 md:inline-flex"
        >
          <Sparkles className="h-3.5 w-3.5 fill-accent-foreground text-accent-foreground" />
          Recomende-me
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-accent text-accent-foreground">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="font-display text-lg">Estante</span>
        </div>
        <p className="text-sm text-primary-foreground/70">
          Recomendações feitas por leitores, para leitores. © {new Date().getFullYear()} Estante.
        </p>
      </div>
    </footer>
  );
}

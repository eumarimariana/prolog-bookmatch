import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

const links = [
  { to: "/", label: "Início" },
  { to: "/descobrir", label: "Descobrir" },
  { to: "/buscar", label: "Buscar" },
  { to: "/biblioteca", label: "Minha estante" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="font-display text-xl font-semibold tracking-tight">Estante</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.to === "/" ? pathname === "/" : pathname.startsWith(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={
                  "rounded-full px-4 py-2 text-sm transition-colors " +
                  (active
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-muted hover:text-foreground")
                }
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/descobrir"
          className="hidden rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground shadow-sm transition-transform hover:-translate-y-0.5 md:inline-flex"
        >
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

import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, LayoutDashboard, Briefcase, Mail, Wrench, LogIn, LogOut, Languages, Tag, Store, Menu, Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useI18n, SUPPORTED_LANGS, type Lang } from "@/lib/i18n";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import hnLogo from "@/assets/hn-groupe-logo.png";

export function NavBar() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { lang, setLang, t, langLabel } = useI18n();
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: t("nav.home"), icon: Sparkles },
    { to: "/projects", label: t("nav.projects"), icon: Briefcase },
    { to: "/pricing", label: t("nav.pricing"), icon: Tag },
    { to: "/marketplace", label: t("nav.marketplace"), icon: Store },
    { to: "/services", label: t("nav.services"), icon: Wrench },
    { to: "/contact", label: t("nav.contact"), icon: Mail },
  ] as const;

  const currentLabel = langLabel(lang);

  return (
    <header className="fixed top-4 left-1/2 z-50 w-[min(1100px,94vw)] -translate-x-1/2">
      <nav className="glass-strong flex items-center justify-between rounded-2xl px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2">
          <img src={hnLogo} alt="HN-Groupe" className="h-9 w-9 rounded-xl object-cover" />
          <span className="font-display text-lg font-bold neon-text">HN-Dev</span>
        </Link>
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                activeProps={{ className: "!text-foreground !bg-white/10" }}
                activeOptions={{ exact: l.to === "/" }}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label={t("nav.menu")}
                title={currentLabel.native}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-white/10"
              >
                <Languages className="h-4 w-4" />
                <span className="font-display uppercase">{lang}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[160px] border-white/10 bg-background/95 backdrop-blur-xl">
              {SUPPORTED_LANGS.map((l) => {
                const lbl = langLabel(l);
                return (
                  <DropdownMenuItem
                    key={l}
                    onClick={() => setLang(l)}
                    className="flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span aria-hidden>{lbl.flag}</span>
                      <span>{lbl.native}</span>
                    </span>
                    {l === lang && <Check className="h-4 w-4 text-[oklch(0.85_0.18_200)]" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          {isAdmin && (
            <Link
              to="/admin"
              aria-label={t("nav.admin")}
              className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/10 sm:flex"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t("nav.admin")}
            </Link>
          )}
          {user ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/10 sm:flex"
            >
              <LogOut className="h-4 w-4" /> {t("nav.logout")}
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-1.5 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-medium text-background neon-glow transition-transform hover:scale-105 sm:flex"
            >
              <LogIn className="h-4 w-4" /> {t("nav.login")}
            </Link>
          )}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                aria-label={t("nav.menu")}
                className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-foreground transition-colors hover:bg-white/10 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side={lang === "ar" ? "right" : "left"} className="w-[85vw] max-w-sm border-white/10 bg-background/95 backdrop-blur-xl">
              <SheetTitle className="font-display neon-text">{t("nav.menu")}</SheetTitle>
              <SheetDescription className="sr-only">
                {t("nav.menu")}
              </SheetDescription>
              <ul className="mt-6 flex flex-col gap-1">
                {links.map((l) => (
                  <li key={l.to}>
                    <SheetClose asChild>
                      <Link
                        to={l.to}
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                        activeProps={{ className: "!text-foreground !bg-white/10" }}
                        activeOptions={{ exact: l.to === "/" }}
                      >
                        <l.icon className="h-4 w-4" />
                        {l.label}
                      </Link>
                    </SheetClose>
                  </li>
                ))}
                {isAdmin && (
                  <li>
                    <SheetClose asChild>
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t("nav.admin")}
                      </Link>
                    </SheetClose>
                  </li>
                )}
              </ul>
              <div className="mt-6 border-t border-white/10 pt-4 space-y-3">
                <div className="flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
                  {SUPPORTED_LANGS.map((l: Lang) => (
                    <button
                      key={l}
                      onClick={() => setLang(l)}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${l === lang ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
                    >
                      {langLabel(l).flag} {l.toUpperCase()}
                    </button>
                  ))}
                </div>
                {user ? (
                  <SheetClose asChild>
                    <button
                      onClick={() => supabase.auth.signOut()}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-white/10"
                    >
                      <LogOut className="h-4 w-4" /> {t("nav.logout")}
                    </button>
                  </SheetClose>
                ) : (
                  <SheetClose asChild>
                    <Link
                      to="/login"
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2.5 text-sm font-medium text-background neon-glow"
                    >
                      <LogIn className="h-4 w-4" /> {t("nav.login")}
                    </Link>
                  </SheetClose>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

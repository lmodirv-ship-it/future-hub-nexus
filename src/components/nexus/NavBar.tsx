import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, LayoutDashboard, Briefcase, Mail, Wrench, LogIn, LogOut, Languages, Tag, Store, Menu } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { useI18n } from "@/lib/i18n";
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import hnLogo from "@/assets/hn-groupe-logo.png";

export function NavBar() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { lang, setLang, t } = useI18n();
  const toggleLang = () => setLang(lang === "ar" ? "en" : "ar");
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: t("nav.home"), icon: Sparkles },
    { to: "/projects", label: t("nav.projects"), icon: Briefcase },
    { to: "/pricing", label: lang === "ar" ? "الأسعار" : "Pricing", icon: Tag },
    { to: "/marketplace", label: lang === "ar" ? "السوق" : "Marketplace", icon: Store },
    { to: "/services", label: t("nav.services"), icon: Wrench },
    { to: "/contact", label: t("nav.contact"), icon: Mail },
  ] as const;

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
          <button
            onClick={toggleLang}
            aria-label="تبديل اللغة"
            title={lang === "ar" ? "English" : "العربية"}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-white/10"
          >
            <Languages className="h-4 w-4" />
            <span className="font-display">{lang === "ar" ? "EN" : "AR"}</span>
          </button>
          {isAdmin && (
            <Link
              to="/admin"
              aria-label={lang === "ar" ? "لوحة التحكم" : "Admin"}
              className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-white/10 sm:flex"
            >
              <LayoutDashboard className="h-4 w-4" />
              {lang === "ar" ? "الإدارة" : "Admin"}
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
                aria-label={lang === "ar" ? "فتح القائمة" : "Open menu"}
                className="flex items-center justify-center rounded-lg border border-white/10 bg-white/5 p-2 text-foreground transition-colors hover:bg-white/10 md:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side={lang === "ar" ? "right" : "left"} className="w-[85vw] max-w-sm border-white/10 bg-background/95 backdrop-blur-xl">
              <SheetTitle className="font-display neon-text">{lang === "ar" ? "القائمة" : "Menu"}</SheetTitle>
              <SheetDescription className="sr-only">
                {lang === "ar" ? "روابط التنقل في الموقع" : "Site navigation links"}
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
                        {lang === "ar" ? "لوحة التحكم" : "Admin"}
                      </Link>
                    </SheetClose>
                  </li>
                )}
              </ul>
              <div className="mt-6 border-t border-white/10 pt-4">
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
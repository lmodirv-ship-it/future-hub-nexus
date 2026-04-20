import { Link } from "@tanstack/react-router";
import { Sparkles, LayoutDashboard, Briefcase, Info, Mail, Wrench } from "lucide-react";

const links = [
  { to: "/", label: "الرئيسية", icon: Sparkles },
  { to: "/projects", label: "المشاريع", icon: Briefcase },
  { to: "/services", label: "الخدمات", icon: Wrench },
  { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/about", label: "عن المنصة", icon: Info },
  { to: "/contact", label: "تواصل", icon: Mail },
] as const;

export function NavBar() {
  return (
    <header className="fixed top-4 left-1/2 z-50 w-[min(1100px,94vw)] -translate-x-1/2">
      <nav className="glass-strong flex items-center justify-between rounded-2xl px-4 py-2.5">
        <Link to="/" className="flex items-center gap-2">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)]">
            <Sparkles className="h-5 w-5 text-background" />
            <div className="absolute inset-0 rounded-xl blur-md opacity-60 bg-gradient-to-br from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] -z-10" />
          </div>
          <span className="font-display text-lg font-bold neon-text">نكسس</span>
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
        <a
          href="#contact"
          className="hidden rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-sm font-medium text-background neon-glow transition-transform hover:scale-105 sm:block"
        >
          ابدأ الآن
        </a>
      </nav>
    </header>
  );
}
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, FolderKanban, Activity, Eye, Bell, Settings,
  Menu, X, ExternalLink, LogOut, Home,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useProjects } from "@/hooks/use-projects";

const NAV = [
  { to: "/admin", label: "نظرة عامة", icon: LayoutDashboard, exact: true },
  { to: "/admin/projects", label: "المشاريع", icon: FolderKanban },
  { to: "/admin/checks", label: "الفحوصات", icon: Activity },
  { to: "/admin/visits", label: "الزيارات", icon: Eye },
  { to: "/admin/alerts", label: "التنبيهات", icon: Bell },
  { to: "/admin/settings", label: "الإعدادات", icon: Settings },
] as const;

export function AdminLayout({ children, title, subtitle, actions }: { children: ReactNode; title: string; subtitle?: string; actions?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { user } = useAuth();
  const { projects } = useProjects();
  const downCount = projects.filter((p) => p.is_up === false).length;

  function isActive(to: string, exact?: boolean) {
    return exact ? loc.pathname === to : loc.pathname === to || loc.pathname.startsWith(to + "/");
  }

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="relative min-h-screen pt-20">
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-24 right-4 z-40 rounded-lg border border-white/10 bg-background/80 p-2 backdrop-blur lg:hidden"
        aria-label="القائمة"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <div className="mx-auto flex max-w-[1600px] gap-6 px-4 pb-12 lg:px-6">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 right-0 z-30 w-64 transform overflow-y-auto border-l border-white/10 bg-background/95 pt-24 backdrop-blur-xl transition-transform lg:sticky lg:top-20 lg:h-[calc(100vh-5rem)] lg:translate-x-0 lg:bg-transparent lg:backdrop-blur-none ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="px-4 pb-6">
            <div className="glass mb-4 rounded-xl p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] text-background">
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold">المدير</div>
                  <div className="truncate text-[10px] text-muted-foreground">{user?.email}</div>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {NAV.map((item) => {
                const active = isActive(item.to, item.exact);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                      active
                        ? "bg-gradient-to-r from-[oklch(0.65_0.25_290)]/20 to-[oklch(0.7_0.28_330)]/10 text-foreground border border-[oklch(0.65_0.25_290)]/30"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </span>
                    {item.to === "/admin/alerts" && downCount > 0 && (
                      <span className="rounded-full bg-pink-500/20 px-1.5 py-0.5 text-[10px] font-bold text-pink-400">
                        {downCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-6 space-y-1 border-t border-white/5 pt-4">
              <Link to="/" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">
                <Home className="h-4 w-4" /> الموقع
              </Link>
              <a href="https://lovable.dev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground">
                <ExternalLink className="h-4 w-4" /> Lovable
              </a>
              <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-pink-500/10 hover:text-pink-400">
                <LogOut className="h-4 w-4" /> تسجيل الخروج
              </button>
            </div>

            <div className="mt-6 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-[11px] text-muted-foreground/80">
              <div className="font-semibold text-foreground">نكسس v1.0</div>
              <div className="mt-1">قابل للتوسع لإدارة آلاف المشاريع.</div>
            </div>
          </div>
        </aside>

        {/* Backdrop */}
        {open && (
          <div className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
        )}

        {/* Main */}
        <main className="min-w-0 flex-1 pt-2">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl">
                <span className="neon-text">{title}</span>
              </h1>
              {subtitle && <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
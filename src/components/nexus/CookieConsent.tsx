import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { Cookie } from "lucide-react";

const STORAGE_KEY = "cookie-consent";

export function CookieConsent() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const v = localStorage.getItem(STORAGE_KEY);
    if (!v) {
      // small delay so it doesn't flash on first paint
      const id = window.setTimeout(() => setVisible(true), 800);
      return () => window.clearTimeout(id);
    }
  }, []);

  const decide = (value: "accepted" | "declined") => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[60] w-[min(560px,94vw)] -translate-x-1/2">
      <div className="glass-strong flex flex-col gap-3 rounded-2xl border border-white/10 p-4 shadow-2xl sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:flex-1">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)]">
            <Cookie className="h-4 w-4 text-background" />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">{t("cookie.text")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => decide("declined")}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/10"
          >
            {t("cookie.decline")}
          </button>
          <button
            onClick={() => decide("accepted")}
            className="rounded-lg bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-4 py-2 text-xs font-semibold text-background neon-glow"
          >
            {t("cookie.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
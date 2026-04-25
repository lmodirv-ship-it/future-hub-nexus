import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { useIsAdmin } from "@/hooks/use-is-admin";
import { Sparkles, LogIn, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "دخول المدير — HN-Dev" },
      { name: "description", content: "تسجيل دخول المدير عبر Google." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { user } = useAuth();
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    if (isAdmin) {
      navigate({ to: "/admin" });
    } else {
      setError(`هذا الحساب (${user.email}) ليس مديراً.`);
      supabase.auth.signOut();
    }
  }, [user, isAdmin, loading, navigate]);

  async function handleGoogle() {
    setBusy(true);
    setError(null);
    const res = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/login",
    });
    if (res.error) {
      setError(res.error.message);
      setBusy(false);
    }
  }

  return (
    <section className="relative mx-auto flex min-h-[80vh] max-w-md items-center px-6 pt-32">
      <div className="glass-strong w-full rounded-3xl p-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)]">
          <ShieldCheck className="h-7 w-7 text-background" />
        </div>
        <h1 className="font-display text-3xl font-bold">
          <span className="neon-text">دخول المدير</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          الدخول مخصص لبريد المدير فقط عبر Google — بدون كلمة سر.
        </p>

        <button
          onClick={handleGoogle}
          disabled={busy}
          className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[oklch(0.75_0.2_295)] to-[oklch(0.7_0.28_330)] px-5 py-3 text-sm font-semibold text-background neon-glow transition-transform hover:scale-[1.02] disabled:opacity-50"
        >
          <LogIn className="h-4 w-4" />
          {busy ? "جارِ التحويل..." : "الدخول عبر Google"}
        </button>

        {error && (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            {error}
          </p>
        )}

        <p className="mt-6 flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
          <Sparkles className="h-3 w-3" /> محمي بمنظومة HN-Dev الزجاجية
        </p>
      </div>
    </section>
  );
}

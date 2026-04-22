import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useIsAdmin } from "@/hooks/use-is-admin";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useIsAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate({ to: "/login" });
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-32">
        <div className="glass rounded-2xl px-6 py-4 text-sm text-muted-foreground">
          جارِ التحقق...
        </div>
      </div>
    );
  }
  if (!isAdmin) return null;
  return <>{children}</>;
}

import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { isAdminEmail } from "@/lib/admin";

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdminEmail(user?.email)) {
      navigate({ to: "/login" });
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-32">
        <div className="glass rounded-2xl px-6 py-4 text-sm text-muted-foreground">
          جارِ التحقق...
        </div>
      </div>
    );
  }
  if (!isAdminEmail(user?.email)) return null;
  return <>{children}</>;
}

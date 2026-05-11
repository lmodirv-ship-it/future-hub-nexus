import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function getAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing service credentials");
  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

/**
 * Authorize a control-plane request. Allows EITHER:
 *  - Bearer CRON_SECRET (for scheduled jobs)
 *  - Bearer <supabase user access token> belonging to a user with admin role
 * Returns null when authorized, or a Response (401/500) when not.
 */
export async function authorizeAdminOrCron(request: Request): Promise<Response | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && timingSafeEqualStr(token, cronSecret)) return null;

  try {
    const admin = getAdmin();
    const { data: userRes, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userRes?.user) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const { data: roleRow, error: roleErr } = await admin
      .from("user_roles")
      .select("role")
      .eq("user_id", userRes.user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr || !roleRow) {
      return Response.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    return null;
  } catch (e) {
    console.error("[authorizeAdminOrCron] error:", e);
    return Response.json({ ok: false, error: "Internal error" }, { status: 500 });
  }
}
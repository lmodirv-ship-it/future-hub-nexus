import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function getAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function ensureAdmin(supabase: ReturnType<typeof getAdminClient>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("forbidden: admin role required");
}

/* ============================ List users ============================ */
const listUsersSchema = z.object({
  page: z.number().int().min(1).default(1),
  perPage: z.number().int().min(1).max(100).default(20),
});

export const listUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => listUsersSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    const admin = getAdminClient();
    await ensureAdmin(admin, context.userId);

    const { data: page, error } = await admin.auth.admin.listUsers({
      page: data.page,
      perPage: data.perPage,
    });
    if (error) throw new Error(error.message);

    const ids = page.users.map((u) => u.id);
    const { data: roles } = await admin
      .from("user_roles")
      .select("user_id, role")
      .in("user_id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);

    const roleMap = new Map<string, string[]>();
    (roles ?? []).forEach((r) => {
      const arr = roleMap.get(r.user_id) ?? [];
      arr.push(r.role);
      roleMap.set(r.user_id, arr);
    });

    const total =
      (page as unknown as { total?: number }).total ?? page.users.length;

    return {
      page: data.page,
      perPage: data.perPage,
      total,
      users: page.users.map((u) => ({
        id: u.id,
        email: u.email ?? "",
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        roles: roleMap.get(u.id) ?? [],
      })),
    };
  });

/* ============================ Set role ============================ */
const setRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["admin", "viewer"]),
  action: z.enum(["add", "remove"]),
});

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => setRoleSchema.parse(input))
  .handler(async ({ data, context }) => {
    const admin = getAdminClient();
    await ensureAdmin(admin, context.userId);

    if (data.action === "add") {
      const { error } = await admin
        .from("user_roles")
        .upsert({ user_id: data.user_id, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      // Prevent admin from removing their own admin role (lockout protection)
      if (data.role === "admin" && data.user_id === context.userId) {
        throw new Error("لا يمكنك إزالة صلاحياتك كمدير");
      }
      const { error } = await admin
        .from("user_roles")
        .delete()
        .eq("user_id", data.user_id)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

/* ============================ Delete user ============================ */
const deleteUserSchema = z.object({ user_id: z.string().uuid() });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => deleteUserSchema.parse(input))
  .handler(async ({ data, context }) => {
    const admin = getAdminClient();
    await ensureAdmin(admin, context.userId);
    if (data.user_id === context.userId) throw new Error("لا يمكنك حذف حسابك");

    const { error } = await admin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/* ============================ Bulk alerts ============================ */
const bulkAlertsSchema = z.object({
  action: z.enum(["mark_read", "delete_read", "delete_all"]),
});

export const bulkAlerts = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => bulkAlertsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const admin = getAdminClient();
    await ensureAdmin(admin, context.userId);

    if (data.action === "mark_read") {
      const { error, count } = await admin
        .from("alerts")
        .update({ is_read: true }, { count: "exact" })
        .eq("is_read", false);
      if (error) throw new Error(error.message);
      return { affected: count ?? 0 };
    }
    if (data.action === "delete_read") {
      const { error, count } = await admin
        .from("alerts")
        .delete({ count: "exact" })
        .eq("is_read", true);
      if (error) throw new Error(error.message);
      return { affected: count ?? 0 };
    }
    const { error, count } = await admin
      .from("alerts")
      .delete({ count: "exact" })
      .gte("created_at", "1970-01-01");
    if (error) throw new Error(error.message);
    return { affected: count ?? 0 };
  });
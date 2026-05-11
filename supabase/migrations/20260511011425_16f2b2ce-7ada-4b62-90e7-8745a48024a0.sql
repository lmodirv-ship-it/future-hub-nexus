-- Revoke EXECUTE on internal SECURITY DEFINER functions from public/anon/authenticated
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_dashboard_stats() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_alert_on_failure() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_managed_site_alert() FROM PUBLIC, anon, authenticated;

-- Keep get_dashboard_stats callable by signed-in admins (it self-checks is_admin)
GRANT EXECUTE ON FUNCTION public.get_dashboard_stats() TO authenticated;
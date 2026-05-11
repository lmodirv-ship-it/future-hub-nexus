-- Revoke execute on trigger-only SECURITY DEFINER functions from public roles
REVOKE EXECUTE ON FUNCTION public.create_alert_on_failure() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_managed_site_alert() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- Tighten public insert policy on service_requests
DROP POLICY IF EXISTS "Anyone can submit a request" ON public.service_requests;

CREATE POLICY "Anyone can submit a valid request"
ON public.service_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(btrim(name)) BETWEEN 2 AND 120
  AND length(btrim(email)) BETWEEN 5 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(btrim(message)) BETWEEN 5 AND 4000
  AND length(btrim(service_type)) BETWEEN 2 AND 80
  AND (phone IS NULL OR length(btrim(phone)) <= 40)
  AND (budget_range IS NULL OR length(btrim(budget_range)) <= 80)
  AND status = 'new'
  AND admin_notes IS NULL
);
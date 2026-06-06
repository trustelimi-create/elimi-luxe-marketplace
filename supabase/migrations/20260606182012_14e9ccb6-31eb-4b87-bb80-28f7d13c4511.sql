
-- 1) is_staff: only true for actual staff roles
CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin'::app_role, 'employee'::app_role)
  );
$$;

-- 2) product_likes: scope DELETE to caller's session header
DROP POLICY IF EXISTS "Anyone can unlike own session" ON public.product_likes;
CREATE POLICY "Unlike own session only"
ON public.product_likes
FOR DELETE
USING (
  session_id = COALESCE(
    current_setting('request.headers', true)::json->>'x-session-id',
    ''
  )
  AND session_id <> ''
);

-- Same scoping for INSERT (session_id must match header)
DROP POLICY IF EXISTS "Anyone can like" ON public.product_likes;
CREATE POLICY "Like with own session only"
ON public.product_likes
FOR INSERT
WITH CHECK (
  session_id = COALESCE(
    current_setting('request.headers', true)::json->>'x-session-id',
    ''
  )
  AND session_id <> ''
);

-- 3) Lock down SECURITY DEFINER function execute privileges
REVOKE EXECUTE ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, service_role;

-- Trigger-only functions: no app role needs EXECUTE
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

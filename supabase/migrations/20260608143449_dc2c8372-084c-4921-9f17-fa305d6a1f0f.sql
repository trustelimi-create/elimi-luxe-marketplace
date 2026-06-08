
-- 1) Private schema for SECURITY DEFINER helpers (not exposed via Data API)
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('super_admin'::public.app_role, 'employee'::public.app_role)
  );
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated, service_role;

-- 2) Recreate every policy that references public.has_role / public.is_staff to use private.*
-- categories
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
CREATE POLICY "Anyone can view active categories" ON public.categories
  FOR SELECT USING ((is_active = true) OR private.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Super admins manage categories" ON public.categories;
CREATE POLICY "Super admins manage categories" ON public.categories
  FOR ALL USING (private.has_role(auth.uid(), 'super_admin'::public.app_role))
  WITH CHECK (private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- employee_reports
DROP POLICY IF EXISTS "Employees submit own reports" ON public.employee_reports;
CREATE POLICY "Employees submit own reports" ON public.employee_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id AND private.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Super admins view all reports" ON public.employee_reports;
CREATE POLICY "Super admins view all reports" ON public.employee_reports
  FOR SELECT USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- product_audit_logs
DROP POLICY IF EXISTS "Staff can write audit logs" ON public.product_audit_logs;
CREATE POLICY "Staff can write audit logs" ON public.product_audit_logs
  FOR INSERT WITH CHECK (private.is_staff(auth.uid()) AND actor_id = auth.uid());
DROP POLICY IF EXISTS "Super admins view all audit logs" ON public.product_audit_logs;
CREATE POLICY "Super admins view all audit logs" ON public.product_audit_logs
  FOR SELECT USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- product_images
DROP POLICY IF EXISTS "Staff can manage product images" ON public.product_images;
CREATE POLICY "Staff can manage product images" ON public.product_images
  FOR ALL USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));

-- products
DROP POLICY IF EXISTS "Anyone can view non-pending products" ON public.products;
CREATE POLICY "Anyone can view non-pending products" ON public.products
  FOR SELECT USING (status <> 'pending'::product_status OR private.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Creator or super admin can update products" ON public.products;
CREATE POLICY "Creator or super admin can update products" ON public.products
  FOR UPDATE USING (created_by = auth.uid() OR private.has_role(auth.uid(), 'super_admin'::public.app_role));
DROP POLICY IF EXISTS "Staff can insert products" ON public.products;
CREATE POLICY "Staff can insert products" ON public.products
  FOR INSERT WITH CHECK (private.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Super admin can delete products" ON public.products;
CREATE POLICY "Super admin can delete products" ON public.products
  FOR DELETE USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- profiles
DROP POLICY IF EXISTS "Super admins can update any profile" ON public.profiles;
CREATE POLICY "Super admins can update any profile" ON public.profiles
  FOR UPDATE USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admins can view all profiles" ON public.profiles
  FOR SELECT USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- user_roles
DROP POLICY IF EXISTS "Super admins view all roles" ON public.user_roles;
CREATE POLICY "Super admins view all roles" ON public.user_roles
  FOR SELECT USING (private.has_role(auth.uid(), 'super_admin'::public.app_role));

-- whatsapp_clicks
DROP POLICY IF EXISTS "Staff can view clicks" ON public.whatsapp_clicks;
CREATE POLICY "Staff can view clicks" ON public.whatsapp_clicks
  FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

-- 3) Drop the public-schema helpers now that nothing references them
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_staff(uuid);

-- 4) Tighten whatsapp_clicks INSERT policy (no more WITH CHECK (true))
DROP POLICY IF EXISTS "Anyone can record click" ON public.whatsapp_clicks;
CREATE POLICY "Anyone can record click" ON public.whatsapp_clicks
  FOR INSERT
  WITH CHECK (
    product_id IS NOT NULL
    AND session_id IS NOT NULL
    AND length(session_id) BETWEEN 8 AND 128
  );

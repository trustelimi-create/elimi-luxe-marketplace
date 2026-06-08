
-- Products UPDATE: require staff AND (creator OR super admin), enforce on both USING and WITH CHECK
DROP POLICY IF EXISTS "Creator or super admin can update products" ON public.products;
CREATE POLICY "Staff creator or super admin can update products" ON public.products
  FOR UPDATE
  USING (
    private.is_staff(auth.uid())
    AND (created_by = auth.uid() OR private.has_role(auth.uid(), 'super_admin'::public.app_role))
  )
  WITH CHECK (
    private.is_staff(auth.uid())
    AND (created_by = auth.uid() OR private.has_role(auth.uid(), 'super_admin'::public.app_role))
  );

-- Audit logs INSERT: also require referenced product exists
DROP POLICY IF EXISTS "Staff can write audit logs" ON public.product_audit_logs;
CREATE POLICY "Staff can write audit logs" ON public.product_audit_logs
  FOR INSERT
  WITH CHECK (
    private.is_staff(auth.uid())
    AND actor_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id)
  );

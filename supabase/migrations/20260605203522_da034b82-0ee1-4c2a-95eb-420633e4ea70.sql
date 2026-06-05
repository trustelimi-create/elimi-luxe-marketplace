
CREATE TABLE public.product_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_audit_logs_product_idx ON public.product_audit_logs(product_id);
CREATE INDEX product_audit_logs_actor_idx ON public.product_audit_logs(actor_id);

GRANT SELECT, INSERT ON public.product_audit_logs TO authenticated;
GRANT ALL ON public.product_audit_logs TO service_role;

ALTER TABLE public.product_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins view all audit logs"
  ON public.product_audit_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Creators view their product audit logs"
  ON public.product_audit_logs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_id AND p.created_by = auth.uid()
  ));

CREATE POLICY "Staff can write audit logs"
  ON public.product_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND actor_id = auth.uid());

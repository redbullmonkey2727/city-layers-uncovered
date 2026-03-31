-- Fix admin role escalation
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert non-admin roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND role != 'admin'::app_role);

CREATE POLICY "Admins can delete non-admin roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) AND role != 'admin'::app_role);

DROP POLICY "Authenticated can read leads" ON leads;
DROP POLICY "Authenticated can update leads" ON leads;

CREATE POLICY "Admins can read leads" ON leads FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads" ON leads FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

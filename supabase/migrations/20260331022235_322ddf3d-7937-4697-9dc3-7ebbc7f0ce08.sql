-- Remove analytics_events from realtime publication (no IF EXISTS)
ALTER PUBLICATION supabase_realtime DROP TABLE public.analytics_events;

-- Create safe org read function
CREATE OR REPLACE FUNCTION public.get_org_safe(org_uuid uuid)
RETURNS TABLE(id uuid, name text, slug text, plan text, seats_limit int, industry text, website text, logo_url text, created_at timestamptz)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT o.id, o.name, o.slug, o.plan, o.seats_limit, o.industry, o.website, o.logo_url, o.created_at
  FROM organizations o
  JOIN org_members om ON om.org_id = o.id
  WHERE o.id = org_uuid AND om.user_id = auth.uid();
$$;
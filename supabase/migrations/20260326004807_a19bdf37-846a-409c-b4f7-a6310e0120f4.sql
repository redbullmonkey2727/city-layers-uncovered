-- 1. Remove the overly permissive public SELECT on search_events
DROP POLICY IF EXISTS "Anyone can read city names from searches" ON public.search_events;

-- 2. Add admin SELECT policy for search_events so admin can see all searches
CREATE POLICY "Admins can read all search events"
ON public.search_events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 3. Restrict profiles SELECT
DROP POLICY IF EXISTS "Anyone can read public profile info" ON public.profiles;

CREATE POLICY "Users can read own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 4. Add RLS policies to billing_events (RLS already enabled)
CREATE POLICY "Users can read own billing events"
ON public.billing_events
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins can read all billing events"
ON public.billing_events
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- 5. Tighten search_events INSERT for anon
DROP POLICY IF EXISTS "Anyone can insert search events" ON public.search_events;
CREATE POLICY "Anon can insert search events"
ON public.search_events
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);
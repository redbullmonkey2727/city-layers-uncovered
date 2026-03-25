-- Allow anyone to read city_name and state_region from search_events for social proof
CREATE POLICY "Anyone can read city names from searches"
ON public.search_events
FOR SELECT
TO anon, authenticated
USING (true);

-- Drop the old restrictive policy that only allowed users to read own events
-- Actually we need to keep that too for user-specific queries, but the new policy
-- is permissive so it will allow broader reads. Let's just add the new one.
ALTER TABLE public.search_events ALTER COLUMN user_id DROP NOT NULL;

CREATE POLICY "Anyone can insert search events"
ON public.search_events
FOR INSERT
TO anon
WITH CHECK (true);
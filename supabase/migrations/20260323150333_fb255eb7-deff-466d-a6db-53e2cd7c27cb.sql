
-- Page view counter table
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL DEFAULT '/',
  count bigint NOT NULL DEFAULT 0,
  UNIQUE(page)
);

-- Allow anyone to read
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read page views" ON public.page_views FOR SELECT USING (true);

-- Seed the homepage counter
INSERT INTO public.page_views (page, count) VALUES ('/', 0);

-- Security definer function to atomically increment and return count
CREATE OR REPLACE FUNCTION public.increment_page_view(page_path text)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count bigint;
BEGIN
  UPDATE public.page_views SET count = count + 1 WHERE page = page_path RETURNING count INTO new_count;
  IF new_count IS NULL THEN
    INSERT INTO public.page_views (page, count) VALUES (page_path, 1) RETURNING count INTO new_count;
  END IF;
  RETURN new_count;
END;
$$;

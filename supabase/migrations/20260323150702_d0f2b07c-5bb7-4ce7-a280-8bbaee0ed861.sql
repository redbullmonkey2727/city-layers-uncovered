
-- Grant execute on the increment function to anon and authenticated
GRANT EXECUTE ON FUNCTION public.increment_page_view(text) TO anon, authenticated;

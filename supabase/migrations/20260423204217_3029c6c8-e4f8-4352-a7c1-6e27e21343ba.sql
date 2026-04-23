DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='chat_messages') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_messages';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='chat_participants') THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime DROP TABLE public.chat_participants';
  END IF;
END $$;

-- Fix overly permissive policies by adding proper checks
DROP POLICY IF EXISTS "Users can insert participants" ON public.chat_participants;
CREATE POLICY "Users can insert participants" ON public.chat_participants FOR INSERT TO authenticated 
  WITH CHECK (
    user_id = auth.uid() 
    OR conversation_id IN (SELECT conversation_id FROM public.chat_participants WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Authenticated can create conversations" ON public.chat_conversations;
CREATE POLICY "Authenticated can create conversations" ON public.chat_conversations FOR INSERT TO authenticated 
  WITH CHECK (auth.uid() IS NOT NULL);

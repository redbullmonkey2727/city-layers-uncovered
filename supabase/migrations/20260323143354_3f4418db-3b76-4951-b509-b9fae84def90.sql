
-- Places / business recommendations
CREATE TABLE public.places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name TEXT NOT NULL,
  state_region TEXT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'attraction',
  photo_url TEXT,
  address TEXT,
  website_url TEXT,
  hours TEXT,
  tips TEXT,
  rating NUMERIC DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read places" ON public.places FOR SELECT USING (true);

-- Likes table (polymorphic - can like places, trips, saved_cities)
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own likes" ON public.likes FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own likes" ON public.likes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.likes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Chat conversations
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;

-- Chat participants
CREATE TABLE public.chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_read_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read own" ON public.chat_participants FOR SELECT TO authenticated 
  USING (user_id = auth.uid() OR conversation_id IN (SELECT conversation_id FROM public.chat_participants WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert participants" ON public.chat_participants FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own read" ON public.chat_participants FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Chat conversations RLS (participants only)
CREATE POLICY "Participants can read conversations" ON public.chat_conversations FOR SELECT TO authenticated
  USING (id IN (SELECT conversation_id FROM public.chat_participants WHERE user_id = auth.uid()));
CREATE POLICY "Authenticated can create conversations" ON public.chat_conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Participants can update conversations" ON public.chat_conversations FOR UPDATE TO authenticated
  USING (id IN (SELECT conversation_id FROM public.chat_participants WHERE user_id = auth.uid()));

-- Chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES public.chat_conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT,
  shared_content_type TEXT,
  shared_content_id UUID,
  shared_content_preview JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can read messages" ON public.chat_messages FOR SELECT TO authenticated
  USING (conversation_id IN (SELECT conversation_id FROM public.chat_participants WHERE user_id = auth.uid()));
CREATE POLICY "Participants can send messages" ON public.chat_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = auth.uid() AND conversation_id IN (SELECT conversation_id FROM public.chat_participants WHERE user_id = auth.uid()));

-- Friends / contacts
CREATE TABLE public.user_friends (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

ALTER TABLE public.user_friends ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own friends" ON public.user_friends FOR SELECT TO authenticated USING (user_id = auth.uid() OR friend_id = auth.uid());
CREATE POLICY "Users can send friend requests" ON public.user_friends FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update friend status" ON public.user_friends FOR UPDATE TO authenticated USING (friend_id = auth.uid());
CREATE POLICY "Users can delete own friends" ON public.user_friends FOR DELETE TO authenticated USING (user_id = auth.uid() OR friend_id = auth.uid());

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_participants;

import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import {
  MessageCircle, Send, ArrowLeft, Loader2, UserPlus,
  MapPin, Plus, Search, Users, Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Conversation {
  id: string;
  updated_at: string;
  participants: Participant[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

interface Participant {
  user_id: string;
  last_read_at: string | null;
  profile?: { email: string | null; full_name: string | null; username: string | null; avatar_url: string | null };
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  shared_content_type: string | null;
  shared_content_id: string | null;
  shared_content_preview: any;
  created_at: string;
}

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) navigate("/sign-in");
  }, [authLoading, user, navigate]);

  // Fetch conversations
  useEffect(() => {
    if (!user) return;
    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    if (!user) return;
    const { data: participantData } = await supabase
      .from("chat_participants")
      .select("conversation_id")
      .eq("user_id", user.id);

    if (!participantData || participantData.length === 0) {
      setLoading(false);
      return;
    }

    const convoIds = participantData.map((p) => p.conversation_id);
    const { data: convos } = await supabase
      .from("chat_conversations")
      .select("*")
      .in("id", convoIds)
      .order("updated_at", { ascending: false });

    if (!convos) { setLoading(false); return; }

    const enriched: Conversation[] = [];
    for (const convo of convos) {
      const { data: parts } = await supabase
        .from("chat_participants")
        .select("user_id, last_read_at")
        .eq("conversation_id", convo.id);

      // Get profiles for participants
      const participants: Participant[] = [];
      if (parts) {
        for (const p of parts) {
          const { data: prof } = await supabase
            .from("profiles")
            .select("email, full_name, username, avatar_url")
            .eq("id", p.user_id)
            .maybeSingle();
          participants.push({ ...p, profile: prof || undefined });
        }
      }

      // Get last message
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", convo.id)
        .order("created_at", { ascending: false })
        .limit(1);

      const myParticipant = parts?.find((p) => p.user_id === user.id);
      const unreadCount = msgs && msgs.length > 0 && myParticipant?.last_read_at
        ? (msgs[0].created_at > myParticipant.last_read_at ? 1 : 0)
        : 0;

      enriched.push({
        ...convo,
        participants,
        lastMessage: msgs?.[0] || undefined,
        unreadCount,
      });
    }
    setConversations(enriched);
    setLoading(false);
  };

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConvo) return;
    supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", activeConvo)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data);
        scrollToBottom();
      });

    // Mark as read
    if (user) {
      supabase
        .from("chat_participants")
        .update({ last_read_at: new Date().toISOString() })
        .eq("conversation_id", activeConvo)
        .eq("user_id", user.id);
    }
  }, [activeConvo, user]);

  // Realtime messages
  useEffect(() => {
    if (!activeConvo) return;
    const channel = supabase
      .channel(`chat-${activeConvo}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${activeConvo}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage]);
        scrollToBottom();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConvo]);

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const handleSend = async () => {
    if (!user || !activeConvo || !newMessage.trim()) return;
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      conversation_id: activeConvo,
      sender_id: user.id,
      content: newMessage.trim(),
    });
    if (error) {
      toast({ title: "Error sending", description: error.message, variant: "destructive" });
    } else {
      setNewMessage("");
      await supabase
        .from("chat_conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeConvo);
    }
    setSending(false);
  };

  const handleStartChat = async () => {
    if (!user || !friendEmail.trim()) return;
    // Search by username or email using the security definer function
    const { data: results } = await supabase.rpc("search_users" as any, {
      search_query: friendEmail.trim(),
    });

    const friendProfile = (results as any[])?.[0];
    if (!friendProfile) {
      toast({ title: "User not found", description: "No account with that username or email.", variant: "destructive" });
      return;
    }
    if (friendProfile.id === user.id) {
      toast({ title: "That's you!", variant: "destructive" });
      return;
    }

    // Create conversation
    const { data: convo, error: convoErr } = await supabase
      .from("chat_conversations")
      .insert({})
      .select()
      .single();

    if (convoErr || !convo) {
      toast({ title: "Error", description: convoErr?.message, variant: "destructive" });
      return;
    }

    // Add participants
    await supabase.from("chat_participants").insert([
      { conversation_id: convo.id, user_id: user.id },
      { conversation_id: convo.id, user_id: friendProfile.id },
    ]);

    setFriendEmail("");
    setShowNewChat(false);
    setActiveConvo(convo.id);
    fetchConversations();
    toast({ title: "Chat started! 💬" });
  };

  const getOtherParticipant = (convo: Conversation) => {
    return convo.participants.find((p) => p.user_id !== user?.id);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-14">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Active conversation view
  if (activeConvo) {
    const convo = conversations.find((c) => c.id === activeConvo);
    const other = convo ? getOtherParticipant(convo) : null;
    return (
      <div className="min-h-screen bg-background pt-14 flex flex-col">
        {/* Chat header */}
        <div className="sticky top-14 z-10 bg-background/95 backdrop-blur-lg border-b border-border/50 px-6 py-3 flex items-center gap-3">
          <Button variant="ghost" size="sm" className="p-2" onClick={() => setActiveConvo(null)}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Avatar className="w-8 h-8">
            {other?.profile?.avatar_url ? (
              <AvatarImage src={other.profile.avatar_url} alt={other.profile.username || "User"} />
            ) : null}
            <AvatarFallback className="text-xs font-heading bg-primary/10 text-primary">
              {(other?.profile?.full_name || other?.profile?.username || "?")[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-heading font-semibold">
              {other?.profile?.full_name || other?.profile?.username || "User"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {other?.profile?.username ? `@${other.profile.username}` : "Direct message"}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-16 text-muted-foreground text-sm">
              Start the conversation! 👋
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.sender_id === user?.id;
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  isMine
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted rounded-bl-md"
                }`}>
                  {/* Shared content preview */}
                  {msg.shared_content_preview && (
                    <div className={`mb-2 rounded-lg overflow-hidden border ${isMine ? "border-primary-foreground/20" : "border-border/40"}`}>
                      {msg.shared_content_preview.photo_url && (
                        <img src={msg.shared_content_preview.photo_url} className="w-full h-24 object-cover" alt="" />
                      )}
                      <div className="p-2">
                        <p className="text-xs font-heading font-semibold">{msg.shared_content_preview.name}</p>
                        {msg.shared_content_preview.city_name && (
                          <p className="text-[10px] opacity-70 flex items-center gap-1">
                            <MapPin className="w-2.5 h-2.5" /> {msg.shared_content_preview.city_name}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  {msg.content && <p className="text-sm">{msg.content}</p>}
                  <p className={`text-[10px] mt-1 ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message input */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-lg border-t border-border/50 px-6 py-3">
          <div className="flex gap-2 max-w-3xl mx-auto">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="font-heading"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            />
            <Button
              onClick={handleSend}
              disabled={sending || !newMessage.trim()}
              className="gap-1.5"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Conversations list
  return (
    <div className="min-h-screen bg-background pt-20 pb-0">
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
              <MessageCircle className="w-7 h-7 text-primary" />
              Messages
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {conversations.length} {conversations.length === 1 ? "conversation" : "conversations"}
            </p>
          </div>
          <Button
            className="font-heading gap-1.5"
            onClick={() => setShowNewChat(!showNewChat)}
          >
            <Plus className="w-4 h-4" /> New Chat
          </Button>
        </div>

        {/* New chat dialog */}
        <AnimatePresence>
          {showNewChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="glass-card mb-6 border-primary/30">
                <CardContent className="p-4">
                  <p className="text-sm font-heading font-semibold mb-2 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-primary" /> Start a new conversation
                  </p>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search by username or email..."
                      value={friendEmail}
                      onChange={(e) => setFriendEmail(e.target.value)}
                      className="font-heading text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleStartChat()}
                    />
                    <Button size="sm" className="font-heading" onClick={handleStartChat}>
                      Start Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Conversations */}
        {conversations.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-16 text-center space-y-3">
              <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="font-heading font-semibold text-lg">No messages yet</h3>
              <p className="text-muted-foreground text-sm">
                Start a conversation by clicking "New Chat" above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((convo) => {
              const other = getOtherParticipant(convo);
              return (
                <motion.button
                  key={convo.id}
                  className="w-full text-left p-4 rounded-lg bg-card/60 border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all flex items-center gap-3"
                  onClick={() => setActiveConvo(convo.id)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    {other?.profile?.avatar_url ? (
                      <AvatarImage src={other.profile.avatar_url} alt={other.profile.username || "User"} />
                    ) : null}
                    <AvatarFallback className="text-sm font-heading bg-primary/10 text-primary">
                      {(other?.profile?.full_name || other?.profile?.username || "?")[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-heading font-semibold truncate">
                        {other?.profile?.full_name || other?.profile?.email || "User"}
                      </p>
                      {convo.lastMessage && (
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {new Date(convo.lastMessage.created_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {convo.lastMessage && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {convo.lastMessage.content || "Shared a place"}
                      </p>
                    )}
                  </div>
                  {convo.unreadCount > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                      {convo.unreadCount}
                    </Badge>
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Chat;

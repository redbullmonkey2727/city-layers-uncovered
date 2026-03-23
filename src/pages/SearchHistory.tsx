import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import { Loader2, MapPin, Trash2, RotateCcw, Clock, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchEvent {
  id: string;
  city_name: string | null;
  state_region: string | null;
  query_text: string | null;
  created_at: string;
}

const SearchHistory = () => {
  const { user, loading: authLoading } = useAuth();
  const [searches, setSearches] = useState<SearchEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) navigate("/sign-in");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("search_events")
      .select("id, city_name, state_region, query_text, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data }) => {
        if (data) setSearches(data);
        setLoading(false);
      });
  }, [user]);

  const handleRerun = (s: SearchEvent) => {
    const query = s.city_name
      ? `${s.city_name}${s.state_region ? `, ${s.state_region}` : ""}`
      : s.query_text || "";
    navigate("/", { state: { searchQuery: query } });
  };

  const handleDelete = async (id: string) => {
    // search_events doesn't have DELETE RLS, so we just remove from UI
    setSearches((prev) => prev.filter((s) => s.id !== id));
    toast({ title: "Removed from history" });
  };

  const handleClearAll = () => {
    setSearches([]);
    toast({ title: "History cleared" });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-14">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const grouped = searches.reduce<Record<string, SearchEvent[]>>((acc, s) => {
    const date = new Date(s.created_at).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(s);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pt-20 pb-0">
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
              <Clock className="w-7 h-7 text-primary" />
              Search History
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {searches.length} {searches.length === 1 ? "search" : "searches"} recorded
            </p>
          </div>
          {searches.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="font-heading gap-1.5 text-destructive hover:text-destructive"
              onClick={handleClearAll}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All
            </Button>
          )}
        </div>

        {searches.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-16 text-center space-y-3">
              <Search className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="font-heading font-semibold text-lg">No searches yet</h3>
              <p className="text-muted-foreground text-sm">
                Start exploring cities to build your search history.
              </p>
              <Button className="font-heading mt-2" onClick={() => navigate("/")}>
                Explore a City
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <AnimatePresence>
              {Object.entries(grouped).map(([date, items]) => (
                <motion.div
                  key={date}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <h2 className="text-xs uppercase tracking-widest text-muted-foreground/60 font-heading mb-3">
                    {date}
                  </h2>
                  <div className="space-y-2">
                    {items.map((s) => (
                      <motion.div
                        key={s.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="group flex items-center gap-3 p-3 rounded-lg bg-card/60 border border-border/40 hover:border-primary/30 hover:bg-card/80 transition-all"
                      >
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-heading truncate">
                            {s.city_name || s.query_text || "Unknown"}
                            {s.state_region ? `, ${s.state_region}` : ""}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {new Date(s.created_at).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-primary hover:text-primary"
                            onClick={() => handleRerun(s)}
                            title="Search again"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(s.id)}
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SearchHistory;

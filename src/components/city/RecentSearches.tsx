import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface RecentSearch {
  id: string;
  city_name: string;
  state_region: string | null;
  created_at: string;
}

interface Props {
  onSelect: (city: string) => void;
}

const RecentSearches = ({ onSelect }: Props) => {
  const { user } = useAuth();
  const [searches, setSearches] = useState<RecentSearch[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("search_events")
      .select("id, city_name, state_region, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data) setSearches(data);
      });
  }, [user]);

  if (!user || searches.length === 0) return null;

  return (
    <motion.div
      className="w-full max-w-xl mx-auto mt-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
    >
      <div className="flex items-center gap-1.5 mb-2.5">
        <Clock className="w-3 h-3 text-muted-foreground/60" />
        <span className="text-[11px] uppercase tracking-widest text-muted-foreground/60 font-heading">
          Recent
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((s) => (
          <button
            key={s.id}
            onClick={() =>
              onSelect(
                s.city_name + (s.state_region ? `, ${s.state_region}` : "")
              )
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur-sm border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card/80 transition-all font-heading"
          >
            <MapPin className="w-3 h-3 text-primary/60" />
            {s.city_name}
            {s.state_region ? `, ${s.state_region}` : ""}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentSearches;

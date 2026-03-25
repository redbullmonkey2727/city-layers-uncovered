import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toCitySlug } from "@/lib/citySlug";
import { Link } from "react-router-dom";

interface RecentLookup {
  city_name: string;
  state_region: string | null;
  created_at: string;
}

const SocialProof = () => {
  const [lookups, setLookups] = useState<RecentLookup[]>([]);

  useEffect(() => {
    supabase
      .from("search_events")
      .select("city_name, state_region, created_at")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!data) return;
        // Deduplicate by city name, take latest
        const seen = new Set<string>();
        const unique: RecentLookup[] = [];
        for (const d of data) {
          if (!d.city_name) continue;
          const key = d.city_name.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            unique.push(d as RecentLookup);
          }
          if (unique.length >= 8) break;
        }
        setLookups(unique);
      });
  }, []);

  if (lookups.length < 3) return null;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <section className="py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-xs font-heading uppercase tracking-widest text-muted-foreground">
            Recently explored
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {lookups.map((l, i) => (
            <motion.div
              key={l.city_name + i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/city/${toCitySlug(l.city_name, l.state_region ?? undefined)}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/60 backdrop-blur-sm border border-border/40 text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-card/80 transition-all font-heading group"
              >
                <MapPin className="w-3 h-3 text-primary/60 group-hover:text-primary transition-colors" />
                {l.city_name}{l.state_region ? `, ${l.state_region}` : ""}
                <span className="text-[10px] text-muted-foreground/50 ml-1">{timeAgo(l.created_at)}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProof;

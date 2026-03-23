import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Footer from "@/components/Footer";
import LikeButton from "@/components/LikeButton";
import {
  MapPin, Star, ExternalLink, Clock, Search, Utensils,
  Landmark, ShoppingBag, Sparkles, Loader2, Filter,
} from "lucide-react";
import { motion } from "framer-motion";

interface Place {
  id: string;
  city_name: string;
  state_region: string | null;
  name: string;
  description: string | null;
  category: string;
  photo_url: string | null;
  address: string | null;
  website_url: string | null;
  hours: string | null;
  tips: string | null;
  rating: number | null;
  featured: boolean | null;
}

const categoryIcons: Record<string, typeof Landmark> = {
  attraction: Landmark,
  restaurant: Utensils,
  shop: ShoppingBag,
};

const categories = ["all", "attraction", "restaurant", "shop"];

const Explore = () => {
  const { user } = useAuth();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = supabase.from("places").select("*").order("featured", { ascending: false }).order("rating", { ascending: false });
    q.then(({ data }) => {
      if (data) setPlaces(data as Place[]);
      setLoading(false);
    });
  }, []);

  const filtered = places.filter((p) => {
    if (filter !== "all" && p.category !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.city_name.toLowerCase().includes(s) ||
        (p.description?.toLowerCase().includes(s) ?? false)
      );
    }
    return true;
  });

  const featured = filtered.filter((p) => p.featured);
  const rest = filtered.filter((p) => !p.featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-14">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-0">
      <div className="max-w-6xl mx-auto px-6 pb-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-primary" />
            Recommended For You
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Curated places worth visiting in cities across America
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search places or cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 font-heading"
            />
          </div>
          <div className="flex gap-2">
            {categories.map((c) => (
              <Button
                key={c}
                variant={filter === c ? "default" : "outline"}
                size="sm"
                className="font-heading capitalize text-sm"
                onClick={() => setFilter(c)}
              >
                {c === "all" ? (
                  <><Filter className="w-3.5 h-3.5 mr-1" /> All</>
                ) : (
                  <>
                    {(() => { const I = categoryIcons[c] || Landmark; return <I className="w-3.5 h-3.5 mr-1" />; })()}
                    {c}s
                  </>
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Section */}
        {featured.length > 0 && (
          <div className="mb-10">
            <h2 className="text-lg font-heading font-semibold mb-4 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> Featured
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {featured.map((place, i) => (
                <PlaceCard key={place.id} place={place} index={i} userId={user?.id} featured />
              ))}
            </div>
          </div>
        )}

        {/* All Places */}
        {rest.length > 0 && (
          <div>
            <h2 className="text-lg font-heading font-semibold mb-4">All Places</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {rest.map((place, i) => (
                <PlaceCard key={place.id} place={place} index={i} userId={user?.id} />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <MapPin className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <h3 className="font-heading font-semibold">No places found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

const PlaceCard = ({
  place,
  index,
  userId,
  featured,
}: {
  place: Place;
  index: number;
  userId?: string;
  featured?: boolean;
}) => {
  const Icon = categoryIcons[place.category] || Landmark;
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`glass-card overflow-hidden group cursor-pointer transition-all hover:border-primary/30 ${
          featured ? "border-primary/20" : ""
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        {/* Photo */}
        <div className="relative h-40 bg-muted overflow-hidden">
          {place.photo_url ? (
            <img
              src={place.photo_url}
              alt={place.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <Icon className="w-10 h-10 text-primary/30" />
            </div>
          )}
          <div className="absolute top-2 left-2">
            <Badge className="text-[10px] uppercase tracking-wider bg-background/80 backdrop-blur-sm text-foreground border-0">
              <Icon className="w-3 h-3 mr-1" />
              {place.category}
            </Badge>
          </div>
          {userId && (
            <div className="absolute top-2 right-2" onClick={(e) => e.stopPropagation()}>
              <LikeButton contentType="place" contentId={place.id} userId={userId} />
            </div>
          )}
          {place.rating && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-full px-2 py-0.5">
              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-heading font-semibold">{Number(place.rating).toFixed(1)}</span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-heading font-semibold text-sm line-clamp-1">{place.name}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
            <MapPin className="w-3 h-3" />
            {place.city_name}{place.state_region ? `, ${place.state_region}` : ""}
          </p>
          {place.description && (
            <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{place.description}</p>
          )}

          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-3 pt-3 border-t border-border/30 space-y-2"
            >
              {place.hours && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-primary" /> {place.hours}
                </p>
              )}
              {place.address && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-primary" /> {place.address}
                </p>
              )}
              {place.tips && (
                <div className="bg-primary/5 rounded-lg p-2.5 mt-2">
                  <p className="text-xs text-primary font-heading">💡 {place.tips}</p>
                </div>
              )}
              <div className="flex gap-2 mt-3">
                {place.website_url && (
                  <Button size="sm" variant="outline" className="text-xs font-heading gap-1" asChild>
                    <a href={place.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" /> Learn More
                    </a>
                  </Button>
                )}
                <Button
                  size="sm"
                  className="text-xs font-heading gap-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address || place.name + " " + place.city_name)}`,
                      "_blank"
                    );
                  }}
                >
                  <MapPin className="w-3 h-3" /> Get Directions
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Explore;

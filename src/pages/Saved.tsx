import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Footer from "@/components/Footer";
import {
  Heart, MapPin, Loader2, Bookmark, Route, Star,
  Landmark, Utensils, ShoppingBag, Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Like {
  id: string;
  content_type: string;
  content_id: string;
  created_at: string;
}

interface Place {
  id: string;
  name: string;
  city_name: string;
  state_region: string | null;
  category: string;
  photo_url: string | null;
  description: string | null;
  rating: number | null;
}

const categoryIcons: Record<string, typeof Landmark> = {
  attraction: Landmark,
  restaurant: Utensils,
  shop: ShoppingBag,
};

const tabs = [
  { key: "all", label: "All", icon: Bookmark },
  { key: "place", label: "Places", icon: MapPin },
  { key: "trip", label: "Routes", icon: Route },
] as const;

const Saved = () => {
  const { user, loading: authLoading } = useAuth();
  const [likes, setLikes] = useState<Like[]>([]);
  const [places, setPlaces] = useState<Record<string, Place>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) navigate("/sign-in");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;

    const fetchLikes = async () => {
      const { data: likesData } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!likesData) { setLoading(false); return; }
      setLikes(likesData);

      // Fetch place details for liked places
      const placeIds = likesData.filter((l) => l.content_type === "place").map((l) => l.content_id);
      if (placeIds.length > 0) {
        const { data: placesData } = await supabase
          .from("places")
          .select("id, name, city_name, state_region, category, photo_url, description, rating")
          .in("id", placeIds);
        if (placesData) {
          const map: Record<string, Place> = {};
          (placesData as Place[]).forEach((p) => (map[p.id] = p));
          setPlaces(map);
        }
      }
      setLoading(false);
    };

    fetchLikes();
  }, [user]);

  const handleUnlike = async (likeId: string) => {
    await supabase.from("likes").delete().eq("id", likeId);
    setLikes((prev) => prev.filter((l) => l.id !== likeId));
  };

  const filtered = activeTab === "all" ? likes : likes.filter((l) => l.content_type === activeTab);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-14">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-0">
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            Saved Collection
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {likes.length} saved {likes.length === 1 ? "item" : "items"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {tabs.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={activeTab === key ? "default" : "outline"}
              size="sm"
              className="font-heading text-sm gap-1.5"
              onClick={() => setActiveTab(key)}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-16 text-center space-y-3">
              <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="font-heading font-semibold text-lg">Nothing saved yet</h3>
              <p className="text-muted-foreground text-sm">
                Like places, routes, or guides and they'll appear here.
              </p>
              <Button className="font-heading mt-2" onClick={() => navigate("/explore")}>
                Explore Places
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((like) => {
                const place = places[like.content_id];
                if (like.content_type === "place" && place) {
                  const Icon = categoryIcons[place.category] || Landmark;
                  return (
                    <motion.div
                      key={like.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Card className="glass-card overflow-hidden group">
                        <div className="relative h-32 bg-muted overflow-hidden">
                          {place.photo_url ? (
                            <img
                              src={place.photo_url}
                              alt={place.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                              <Icon className="w-8 h-8 text-primary/30" />
                            </div>
                          )}
                          <Badge className="absolute top-2 left-2 text-[10px] uppercase bg-background/80 backdrop-blur-sm text-foreground border-0">
                            <Icon className="w-3 h-3 mr-1" /> {place.category}
                          </Badge>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-heading font-semibold text-sm line-clamp-1">{place.name}</h3>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {place.city_name}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            {place.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-xs">{Number(place.rating).toFixed(1)}</span>
                              </div>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1"
                              onClick={() => handleUnlike(like.id)}
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                }

                // Generic content card for non-place likes
                return (
                  <motion.div
                    key={like.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="glass-card">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <Badge variant="outline" className="text-[10px] uppercase mb-1">
                            {like.content_type}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            Saved {new Date(like.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => handleUnlike(like.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Saved;

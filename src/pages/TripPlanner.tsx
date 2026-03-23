import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import LikeButton from "@/components/LikeButton";
import {
  Route, Plus, MapPin, Loader2, Clock, Trash2,
  GripVertical, Navigation, ChevronDown, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Trip {
  id: string;
  title: string;
  origin: string | null;
  destination: string | null;
  created_at: string;
  stops: TripStop[];
}

interface TripStop {
  id: string;
  trip_id: string;
  city_name: string;
  state_region: string | null;
  stop_order: number;
  insight_summary: string | null;
}

const TripPlanner = () => {
  const { user, loading: authLoading, subscription } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [expandedTrip, setExpandedTrip] = useState<string | null>(null);
  const [newStopCity, setNewStopCity] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const isPro = subscription.plan === "pro";

  useEffect(() => {
    if (!authLoading && !user) navigate("/sign-in");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    fetchTrips();
  }, [user]);

  const fetchTrips = async () => {
    if (!user) return;
    const { data: tripsData } = await supabase
      .from("trips")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!tripsData) { setLoading(false); return; }

    const tripsWithStops: Trip[] = [];
    for (const trip of tripsData) {
      const { data: stops } = await supabase
        .from("trip_stops")
        .select("*")
        .eq("trip_id", trip.id)
        .order("stop_order", { ascending: true });
      tripsWithStops.push({ ...trip, stops: stops || [] });
    }
    setTrips(tripsWithStops);
    setLoading(false);
  };

  const handleCreateTrip = async () => {
    if (!user || !newTitle.trim()) return;
    if (!isPro && trips.length >= 1) {
      toast({ title: "Upgrade to Pro", description: "Free users can create 1 trip. Upgrade for unlimited.", variant: "destructive" });
      return;
    }
    setCreating(true);
    const { data, error } = await supabase
      .from("trips")
      .insert({ user_id: user.id, title: newTitle.trim() })
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setTrips((prev) => [{ ...data, stops: [] }, ...prev]);
      setNewTitle("");
      setExpandedTrip(data.id);
      toast({ title: "Trip created! 🗺️" });
    }
    setCreating(false);
  };

  const handleAddStop = async (tripId: string) => {
    if (!newStopCity.trim()) return;
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;
    const { data, error } = await supabase
      .from("trip_stops")
      .insert({
        trip_id: tripId,
        city_name: newStopCity.trim(),
        stop_order: trip.stops.length,
      })
      .select()
      .single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setTrips((prev) =>
        prev.map((t) =>
          t.id === tripId ? { ...t, stops: [...t.stops, data] } : t
        )
      );
      setNewStopCity("");
    }
  };

  const handleDeleteStop = async (tripId: string, stopId: string) => {
    await supabase.from("trip_stops").delete().eq("id", stopId);
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId ? { ...t, stops: t.stops.filter((s) => s.id !== stopId) } : t
      )
    );
  };

  const handleDeleteTrip = async (tripId: string) => {
    await supabase.from("trips").delete().eq("id", tripId);
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
    toast({ title: "Trip deleted" });
  };

  const estimateTime = (stops: TripStop[]) => {
    if (stops.length < 2) return null;
    const hours = (stops.length - 1) * 2.5; // rough estimate
    return `~${hours.toFixed(1)} hrs estimated`;
  };

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
            <Route className="w-7 h-7 text-primary" />
            Trip Planner
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Plan multi-stop routes with itineraries and guides
          </p>
        </div>

        {/* Create Trip */}
        <Card className="glass-card mb-8">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Input
                placeholder="Name your trip (e.g. 'Southwest Road Trip')"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="font-heading"
                onKeyDown={(e) => e.key === "Enter" && handleCreateTrip()}
              />
              <Button
                className="font-heading gap-1.5 flex-shrink-0"
                onClick={handleCreateTrip}
                disabled={creating || !newTitle.trim()}
              >
                <Plus className="w-4 h-4" /> New Trip
              </Button>
            </div>
            {!isPro && trips.length >= 1 && (
              <p className="text-xs text-muted-foreground mt-2">
                Free plan: 1 trip max. <span className="text-primary cursor-pointer" onClick={() => navigate("/pricing")}>Upgrade for unlimited</span>.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Trips List */}
        {trips.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-16 text-center space-y-3">
              <Navigation className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <h3 className="font-heading font-semibold text-lg">No trips yet</h3>
              <p className="text-muted-foreground text-sm">Create your first trip to start planning.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {trips.map((trip) => {
                const isExpanded = expandedTrip === trip.id;
                return (
                  <motion.div
                    key={trip.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <Card className={`glass-card transition-all ${isExpanded ? "border-primary/30" : ""}`}>
                      <CardHeader
                        className="cursor-pointer pb-3"
                        onClick={() => setExpandedTrip(isExpanded ? null : trip.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Route className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base font-heading">{trip.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge variant="outline" className="text-[10px]">
                                  {trip.stops.length} {trip.stops.length === 1 ? "stop" : "stops"}
                                </Badge>
                                {estimateTime(trip.stops) && (
                                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {estimateTime(trip.stops)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {user && (
                              <div onClick={(e) => e.stopPropagation()}>
                                <LikeButton contentType="trip" contentId={trip.id} userId={user.id} />
                              </div>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      {isExpanded && (
                        <CardContent className="pt-0">
                          {/* Stops Timeline */}
                          <div className="relative ml-4 border-l-2 border-primary/20 pl-6 space-y-4 mb-4">
                            {trip.stops.map((stop, i) => (
                              <motion.div
                                key={stop.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="relative group"
                              >
                                <div className="absolute -left-[31px] w-4 h-4 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                                  <span className="text-[8px] font-bold text-primary">{i + 1}</span>
                                </div>
                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="w-3 h-3 text-muted-foreground/40" />
                                    <MapPin className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-sm font-heading">
                                      {stop.city_name}
                                      {stop.state_region ? `, ${stop.state_region}` : ""}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteStop(trip.id, stop.id)}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                                {i < trip.stops.length - 1 && (
                                  <div className="ml-5 mt-1 text-[10px] text-muted-foreground/50 flex items-center gap-1">
                                    <Navigation className="w-2.5 h-2.5" />
                                    ~2.5 hrs drive
                                  </div>
                                )}
                              </motion.div>
                            ))}
                          </div>

                          {/* Add Stop */}
                          <div className="flex gap-2 mt-4">
                            <Input
                              placeholder="Add a city stop..."
                              value={newStopCity}
                              onChange={(e) => setNewStopCity(e.target.value)}
                              className="font-heading text-sm"
                              onKeyDown={(e) => e.key === "Enter" && handleAddStop(trip.id)}
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="font-heading gap-1 flex-shrink-0"
                              onClick={() => handleAddStop(trip.id)}
                              disabled={!newStopCity.trim()}
                            >
                              <Plus className="w-3.5 h-3.5" /> Add Stop
                            </Button>
                          </div>

                          <div className="flex justify-end mt-4 pt-3 border-t border-border/30">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-muted-foreground hover:text-destructive gap-1"
                              onClick={() => handleDeleteTrip(trip.id)}
                            >
                              <Trash2 className="w-3 h-3" /> Delete Trip
                            </Button>
                          </div>
                        </CardContent>
                      )}
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

export default TripPlanner;

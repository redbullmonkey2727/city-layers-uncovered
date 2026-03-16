import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Route, Search, CreditCard } from "lucide-react";

const FREE_LOOKUP_LIMIT = 5;

interface SearchEvent {
  id: string;
  city_name: string;
  state_region: string;
  created_at: string;
}

interface SavedCity {
  id: string;
  city_name: string;
  state_region: string;
  created_at: string;
}

interface Trip {
  id: string;
  title: string;
  origin: string;
  destination: string;
  created_at: string;
}

const Account = () => {
  const { user, profile, subscription, loading: authLoading, refreshProfile, refreshSubscription } = useAuth();
  const [searches, setSearches] = useState<SearchEvent[]>([]);
  const [savedCities, setSavedCities] = useState<SavedCity[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) navigate("/sign-in");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    // Fetch recent searches
    supabase
      .from("search_events")
      .select("id, city_name, state_region, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setSearches(data); });

    // Fetch saved cities
    supabase
      .from("saved_cities")
      .select("id, city_name, state_region, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setSavedCities(data); });

    // Fetch trips
    supabase
      .from("trips")
      .select("id, title, origin, destination, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setTrips(data); });
  }, [user]);

  // Refresh subscription on mount (handles checkout redirect)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      refreshSubscription();
      refreshProfile();
      toast({ title: "Welcome to Pro! 🎉", description: "You now have unlimited city lookups." });
      window.history.replaceState({}, "", "/account");
    }
  }, [refreshSubscription, refreshProfile, toast]);

  const handleManageBilling = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err) {
      toast({ title: "Error", description: "Couldn't open billing portal", variant: "destructive" });
    } finally {
      setPortalLoading(false);
    }
  };

  const handleDeleteSavedCity = async (id: string) => {
    await supabase.from("saved_cities").delete().eq("id", id);
    setSavedCities((prev) => prev.filter((c) => c.id !== id));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-14">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const usagePercent = Math.min((profile.monthly_lookup_count / FREE_LOOKUP_LIMIT) * 100, 100);

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold">Account</h1>
            <p className="text-muted-foreground mt-1">{profile.email}</p>
          </div>
          <Badge
            variant={subscription.plan === "pro" ? "default" : "secondary"}
            className="text-xs uppercase tracking-wider px-3 py-1"
          >
            {subscription.plan === "pro" ? "Pro" : "Free"}
          </Badge>
        </div>

        {/* Plan & Usage */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Plan & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Current plan:</span>
                <p className="text-lg font-heading font-semibold">
                  {subscription.plan === "pro" ? "Pro — $9.99/mo" : "Free"}
                </p>
              </div>
              {subscription.subscription_end && (
                <p className="text-xs text-muted-foreground">
                  {subscription.cancel_at_period_end ? "Cancels" : "Renews"} on{" "}
                  {new Date(subscription.subscription_end).toLocaleDateString()}
                </p>
              )}
              <div className="flex gap-2">
                {subscription.plan === "pro" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="font-heading"
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                  >
                    {portalLoading ? "Loading…" : "Manage Billing"}
                  </Button>
                ) : (
                  <Link to="/pricing">
                    <Button size="sm" className="font-heading">Upgrade to Pro</Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Search className="w-4 h-4" /> Usage This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {subscription.plan === "pro" ? (
                <p className="text-muted-foreground text-sm">Unlimited lookups — you're on Pro.</p>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">City lookups</span>
                    <span className="font-heading font-semibold">
                      {profile.monthly_lookup_count} / {FREE_LOOKUP_LIMIT}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  {profile.monthly_lookup_count >= FREE_LOOKUP_LIMIT && (
                    <p className="text-xs text-destructive">
                      Limit reached.{" "}
                      <Link to="/pricing" className="underline">Upgrade</Link> for unlimited.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Searches */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Search className="w-4 h-4" /> Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searches.length === 0 ? (
              <p className="text-sm text-muted-foreground">No searches yet. Go explore a city!</p>
            ) : (
              <div className="space-y-2">
                {searches.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm font-heading">
                        {s.city_name}{s.state_region ? `, ${s.state_region}` : ""}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Cities */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Saved Cities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {savedCities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No saved cities yet.</p>
            ) : (
              <div className="space-y-2">
                {savedCities.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <span className="text-sm font-heading">
                      {c.city_name}{c.state_region ? `, ${c.state_region}` : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteSavedCity(c.id)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trips */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Route className="w-4 h-4" /> Saved Trips
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trips.length === 0 ? (
              <p className="text-sm text-muted-foreground">No trips yet. Search a city and start building your road trip!</p>
            ) : (
              <div className="space-y-2">
                {trips.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                    <div>
                      <span className="text-sm font-heading font-semibold">{t.title}</span>
                      {t.origin && t.destination && (
                        <p className="text-xs text-muted-foreground">{t.origin} → {t.destination}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;

import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import {
  Loader2, MapPin, Search, CreditCard, Zap, Crown,
  CheckCircle2, Lock, Infinity, BookmarkPlus, BarChart3, Headphones, Pencil,
} from "lucide-react";

const FREE_LOOKUP_LIMIT = 20;

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

const proFeatures = [
  { icon: Infinity, label: "Unlimited city lookups" },
  { icon: BookmarkPlus, label: "Unlimited saved cities" },
  { icon: BarChart3, label: "Premium route insights" },
  { icon: Headphones, label: "Audio mode (coming soon)" },
];

const Account = () => {
  const { user, profile, subscription, loading: authLoading, refreshProfile, refreshSubscription } = useAuth();
  const [searches, setSearches] = useState<SearchEvent[]>([]);
  const [savedCities, setSavedCities] = useState<SavedCity[]>([]);
  const [portalLoading, setPortalLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isPro = subscription.plan === "pro";

  useEffect(() => {
    if (!authLoading && !user) navigate("/sign-in");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("search_events")
      .select("id, city_name, state_region, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setSearches(data); });

    supabase
      .from("saved_cities")
      .select("id, city_name, state_region, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => { if (data) setSavedCities(data); });
  }, [user]);

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
    } catch {
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
    <div className="min-h-screen bg-background pt-20 pb-0">
      <div className="max-w-4xl mx-auto px-6 space-y-8 pb-16">
        {/* Header with profile */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="w-14 h-14 ring-2 ring-primary/20">
              {profile.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={profile.username || "Profile"} />
              ) : null}
              <AvatarFallback className="text-lg font-heading font-bold bg-primary/10 text-primary">
                {(profile.full_name || profile.username || "?").split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold">
                {profile.full_name || profile.username || "Your Account"}
              </h1>
              {profile.username && (
                <p className="text-sm text-muted-foreground">@{profile.username}</p>
              )}
              <p className="text-muted-foreground text-xs mt-0.5">{profile.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/edit-profile">
              <Button variant="outline" size="sm" className="font-heading gap-1.5">
                <Pencil className="w-3.5 h-3.5" /> Edit Profile
              </Button>
            </Link>
            <Badge
              className={`text-xs uppercase tracking-wider px-3 py-1.5 ${
                isPro
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isPro ? "✦ Pro" : "Free Plan"}
            </Badge>
          </div>
        </div>

        {/* Upgrade banner for free users */}
        {!isPro && (
          <Card className="glass-card border-primary/30 glow-primary overflow-hidden">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-primary" />
                    <h3 className="font-heading font-bold text-lg">You're on the Free plan</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-4">
                    You're limited to {FREE_LOOKUP_LIMIT} lookups/month and 10 saved cities. Unlock everything for just $9.99/mo.
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {proFeatures.map(({ icon: Icon, label }) => (
                      <div key={label} className="flex items-center gap-2 text-sm">
                        <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{label}</span>
                      </div>
                    ))}
                  </div>
                  <Link to="/pricing">
                    <Button className="font-heading gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                      <Zap className="w-4 h-4" />
                      Upgrade to Pro — $9.99/mo
                    </Button>
                  </Link>
                </div>
                <div className="hidden md:flex flex-col items-center gap-1 text-center opacity-60">
                  <Lock className="w-10 h-10 text-muted-foreground" />
                  <span className="text-[11px] text-muted-foreground font-heading">Limited<br/>Access</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pro celebration banner */}
        {isPro && (
          <Card className="glass-card border-primary/20 bg-primary/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-semibold text-sm">Pro membership active</h3>
                <p className="text-muted-foreground text-xs">
                  Unlimited lookups, unlimited saves, premium insights.
                  {subscription.subscription_end && (
                    <> {subscription.cancel_at_period_end ? "Expires" : "Renews"}{" "}
                    {new Date(subscription.subscription_end).toLocaleDateString()}.</>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="font-heading flex-shrink-0"
                onClick={handleManageBilling}
                disabled={portalLoading}
              >
                {portalLoading ? "Loading…" : "Manage Billing"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Plan & Usage */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Plan & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Current plan</span>
                <span className="font-heading font-semibold">
                  {isPro ? "Pro — $9.99/mo" : "Free — $0"}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className={`text-sm font-medium ${isPro ? "text-primary" : "text-muted-foreground"}`}>
                  {isPro ? "Active" : "No subscription"}
                </span>
              </div>
              {subscription.subscription_end && (
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted-foreground">
                    {subscription.cancel_at_period_end ? "Expires" : "Next billing"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(subscription.subscription_end).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="pt-2">
                {isPro ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full font-heading"
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                  >
                    {portalLoading ? "Loading…" : "Manage Subscription"}
                  </Button>
                ) : (
                  <Link to="/pricing">
                    <Button size="sm" className="w-full font-heading gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Upgrade to Pro
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <Search className="w-4 h-4 text-primary" /> Usage This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {isPro ? (
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Lookups used</span>
                    <span className="font-heading font-semibold">{profile.monthly_lookup_count}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-primary">
                    <Infinity className="w-3.5 h-3.5" />
                    <span>Unlimited — you're on Pro</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">City lookups</span>
                    <span className="font-heading font-semibold">
                      {profile.monthly_lookup_count} / {FREE_LOOKUP_LIMIT}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all ${
                        usagePercent >= 100 ? "bg-destructive" : "bg-primary"
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>
                  {profile.monthly_lookup_count >= FREE_LOOKUP_LIMIT ? (
                    <p className="text-xs text-destructive font-medium">
                      Limit reached — <Link to="/pricing" className="underline">upgrade for unlimited</Link>
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      {FREE_LOOKUP_LIMIT - profile.monthly_lookup_count} lookups remaining this month
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Searches */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Search className="w-4 h-4 text-primary" /> Recent Searches
            </CardTitle>
          </CardHeader>
          <CardContent>
            {searches.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">No searches yet</p>
                <Link to="/">
                  <Button variant="outline" size="sm" className="font-heading mt-2">Explore a City</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                {searches.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
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
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <BookmarkPlus className="w-4 h-4 text-primary" /> Saved Cities
              {!isPro && (
                <span className="text-[11px] text-muted-foreground font-normal ml-auto">
                  {savedCities.length} / 10
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {savedCities.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <BookmarkPlus className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-sm text-muted-foreground">No saved cities yet</p>
                <p className="text-xs text-muted-foreground">Search a city and click save to bookmark it</p>
              </div>
            ) : (
              <div className="space-y-1">
                {savedCities.map((c) => (
                  <div key={c.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
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
      </div>
      <Footer />
    </div>
  );
};

export default Account;

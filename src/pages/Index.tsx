import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { lookupCity, generateCityImage, type CityData, type CityImages } from "@/lib/cityLookup";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/services/analytics";
import CityLoadingExperience from "@/components/city/CityLoadingExperience";
import HeroSection from "@/components/city/HeroSection";
import CityResults from "@/components/city/CityResults";
import BigIdea from "@/components/city/BigIdea";
import WhyHere from "@/components/city/WhyHere";
import CityPlanning from "@/components/city/CityPlanning";
import UndergroundInfra from "@/components/city/UndergroundInfra";
import DevelopmentPhase from "@/components/city/DevelopmentPhase";
import ServicesScale from "@/components/city/ServicesScale";
import FundingFlow from "@/components/city/FundingFlow";
import GrowthTimeline from "@/components/city/GrowthTimeline";
import SystemsDashboard from "@/components/city/SystemsDashboard";
import CitySimulation from "@/components/city/CitySimulation";
import Takeaway from "@/components/city/Takeaway";
import ProgressNav from "@/components/city/ProgressNav";
import PaywallModal from "@/components/PaywallModal";
import Footer from "@/components/Footer";

const FREE_LOOKUP_LIMIT = 5;

const Index = () => {
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [cityImages, setCityImages] = useState<CityImages>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const { toast } = useToast();
  const { user, profile, subscription, refreshProfile } = useAuth();

  const handleSearch = async (city: string) => {
    // Usage enforcement for free users
    if (user && subscription.plan !== "pro" && profile) {
      const resetAt = profile.lookup_reset_at ? new Date(profile.lookup_reset_at) : new Date(0);
      const now = new Date();
      const monthsSinceReset =
        (now.getFullYear() - resetAt.getFullYear()) * 12 + (now.getMonth() - resetAt.getMonth());

      if (monthsSinceReset >= 1) {
        await supabase
          .from("profiles")
          .update({ monthly_lookup_count: 0, lookup_reset_at: now.toISOString() })
          .eq("id", user.id);
        await refreshProfile();
      } else if (profile.monthly_lookup_count >= FREE_LOOKUP_LIMIT) {
        setShowPaywall(true);
        return;
      }
    }

    setIsLoading(true);
    setCityData(null);
    setCityImages({});
    try {
      const data = await lookupCity(city);
      setCityData(data);
      analytics.track({ name: "city_searched", properties: { city: data.cityName, state: data.state } });

      // Generate images in parallel (non-blocking)
      const imageStyles = ["hero", "landmark", "street", "aerial"] as const;
      imageStyles.forEach(async (style) => {
        const url = await generateCityImage(data.cityName, style);
        if (url) {
          setCityImages((prev) => ({ ...prev, [style]: url }));
        }
      });

      // Track search and increment usage for signed-in users
      if (user) {
        await supabase.from("search_events").insert({
          user_id: user.id,
          query_text: city,
          city_name: data.cityName,
          state_region: data.state,
          generated_summary: data.summary,
        });

        await supabase
          .from("profiles")
          .update({ monthly_lookup_count: (profile?.monthly_lookup_count ?? 0) + 1 })
          .eq("id", user.id);
        refreshProfile();
      }

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Couldn't look up city", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setCityData(null);
    setCityImages({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSaveCity = async () => {
    if (!user || !cityData) return;

    if (subscription.plan !== "pro") {
      const { count } = await supabase
        .from("saved_cities")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if ((count ?? 0) >= 10) {
        toast({
          title: "Save limit reached",
          description: "Upgrade to Pro for unlimited saved cities.",
          variant: "destructive",
        });
        return;
      }
    }

    const { error } = await supabase.from("saved_cities").insert({
      user_id: user.id,
      city_name: cityData.cityName,
      state_region: cityData.state,
      summary: cityData.summary,
      insights_json: cityData as any,
    });

    if (error) {
      toast({ title: "Couldn't save", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "City saved! 📌", description: `${cityData.cityName} added to your favorites.` });
    }
  };

  if (cityData) {
    return (
      <div className="min-h-[100dvh] bg-background text-foreground pt-14">
        <CityResults data={cityData} images={cityImages} onClear={handleClear} onSave={user ? handleSaveCity : undefined} />
        <Footer />
        <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pt-14">
      <ProgressNav />
      <HeroSection onSearch={handleSearch} isLoading={isLoading} />
      <BigIdea />
      <WhyHere />
      <CityPlanning />
      <UndergroundInfra />
      <DevelopmentPhase />
      <ServicesScale />
      <FundingFlow />
      <GrowthTimeline />
      <SystemsDashboard />
      <CitySimulation />
      <Takeaway />
      <Footer />
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </div>
  );
};

export default Index;

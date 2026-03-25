import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { lookupCity, fetchCityPhotos, generateAIHeroImage, type CityData, type CityImages } from "@/lib/cityLookup";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/services/analytics";
import { toCitySlug } from "@/lib/citySlug";
import CityLoadingExperience from "@/components/city/CityLoadingExperience";
import HeroSection from "@/components/city/HeroSection";
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
import SocialProof from "@/components/city/SocialProof";
import PaywallModal from "@/components/PaywallModal";
import Footer from "@/components/Footer";

const FREE_LOOKUP_LIMIT = 5;

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCity, setLoadingCity] = useState("");
  const [showPaywall, setShowPaywall] = useState(false);
  const { toast } = useToast();
  const { user, profile, subscription, refreshProfile } = useAuth();
  const navigate = useNavigate();

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
    setLoadingCity(city);

    try {
      const data = await lookupCity(city);
      analytics.track({ name: "city_searched", properties: { city: data.cityName, state: data.state } });

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

      // Navigate to the shareable city URL
      const slug = toCitySlug(data.cityName, data.state);
      navigate(`/city/${slug}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Couldn't look up city", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isLoading && <CityLoadingExperience cityName={loadingCity} />}
      </AnimatePresence>

      <div className="min-h-[100dvh] bg-background text-foreground pt-14">
        <ProgressNav />
        <HeroSection onSearch={handleSearch} isLoading={isLoading} />
        <SocialProof />
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
    </>
  );
};

export default Index;

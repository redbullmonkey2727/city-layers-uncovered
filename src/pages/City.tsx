import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { lookupCity, fetchCityPhotos, generateAIHeroImage, type CityData, type CityImages } from "@/lib/cityLookup";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/services/analytics";
import CityLoadingExperience from "@/components/city/CityLoadingExperience";
import CityResults from "@/components/city/CityResults";
import PaywallModal from "@/components/PaywallModal";
import Footer from "@/components/Footer";

const FREE_LOOKUP_LIMIT = 5;

const City = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const passedData = (location.state as any)?.cityData as CityData | undefined;
  const [cityData, setCityData] = useState<CityData | null>(passedData || null);
  const [cityImages, setCityImages] = useState<CityImages>({ photos: [] });
  const [isLoading, setIsLoading] = useState(!passedData);
  const [showPaywall, setShowPaywall] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const { toast } = useToast();
  const { user, profile, subscription, refreshProfile } = useAuth();

  // Convert slug back to city name: "austin-tx" → "Austin, TX"
  const cityFromSlug = slug
    ? slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
        .replace(/ ([A-Z]{2})$/i, ", $1")
    : "";

  // If data was passed via navigation state, just fetch images
  useEffect(() => {
    if (passedData) {
      analytics.track({ name: "city_searched", properties: { city: passedData.cityName, state: passedData.state } });
      fetchCityPhotos(passedData.cityName, 6).then((photos) => {
        setCityImages((prev) => ({ ...prev, photos }));
      });
      generateAIHeroImage(passedData.cityName).then((aiHero) => {
        if (aiHero) setCityImages((prev) => ({ ...prev, aiHero }));
      });
      return;
    }
    if (!cityFromSlug) return;
    performLookup(cityFromSlug);
  }, [slug]);

  // Update document title and OG meta for social sharing
  useEffect(() => {
    if (cityData) {
      document.title = `${cityData.cityName}, ${cityData.state} — Who Built All This?`;
      updateMetaTag("og:title", `${cityData.cityName}, ${cityData.state} — Who Built All This?`);
      updateMetaTag("og:description", cityData.summary.slice(0, 155));
      updateMetaTag("og:url", window.location.href);
      updateMetaTag("description", cityData.summary.slice(0, 155));
    }
    return () => {
      document.title = "Who Built All This?";
    };
  }, [cityData]);

  const updateMetaTag = (name: string, content: string) => {
    const attr = name.startsWith("og:") ? "property" : "name";
    let tag = document.querySelector(`meta[${attr}="${name}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attr, name);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  };

  const performLookup = async (city: string) => {
    // Usage enforcement for free users
    if (user && subscription.plan !== "pro" && profile) {
      const resetAt = profile.lookup_reset_at ? new Date(profile.lookup_reset_at) : new Date(0);
      const now = new Date();
      const isNewDay = now.toDateString() !== resetAt.toDateString();
      if (isNewDay) {
        await supabase
          .from("profiles")
          .update({ monthly_lookup_count: 0, lookup_reset_at: now.toISOString() })
          .eq("id", user.id);
        await refreshProfile();
      } else if (profile.monthly_lookup_count >= FREE_LOOKUP_LIMIT) {
        setShowPaywall(true);
        setIsLoading(false);
        return;
      }
    } else if (!user) {
      const today = new Date().toDateString();
      const stored = localStorage.getItem("anon_lookups");
      const parsed = stored ? JSON.parse(stored) : { date: today, count: 0 };
      if (parsed.date !== today) {
        parsed.date = today;
        parsed.count = 0;
      }
      if (parsed.count >= FREE_LOOKUP_LIMIT) {
        setShowPaywall(true);
        setIsLoading(false);
        return;
      }
      parsed.count++;
      localStorage.setItem("anon_lookups", JSON.stringify(parsed));
    }

    setIsLoading(true);
    setCityData(null);
    setCityImages({ photos: [] });

    try {
      const data = await lookupCity(city);
      setCityData(data);
      analytics.track({ name: "city_searched", properties: { city: data.cityName, state: data.state } });

      fetchCityPhotos(data.cityName, 6).then((photos) => {
        setCityImages((prev) => ({ ...prev, photos }));
      });
      generateAIHeroImage(data.cityName).then((aiHero) => {
        if (aiHero) setCityImages((prev) => ({ ...prev, aiHero }));
      });

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
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Couldn't look up city", description: message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    navigate("/");
  };

  const handleSaveCity = async () => {
    if (!user || !cityData) return;
    if (subscription.plan !== "pro") {
      const { count } = await supabase
        .from("saved_cities")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);
      if ((count ?? 0) >= 10) {
        toast({ title: "Save limit reached", description: "Upgrade to Pro for unlimited saved cities.", variant: "destructive" });
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

  return (
    <>
      <AnimatePresence>
        {isLoading && <CityLoadingExperience cityName={cityFromSlug} />}
      </AnimatePresence>

      {cityData && (
        <div className="min-h-[100dvh] bg-background text-foreground pt-14">
          <CityResults data={cityData} images={cityImages} onClear={handleClear} onSave={user ? handleSaveCity : undefined} />
          <Footer />
        </div>
      )}
      <PaywallModal open={showPaywall} onClose={() => setShowPaywall(false)} />
    </>
  );
};

export default City;

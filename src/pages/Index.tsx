import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { lookupCity, type CityData } from "@/lib/cityLookup";
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

const Index = () => {
  const [cityData, setCityData] = useState<CityData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (city: string) => {
    setIsLoading(true);
    setCityData(null);
    try {
      const data = await lookupCity(city);
      setCityData(data);
      // Scroll to top to see results
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If we have city results, show them
  if (cityData) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <CityResults data={cityData} onClear={handleClear} />
      </div>
    );
  }

  // Otherwise show the educational landing + search
  return (
    <div className="min-h-screen bg-background text-foreground">
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
    </div>
  );
};

export default Index;

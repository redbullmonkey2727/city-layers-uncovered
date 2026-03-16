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

const Index = () => (
  <div className="min-h-screen bg-background text-foreground">
    <ProgressNav />
    <HeroSection />
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

export default Index;

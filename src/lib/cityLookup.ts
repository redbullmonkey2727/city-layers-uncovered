import { supabase } from "@/integrations/supabase/client";

export interface CityData {
  cityName: string;
  state: string;
  nickname: string;
  population: string;
  founded: string;
  summary: string;
  whyHere: {
    reasons: string[];
    originalSettlers: string;
  };
  whoBuiltThis: {
    keyFigures: { name: string; contribution: string; era: string }[];
    majorDevelopers: string;
    keyIndustries: string[];
  };
  infrastructure: {
    waterSource: string;
    powerGrid: string;
    transportNetwork: string;
    notableEngineering: string;
  };
  whatYoureSeeing: {
    architecturalStyle: string;
    neighborhoods: { name: string; character: string; era: string }[];
    landmarks: string[];
    streetLayout: string;
  };
  layers: {
    periods: { era: string; whatWasBuilt: string; whyItMatters: string }[];
  };
  funFacts: string[];
  challenges: string;
}

export async function lookupCity(city: string): Promise<CityData> {
  const { data, error } = await supabase.functions.invoke("city-lookup", {
    body: { city },
  });

  if (error) throw new Error(error.message || "Failed to look up city");
  if (data?.error) throw new Error(data.error);
  if (!data?.success) throw new Error("Unexpected response");

  return data.data as CityData;
}

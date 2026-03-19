import { supabase } from "@/integrations/supabase/client";

export interface CityMilestone {
  year: string;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
  category: "infrastructure" | "population" | "government" | "commerce" | "culture" | "disaster";
  mapDescription?: string;
}

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
  milestones?: CityMilestone[];
}

export interface CityImages {
  hero?: string;
  landmark?: string;
  street?: string;
  aerial?: string;
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

export async function generateCityImage(
  cityName: string,
  style: "hero" | "landmark" | "street" | "aerial"
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("city-image", {
      body: { cityName, style },
    });

    if (error || !data?.success) {
      console.warn(`[city-image] Failed to generate ${style}:`, error?.message || data?.error);
      return null;
    }

    return data.imageUrl;
  } catch (err) {
    console.warn(`[city-image] Error generating ${style}:`, err);
    return null;
  }
}

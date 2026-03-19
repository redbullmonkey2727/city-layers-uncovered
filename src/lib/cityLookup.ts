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

export interface CityPhoto {
  id: string;
  url: string;
  thumbUrl: string;
  blurHash: string | null;
  alt: string;
  width: number;
  height: number;
  credit: { name: string; link: string };
}

export interface CityImages {
  /** Real photos from Unsplash */
  photos: CityPhoto[];
  /** AI-generated hero image (dramatic/conceptual) */
  aiHero?: string;
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

/** Fetch real city photos from Unsplash via edge function */
export async function fetchCityPhotos(cityName: string, count = 6): Promise<CityPhoto[]> {
  try {
    const { data, error } = await supabase.functions.invoke("city-photos", {
      body: { cityName, count },
    });

    if (error || !data?.success) {
      console.warn("[city-photos] Failed:", error?.message || data?.error);
      return [];
    }

    return data.photos as CityPhoto[];
  } catch (err) {
    console.warn("[city-photos] Error:", err);
    return [];
  }
}

/** Generate a single AI hero image — used sparingly for dramatic/conceptual scenes */
export async function generateAIHeroImage(cityName: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke("city-image", {
      body: { cityName, style: "hero" },
    });

    if (error || !data?.success) {
      console.warn("[city-image] AI hero failed:", error?.message || data?.error);
      return null;
    }

    return data.imageUrl;
  } catch (err) {
    console.warn("[city-image] Error:", err);
    return null;
  }
}

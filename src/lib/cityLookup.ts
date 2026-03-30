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

function sanitizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeCityName(cityName: string, state: string): string {
  if (!cityName) return "";

  const normalizedCity = cityName.trim();
  const normalizedState = state.trim();
  if (!normalizedState) return normalizedCity;

  const lowerCity = normalizedCity.toLowerCase();
  const lowerState = normalizedState.toLowerCase();

  if (lowerCity.endsWith(`, ${lowerState}`)) {
    return normalizedCity.slice(0, -(normalizedState.length + 2)).trim();
  }

  if (lowerCity.endsWith(` ${lowerState}`)) {
    return normalizedCity.slice(0, -(normalizedState.length + 1)).trim();
  }

  return normalizedCity;
}

function normalizeCityData(raw: unknown): CityData {
  const source = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>;
  const state = sanitizeString(source.state);
  const cityName = normalizeCityName(sanitizeString(source.cityName), state);

  const whyHere = source.whyHere && typeof source.whyHere === "object" ? source.whyHere : {};
  const whoBuiltThis = source.whoBuiltThis && typeof source.whoBuiltThis === "object" ? source.whoBuiltThis : {};
  const infrastructure = source.infrastructure && typeof source.infrastructure === "object" ? source.infrastructure : {};
  const whatYoureSeeing = source.whatYoureSeeing && typeof source.whatYoureSeeing === "object" ? source.whatYoureSeeing : {};
  const layers = source.layers && typeof source.layers === "object" ? source.layers : {};

  return {
    cityName,
    state,
    nickname: sanitizeString(source.nickname),
    population: sanitizeString(source.population),
    founded: sanitizeString(source.founded),
    summary: sanitizeString(source.summary),
    whyHere: {
      reasons: Array.isArray(whyHere.reasons)
        ? whyHere.reasons.map((reason: unknown) => sanitizeString(reason)).filter(Boolean)
        : [],
      originalSettlers: sanitizeString(whyHere.originalSettlers),
    },
    whoBuiltThis: {
      keyFigures: Array.isArray(whoBuiltThis.keyFigures)
        ? whoBuiltThis.keyFigures.map((figure: unknown) => {
            const item = figure && typeof figure === "object" ? (figure as Record<string, unknown>) : {};
            return {
              name: sanitizeString(item.name),
              contribution: sanitizeString(item.contribution),
              era: sanitizeString(item.era),
            };
          }).filter((figure: { name: string; contribution: string; era: string }) => Boolean(figure.name || figure.contribution || figure.era))
        : [],
      majorDevelopers: sanitizeString(whoBuiltThis.majorDevelopers),
      keyIndustries: Array.isArray(whoBuiltThis.keyIndustries)
        ? whoBuiltThis.keyIndustries.map((industry: unknown) => sanitizeString(industry)).filter(Boolean)
        : [],
    },
    infrastructure: {
      waterSource: sanitizeString(infrastructure.waterSource),
      powerGrid: sanitizeString(infrastructure.powerGrid),
      transportNetwork: sanitizeString(infrastructure.transportNetwork),
      notableEngineering: sanitizeString(infrastructure.notableEngineering),
    },
    whatYoureSeeing: {
      architecturalStyle: sanitizeString(whatYoureSeeing.architecturalStyle),
      neighborhoods: Array.isArray(whatYoureSeeing.neighborhoods)
        ? whatYoureSeeing.neighborhoods.map((neighborhood: unknown) => {
            const item = neighborhood && typeof neighborhood === "object" ? (neighborhood as Record<string, unknown>) : {};
            return {
              name: sanitizeString(item.name),
              character: sanitizeString(item.character),
              era: sanitizeString(item.era),
            };
          }).filter((neighborhood: { name: string; character: string; era: string }) => Boolean(neighborhood.name || neighborhood.character || neighborhood.era))
        : [],
      landmarks: Array.isArray(whatYoureSeeing.landmarks)
        ? whatYoureSeeing.landmarks.map((landmark: unknown) => sanitizeString(landmark)).filter(Boolean)
        : [],
      streetLayout: sanitizeString(whatYoureSeeing.streetLayout),
    },
    layers: {
      periods: Array.isArray(layers.periods)
        ? layers.periods.map((period: unknown) => {
            const item = period && typeof period === "object" ? (period as Record<string, unknown>) : {};
            return {
              era: sanitizeString(item.era),
              whatWasBuilt: sanitizeString(item.whatWasBuilt),
              whyItMatters: sanitizeString(item.whyItMatters),
            };
          }).filter((period: { era: string; whatWasBuilt: string; whyItMatters: string }) => Boolean(period.era || period.whatWasBuilt || period.whyItMatters))
        : [],
    },
    funFacts: Array.isArray(source.funFacts)
      ? source.funFacts.map((fact: unknown) => sanitizeString(fact)).filter(Boolean)
      : [],
    challenges: sanitizeString(source.challenges),
    milestones: Array.isArray(source.milestones)
      ? source.milestones.map((milestone: unknown) => {
          const item = milestone && typeof milestone === "object" ? (milestone as Record<string, unknown>) : {};
          const category = sanitizeString(item.category) as CityMilestone["category"];
          return {
            year: sanitizeString(item.year),
            title: sanitizeString(item.title),
            description: sanitizeString(item.description),
            stat: sanitizeString(item.stat),
            statLabel: sanitizeString(item.statLabel),
            category: ["infrastructure", "population", "government", "commerce", "culture", "disaster"].includes(category)
              ? category
              : "government",
            mapDescription: sanitizeString(item.mapDescription),
          };
        }).filter((milestone: CityMilestone) => Boolean(milestone.year || milestone.title || milestone.description))
      : [],
  };
}

export async function lookupCity(city: string): Promise<CityData> {
  const { data, error } = await supabase.functions.invoke("city-lookup", {
    body: { city },
  });

  if (error) throw new Error(error.message || "Failed to look up city");
  if (data?.error) throw new Error(data.error);
  if (!data?.success) throw new Error("Unexpected response");

  return normalizeCityData(data.data);
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

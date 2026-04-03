import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface UnsplashPhoto {
  id: string;
  urls: { raw: string; full: string; regular: string; small: string; thumb: string };
  alt_description: string | null;
  description: string | null;
  blur_hash: string | null;
  width: number;
  height: number;
  user: { name: string; links: { html: string } };
}

interface CityPhoto {
  id: string;
  url: string;          // optimized URL with size params
  thumbUrl: string;     // small thumbnail
  blurHash: string | null;
  alt: string;
  width: number;
  height: number;
  credit: { name: string; link: string };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {

    const { cityName, count = 6 } = await req.json();
    if (!cityName) {
      return new Response(JSON.stringify({ error: "cityName is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY");
    if (!UNSPLASH_ACCESS_KEY) {
      throw new Error("UNSPLASH_ACCESS_KEY is not configured");
    }

    console.log(`[city-photos] Searching Unsplash for: ${cityName}`);

    // Search Unsplash for city photos — request landscape-oriented images
    const searchUrl = new URL("https://api.unsplash.com/search/photos");
    searchUrl.searchParams.set("query", `${cityName} city skyline architecture`);
    searchUrl.searchParams.set("per_page", String(Math.min(count, 15)));
    searchUrl.searchParams.set("orientation", "landscape");
    searchUrl.searchParams.set("content_filter", "high");

    const response = await fetch(searchUrl.toString(), {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("[city-photos] Unsplash error:", response.status, errText);
      if (response.status === 403 || response.status === 401) {
        throw new Error("Unsplash API key is invalid or rate limited");
      }
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    const results: UnsplashPhoto[] = data.results || [];

    // Transform to our format with optimized URLs
    const photos: CityPhoto[] = results.map((photo) => {
      // Use Unsplash's dynamic resizing — request WebP, fit within 1200px wide, quality 80
      const optimizedUrl = `${photo.urls.raw}&w=1200&h=800&fit=crop&auto=format&q=80`;
      const thumbUrl = `${photo.urls.raw}&w=400&h=300&fit=crop&auto=format&q=70`;

      return {
        id: photo.id,
        url: optimizedUrl,
        thumbUrl,
        blurHash: photo.blur_hash,
        alt: photo.alt_description || photo.description || `${cityName} photograph`,
        width: 1200,
        height: 800,
        credit: {
          name: photo.user.name,
          link: `${photo.user.links.html}?utm_source=whobuiltallthis&utm_medium=referral`,
        },
      };
    });

    console.log(`[city-photos] Found ${photos.length} photos for ${cityName}`);

    return new Response(JSON.stringify({ success: true, photos }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[city-photos] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg, photos: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { cityName, state, population } = await req.json();
    if (!cityName) throw new Error("cityName is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a city futurist and data analyst. You produce detailed 5-year, 10-year, and 25-year forecasts for cities based on current trends, demographics, economics, climate projections, and technology adoption patterns.

Return a JSON object with:

1. "keyStats" — Array of 8-10 current city statistics with projections:
   - "label": stat name (e.g. "Median Home Price")
   - "currentValue": current realistic value as string (e.g. "$385,000")
   - "fiveYear": projected value in 5 years
   - "tenYear": projected value in 10 years
   - "twentyFiveYear": projected value in 25 years
   - "trend": "rising" | "falling" | "stable"
   - "confidence": "high" | "medium" | "low"
   - "category": "housing" | "economy" | "population" | "climate" | "infrastructure" | "technology" | "quality_of_life"

2. "scenarios" — Array of 3 future scenarios:
   - "name": scenario title (e.g. "Tech Boom Continues")
   - "probability": percentage (number)
   - "description": 2-3 sentences
   - "keyChanges": array of 3-4 bullet points
   - "sentiment": "optimistic" | "neutral" | "pessimistic"

3. "risks" — Array of 5 risks/challenges:
   - "title": risk name
   - "severity": 1-10
   - "timeframe": "near-term" | "medium-term" | "long-term"
   - "description": one sentence
   - "mitigationStatus": "addressed" | "in-progress" | "unaddressed"

4. "opportunities" — Array of 4 opportunities:
   - "title": opportunity name
   - "potential": 1-10
   - "sector": string
   - "description": one sentence

5. "populationForecast" — Array of data points for population chart:
   - "year": number (current year to current+25, every 5 years = 6 points)
   - "population": number
   - "label": formatted string

6. "overallOutlook": "thriving" | "growing" | "stable" | "declining" | "at-risk"
7. "outlookSummary": 2-3 paragraph narrative about the city's future

Make ALL data city-specific and realistic based on real-world knowledge.`;

    const userPrompt = `Generate a comprehensive future outlook and key statistics for ${cityName}, ${state}${population ? ` (current population: ${population})` : ""}. Base projections on real trends for this specific city.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || "";

    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      const braceMatch = raw.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        parsed = JSON.parse(braceMatch[0]);
      } else {
        throw new Error("Could not parse AI response as JSON");
      }
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("city-forecast error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

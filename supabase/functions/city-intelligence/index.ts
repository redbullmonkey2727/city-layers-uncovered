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

    const systemPrompt = `You are a city intelligence analyst creating a Palantir-style data ontology for a city. You identify seemingly unrelated data points across multiple domains and reveal how they connect to tell a bigger story about what's really happening in a city.

Your job is to produce a JSON response with:
1. "dataPoints" — An array of 10-14 data nodes, each representing a real or highly realistic data point about the city. Each has:
   - "id": short kebab-case identifier
   - "domain": one of "economy", "housing", "energy", "weather", "health", "crime", "infrastructure", "demographics", "environment", "education", "politics", "technology"
   - "label": short title (3-6 words)
   - "value": a specific number, percentage, or short metric (be realistic)
   - "unit": the unit of measurement
   - "trend": "up", "down", or "stable"
   - "trendPercent": a realistic percentage change (number)
   - "insight": one sentence explaining what this data point means
   - "severity": "low", "medium", "high", or "critical"

2. "connections" — An array of 8-12 edges between data points showing causal or correlational relationships. Each has:
   - "from": id of source node
   - "to": id of target node
   - "relationship": one sentence explaining the causal link
   - "strength": 1-5 (how strong the correlation)

3. "narrative" — A 3-4 paragraph intelligence briefing that weaves ALL the data points together into a coherent story. Written like a classified intelligence report — professional, analytical, with clear cause-effect chains. Start with "INTELLIGENCE BRIEFING:" and include section headers like "PRIMARY FINDING:", "SECONDARY INDICATORS:", "OUTLOOK:".

4. "threatLevel": overall city health assessment: "stable", "watch", "elevated", "critical"

5. "keyInsight": One sentence that captures the single most important finding from connecting all the dots.

Make the data realistic for the specific city. Use real-world knowledge about the city's economy, geography, climate, demographics, and recent trends. The magic is in the CONNECTIONS — show how weather affects energy costs, which affects housing affordability, which drives demographic shifts, etc.`;

    const userPrompt = `Generate a city intelligence ontology for ${cityName}, ${state}${population ? ` (population: ${population})` : ""}. Use real-world knowledge to create realistic, interconnected data points that reveal the bigger picture of what's happening in this city right now.`;

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
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const aiData = await response.json();
    const raw = aiData.choices?.[0]?.message?.content || "";

    // Extract JSON from response
    const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, raw];
    let parsed;
    try {
      parsed = JSON.parse(jsonMatch[1]!.trim());
    } catch {
      // Try to find JSON object directly
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
    console.error("city-intelligence error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

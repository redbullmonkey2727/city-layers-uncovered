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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { cityName, state, population, infrastructure, challenges } = await req.json();
    if (!cityName) throw new Error("cityName is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a city resilience analyst. You generate hyper-detailed, city-specific "What If" failure scenario data for a given city. Use real knowledge about the city's actual infrastructure, geography, population, climate, and vulnerabilities.

Return JSON with this exact structure:
{
  "systems": [
    {
      "id": "power",
      "label": "Power Grid",
      "emoji": "⚡",
      "status": "operational",
      "metrics": [
        { "label": "Grid Capacity", "value": "4,200 MW", "status": "good" },
        { "label": "Peak Demand", "value": "3,100 MW", "status": "warning" },
        { "label": "Renewable %", "value": "18%", "status": "info" },
        { "label": "Avg Outage/yr", "value": "2.1 hrs", "status": "good" }
      ],
      "vulnerabilities": ["Aging transmission lines", "Hurricane exposure"],
      "dependents": ["water", "internet", "transit", "emergency"],
      "realWorldExample": "In 2021, Winter Storm Uri caused...",
      "failureTimeline": [
        { "time": "0 min", "event": "Grid goes dark", "severity": "critical" },
        { "time": "30 min", "event": "Hospitals switch to backup generators", "severity": "high" },
        { "time": "2 hrs", "event": "Water pressure drops as pumps fail", "severity": "high" },
        { "time": "6 hrs", "event": "Cell towers begin losing battery backup", "severity": "high" },
        { "time": "24 hrs", "event": "Food spoilage begins in warehouses", "severity": "medium" },
        { "time": "72 hrs", "event": "Full public health emergency declared", "severity": "critical" }
      ],
      "recoveryTime": "24-72 hours",
      "populationAffected": "100%",
      "economicImpact": "$50M per day"
    }
  ],
  "cascadeScenarios": [
    {
      "name": "Total Blackout",
      "trigger": "power",
      "description": "A major grid failure cascading through all dependent systems",
      "chain": ["power", "water", "internet", "transit", "emergency", "food"],
      "totalImpact": "City-wide emergency within 6 hours"
    }
  ],
  "citySpecificRisks": [
    {
      "risk": "Hurricane Season",
      "probability": "high",
      "primarySystems": ["power", "water", "transit"],
      "description": "Annual hurricane season threatens coastal infrastructure..."
    }
  ],
  "resilienceScore": 62,
  "resilienceGrade": "C+",
  "resilienceFactors": [
    { "factor": "Grid redundancy", "score": 45, "maxScore": 100 },
    { "factor": "Emergency response capacity", "score": 78, "maxScore": 100 }
  ]
}

Generate exactly 8 systems: power, water, internet, transit, waste, emergency, food, healthcare.
Each system must have 4 metrics, 2-3 vulnerabilities, and 5-7 failure timeline events.
Generate 3 cascade scenarios specific to the city's real risks (climate, geography, infrastructure age).
Generate 3-4 city-specific risks based on real knowledge.
Make ALL data realistic and specific to ${cityName}, ${state}. Reference real infrastructure, real weather patterns, real historical events.`;

    const userPrompt = `Generate a comprehensive What-If failure analysis for ${cityName}, ${state} (population: ${population || "unknown"}).
${infrastructure ? `Known infrastructure: Water: ${infrastructure.waterSource}, Power: ${infrastructure.powerGrid}, Transport: ${infrastructure.transportNetwork}, Notable: ${infrastructure.notableEngineering}` : ""}
${challenges ? `Known challenges: ${challenges}` : ""}
Be as city-specific as possible. Reference actual infrastructure systems, geographic vulnerabilities, and historical incidents.`;

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
        temperature: 0.6,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
      if (braceMatch) parsed = JSON.parse(braceMatch[0]);
      else throw new Error("Could not parse AI response");
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("city-whatif error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

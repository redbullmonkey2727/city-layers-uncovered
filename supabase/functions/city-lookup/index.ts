import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {

    const { city } = await req.json();
    if (!city || typeof city !== "string") {
      return new Response(
        JSON.stringify({ error: "City name is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`[city-lookup] Looking up: ${city}`);

    const systemPrompt = `You are an expert urban historian. Given a city name, return ONLY a valid JSON object (no markdown, no code fences) with this structure:
{
  "cityName": "Full official name",
  "state": "State/province",
  "nickname": "Common nickname",
  "population": "Current estimated population",
  "founded": "Year founded",
  "summary": "2-3 captivating sentences about the city",
  "whyHere": {
    "reasons": ["3-5 reasons this location was chosen"],
    "originalSettlers": "Who first settled here"
  },
  "whoBuiltThis": {
    "keyFigures": [{"name": "Name", "contribution": "What they did", "era": "When"}],
    "majorDevelopers": "Key developers",
    "keyIndustries": ["Industries that drove growth"]
  },
  "infrastructure": {
    "waterSource": "Water source",
    "powerGrid": "Power info",
    "transportNetwork": "Transport info",
    "notableEngineering": "Notable engineering"
  },
  "whatYoureSeeing": {
    "architecturalStyle": "Dominant styles",
    "neighborhoods": [{"name": "Name", "character": "Character", "era": "Era"}],
    "landmarks": ["Notable landmarks"],
    "streetLayout": "Street layout explanation"
  },
  "layers": {
    "periods": [{"era": "Period", "whatWasBuilt": "What was built", "whyItMatters": "Legacy"}]
  },
  "funFacts": ["3-5 surprising facts"],
  "challenges": "Current challenges",
  "milestones": [
    {
      "year": "1803",
      "title": "Short headline of the milestone",
      "description": "2-3 sentences about this milestone event, what happened and its significance.",
      "stat": "Population: 4,200",
      "statLabel": "at time of event",
      "category": "infrastructure|population|government|commerce|culture|disaster",
      "mapDescription": "Brief note about city boundary at this time"
    }
  ]
}
Include 8-12 milestones spanning the city's full history from founding to modern day. Categories must be one of: infrastructure, population, government, commerce, culture, disaster. Each milestone must have a real stat/figure from that era.
Be specific and factual. Use real names and dates.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Tell me about ${city}. Return only the JSON object.` },
        ],
        temperature: 0.7,
        max_tokens: 8192,
      }),
    });

    console.log(`[city-lookup] AI response status: ${response.status}`);

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("[city-lookup] AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    console.log("[city-lookup] AI response received");

    // Try tool_calls first, then content
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall) {
      const cityData = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ success: true, data: cityData }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const content = aiData.choices?.[0]?.message?.content;
    if (content) {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseErr) {
        console.error("[city-lookup] JSON parse error, attempting repair:", (parseErr as Error).message);
        // Try to repair truncated JSON by closing open braces/brackets
        let repaired = cleaned;
        // Remove any trailing incomplete key-value pair
        repaired = repaired.replace(/,\s*"[^"]*"?\s*:?\s*[^}\]]*$/, "");
        // Count and close open braces/brackets
        const opens = (repaired.match(/{/g) || []).length;
        const closes = (repaired.match(/}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/\]/g) || []).length;
        for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += "]";
        for (let i = 0; i < opens - closes; i++) repaired += "}";
        try {
          parsed = JSON.parse(repaired);
          console.log("[city-lookup] JSON repair successful");
        } catch {
          throw new Error("Could not parse AI response as JSON");
        }
      }
      console.log("[city-lookup] Successfully parsed city data");
      return new Response(JSON.stringify({ success: true, data: parsed }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("No response content from AI");
  } catch (error) {
    console.error("[city-lookup] Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    const systemPrompt = `You are an expert urban historian and infrastructure analyst. When given a city name, provide a comprehensive, fascinating breakdown of who built that city and what a first-time visitor would want to understand about what they're seeing.

Return a JSON object with this exact structure:
{
  "cityName": "Full official name",
  "state": "State/province if applicable",
  "nickname": "City's common nickname if any",
  "population": "Current estimated population as a string",
  "founded": "Year or period founded",
  "summary": "2-3 sentence captivating overview of the city's story",
  "whyHere": {
    "reasons": ["Array of 3-5 reasons this location was chosen"],
    "originalSettlers": "Who first settled here and why"
  },
  "whoBuiltThis": {
    "keyFigures": [{"name": "Person/group name", "contribution": "What they built/did", "era": "When"}],
    "majorDevelopers": "Who were the major developers and builders",
    "keyIndustries": ["Industries that drove growth"]
  },
  "infrastructure": {
    "waterSource": "Where the city's water comes from",
    "powerGrid": "How the city is powered",
    "transportNetwork": "Major roads, transit, rail, airports",
    "notableEngineering": "Any remarkable infrastructure feats"
  },
  "whatYoureSeing": {
    "architecturalStyle": "Dominant architectural styles and why",
    "neighborhoods": [{"name": "Neighborhood name", "character": "What defines it", "era": "When it was built"}],
    "landmarks": ["Notable landmarks and what they represent"],
    "streetLayout": "Why the streets are laid out the way they are"
  },
  "layers": {
    "periods": [{"era": "Time period", "whatWasBuilt": "What was added", "whyItMatters": "Legacy today"}]
  },
  "funFacts": ["3-5 surprising infrastructure or building facts about this city"],
  "challenges": "Current infrastructure challenges the city faces"
}

Be specific, accurate, and fascinating. Avoid generic statements. Include real names, dates, and details. Make invisible systems visible.`;

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
          { role: "user", content: `Tell me everything about who built ${city} and what a first-time visitor should understand about what they're seeing. Be specific and use real facts.` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "city_insights",
              description: "Return structured city infrastructure and history data",
              parameters: {
                type: "object",
                properties: {
                  cityName: { type: "string" },
                  state: { type: "string" },
                  nickname: { type: "string" },
                  population: { type: "string" },
                  founded: { type: "string" },
                  summary: { type: "string" },
                  whyHere: {
                    type: "object",
                    properties: {
                      reasons: { type: "array", items: { type: "string" } },
                      originalSettlers: { type: "string" },
                    },
                    required: ["reasons", "originalSettlers"],
                  },
                  whoBuiltThis: {
                    type: "object",
                    properties: {
                      keyFigures: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            contribution: { type: "string" },
                            era: { type: "string" },
                          },
                          required: ["name", "contribution", "era"],
                        },
                      },
                      majorDevelopers: { type: "string" },
                      keyIndustries: { type: "array", items: { type: "string" } },
                    },
                    required: ["keyFigures", "majorDevelopers", "keyIndustries"],
                  },
                  infrastructure: {
                    type: "object",
                    properties: {
                      waterSource: { type: "string" },
                      powerGrid: { type: "string" },
                      transportNetwork: { type: "string" },
                      notableEngineering: { type: "string" },
                    },
                    required: ["waterSource", "powerGrid", "transportNetwork", "notableEngineering"],
                  },
                  whatYoureSeeing: {
                    type: "object",
                    properties: {
                      architecturalStyle: { type: "string" },
                      neighborhoods: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            character: { type: "string" },
                            era: { type: "string" },
                          },
                          required: ["name", "character", "era"],
                        },
                      },
                      landmarks: { type: "array", items: { type: "string" } },
                      streetLayout: { type: "string" },
                    },
                    required: ["architecturalStyle", "neighborhoods", "landmarks", "streetLayout"],
                  },
                  layers: {
                    type: "object",
                    properties: {
                      periods: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            era: { type: "string" },
                            whatWasBuilt: { type: "string" },
                            whyItMatters: { type: "string" },
                          },
                          required: ["era", "whatWasBuilt", "whyItMatters"],
                        },
                      },
                    },
                    required: ["periods"],
                  },
                  funFacts: { type: "array", items: { type: "string" } },
                  challenges: { type: "string" },
                },
                required: [
                  "cityName", "state", "nickname", "population", "founded", "summary",
                  "whyHere", "whoBuiltThis", "infrastructure", "whatYoureSeeing",
                  "layers", "funFacts", "challenges",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "city_insights" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      // Fallback: try parsing content as JSON
      const content = aiData.choices?.[0]?.message?.content;
      if (content) {
        try {
          const parsed = JSON.parse(content);
          return new Response(JSON.stringify({ success: true, data: parsed }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch {
          throw new Error("Could not parse AI response");
        }
      }
      throw new Error("No structured response from AI");
    }

    const cityData = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify({ success: true, data: cityData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("city-lookup error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

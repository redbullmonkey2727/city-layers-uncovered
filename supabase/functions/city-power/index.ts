import { serve } from "https://deno.land/std@0.168.0/http/server.ts";


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

    const systemPrompt = `You are an expert political analyst and investigative journalist. Given a city, return ONLY valid JSON (no markdown fences) with this exact structure:

{
  "mayor": {
    "name": "Full name",
    "party": "Democrat|Republican|Independent|Nonpartisan",
    "since": "Year took office",
    "previousRole": "What they did before",
    "keyPolicies": ["3-4 signature policies or initiatives"],
    "approvalEstimate": "High|Medium|Low based on general sentiment"
  },
  "cityCouncil": {
    "totalSeats": 9,
    "democrats": 5,
    "republicans": 3,
    "independent": 1,
    "keyMembers": [
      {"name": "Name", "district": "District/At-Large", "party": "Party", "focus": "Their main policy focus"}
    ]
  },
  "stateGovernor": {
    "name": "Name",
    "party": "Party"
  },
  "congressionalReps": [
    {"name": "Name", "party": "Party", "chamber": "House|Senate", "district": "District number or state-wide"}
  ],
  "powerBrokers": [
    {
      "name": "Full name",
      "role": "CEO of X / Founder of Y / Developer",
      "sector": "real_estate|tech|finance|healthcare|energy|media|philanthropy|labor",
      "influence": "high|medium",
      "description": "2-3 sentences on how they shape the city — developments, donations, political connections",
      "estimatedInvestment": "$500M+ in downtown developments",
      "politicalLean": "Democrat|Republican|Bipartisan|Unknown"
    }
  ],
  "majorDevelopers": [
    {
      "name": "Company or person name",
      "notableProjects": ["Project 1", "Project 2"],
      "estimatedValue": "$2B+ portfolio",
      "politicalDonations": "Primarily Republican donors|Primarily Democrat donors|Bipartisan|Unknown"
    }
  ],
  "topEmployers": [
    {"name": "Company", "employees": "~15,000", "sector": "tech|healthcare|government|finance|manufacturing|retail|education"}
  ],
  "politicalLandscape": {
    "leaning": "Solid Blue|Lean Blue|Purple/Swing|Lean Red|Solid Red",
    "lastPresidentialVote": {"democrat": 62, "republican": 36, "other": 2},
    "voterTurnout": "68%",
    "keyIssues": ["Housing affordability", "Public transit", "Climate action"],
    "recentControversies": ["Brief description of 1-2 recent political controversies"]
  },
  "moneyFlow": {
    "annualBudget": "$4.2B",
    "topRevenueSource": "Property taxes (42%)",
    "biggestExpense": "Public safety (28%)",
    "recentBondMeasures": ["$1.2B transportation bond (2023)", "$800M housing bond (2022)"],
    "majorFederalGrants": ["$340M infrastructure grant for bridge repairs"]
  },
  "unions": [
    {"name": "Teachers Union Local 123", "members": "~8,000", "influence": "high|medium|low"}
  ],
  "costOfLiving": {
    "index": 78,
    "medianHomePrice": "$385,000",
    "medianRent": "$1,450/mo",
    "medianHouseholdIncome": "$62,000",
    "groceryIndex": 95,
    "transportIndex": 88,
    "healthcareIndex": 92,
    "comparedToNational": "22% below national average"
  },
  "happinessIndex": {
    "score": 72,
    "ranking": "#45 in US",
    "factors": [
      {"name": "Community & Social", "score": 78, "description": "Strong neighborhood associations and community events"},
      {"name": "Income & Employment", "score": 65, "description": "Steady job market but wages lag behind cost increases"},
      {"name": "Health & Wellness", "score": 74, "description": "Good healthcare access, parks, and recreation"},
      {"name": "Safety", "score": 68, "description": "Crime rates trending down but still above national average"},
      {"name": "Education", "score": 80, "description": "Strong public schools and university presence"},
      {"name": "Environment", "score": 71, "description": "Good air quality but urban heat island concerns"}
    ]
  }
}

Be HIGHLY specific and realistic for the actual city. Use real names of real people currently in power. Real companies. Real dollar figures. If you're not certain about exact numbers, give your best realistic estimate based on city size and region. Include 5-8 power brokers, 3-5 major developers, and 5-8 top employers.`;

    const userPrompt = `Generate a detailed power structure and political landscape analysis for ${cityName}, ${state}${population ? ` (population: ${population})` : ""}. Use real, current information about who actually runs this city.`;

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        response_format: { type: "json_object" },
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
    let raw: string = aiData.choices?.[0]?.message?.content || "";

    // Strip markdown fences if present
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) raw = fenceMatch[1];
    raw = raw.trim();

    // Isolate the outermost JSON object
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");
    if (firstBrace !== -1) {
      raw = raw.slice(firstBrace, lastBrace !== -1 ? lastBrace + 1 : undefined);
    }

    const tryRepair = (s: string): string => {
      // Remove trailing commas before } or ]
      let r = s.replace(/,(\s*[}\]])/g, "$1");
      // Balance braces / brackets if truncated
      const openC = (r.match(/\{/g) || []).length;
      const closeC = (r.match(/\}/g) || []).length;
      const openB = (r.match(/\[/g) || []).length;
      const closeB = (r.match(/\]/g) || []).length;
      if (closeB < openB) r += "]".repeat(openB - closeB);
      if (closeC < openC) r += "}".repeat(openC - closeC);
      return r;
    };

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (e1) {
      try {
        parsed = JSON.parse(tryRepair(raw));
      } catch (e2) {
        console.error("city-power JSON parse failed. Raw start:", raw.slice(0, 200));
        console.error("city-power JSON parse failed. Raw end:", raw.slice(-200));
        throw new Error("Could not parse AI response as JSON");
      }
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("city-power error:", e);
    return new Response(
      JSON.stringify({ success: false, error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

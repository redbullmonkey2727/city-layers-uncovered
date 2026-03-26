import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHASES = [
  { label: "Surveying the land", icon: "🗺️", progress: 5, detail: "Analyzing topography & geographic data" },
  { label: "Pulling city records", icon: "📋", progress: 12, detail: "Accessing municipal databases" },
  { label: "Laying underground pipes", icon: "🔧", progress: 22, detail: "Mapping water & sewer infrastructure" },
  { label: "Pouring foundations", icon: "🏗️", progress: 32, detail: "Processing structural engineering data" },
  { label: "Building the grid", icon: "📐", progress: 44, detail: "Rendering street layouts & zoning maps" },
  { label: "Raising the skyline", icon: "🏙️", progress: 56, detail: "Compiling architectural records" },
  { label: "Wiring the systems", icon: "⚡", progress: 68, detail: "Analyzing power & telecom networks" },
  { label: "Connecting transit routes", icon: "🚇", progress: 78, detail: "Mapping public transportation data" },
  { label: "Populating the streets", icon: "🚶", progress: 86, detail: "Loading demographic & census data" },
  { label: "Analyzing economics", icon: "💰", progress: 92, detail: "Processing industry & employment stats" },
  { label: "Finishing touches", icon: "✨", progress: 97, detail: "Generating insights & scoring" },
];

const CITY_FACTS = [
  { fact: "The word 'infrastructure' comes from Latin — meaning 'below the structure.'", category: "Etymology" },
  { fact: "New York City has over 6,300 miles of streets.", category: "Streets" },
  { fact: "Tokyo's subway system moves 8.7 million people daily.", category: "Transit" },
  { fact: "Chicago reversed the flow of its river using engineering.", category: "Engineering" },
  { fact: "London's sewer system was built after the 'Great Stink' of 1858.", category: "History" },
  { fact: "Los Angeles was once a small pueblo of just 44 settlers.", category: "Origins" },
  { fact: "Paris redesigned its entire street layout in the 1850s.", category: "Urban Planning" },
  { fact: "Singapore reclaimed 25% of its land from the sea.", category: "Land" },
  { fact: "Dubai's Burj Khalifa required 330,000 m³ of concrete.", category: "Construction" },
  { fact: "San Francisco's cable cars are the only mobile national historic landmark.", category: "Transit" },
  { fact: "The average US city spends $3.3 billion annually on infrastructure.", category: "Budget" },
  { fact: "Venice is built on 118 small islands connected by 400+ bridges.", category: "Engineering" },
];

// Massively expanded data source list with realistic API names, endpoints, and categories
const DATA_SOURCES = [
  // Government / Census
  { name: "US Census Bureau", endpoint: "api.census.gov/data/2024/acs", category: "Demographics", icon: "📊" },
  { name: "Census ACS 5-Year", endpoint: "api.census.gov/data/acs5", category: "Demographics", icon: "📊" },
  { name: "Census Population Estimates", endpoint: "api.census.gov/data/pep", category: "Population", icon: "👥" },
  // Housing / Real Estate
  { name: "Zillow Home Value Index", endpoint: "api.zillow.com/webservice/ZHVI", category: "Housing", icon: "🏠" },
  { name: "Redfin Market Data", endpoint: "redfin.com/stingray/api/market", category: "Housing", icon: "🏘️" },
  { name: "HUD Fair Market Rents", endpoint: "huduser.gov/portal/datasets/fmr", category: "Housing", icon: "💵" },
  // Employment / Economy
  { name: "BLS Employment Statistics", endpoint: "api.bls.gov/publicAPI/v2/timeseries", category: "Economy", icon: "💼" },
  { name: "BLS Consumer Price Index", endpoint: "api.bls.gov/publicAPI/v2/CPI", category: "Economy", icon: "📈" },
  { name: "BEA GDP by Metro Area", endpoint: "apps.bea.gov/api/data/CAGDP", category: "Economy", icon: "💰" },
  { name: "Federal Reserve FRED", endpoint: "api.stlouisfed.org/fred/series", category: "Economy", icon: "🏦" },
  // Environment / Climate
  { name: "EPA Air Quality System", endpoint: "aqs.epa.gov/aqsweb/api/v2", category: "Environment", icon: "🌬️" },
  { name: "NOAA Climate Data", endpoint: "ncdc.noaa.gov/cdo-web/api/v2", category: "Climate", icon: "🌡️" },
  { name: "NWS Weather Forecast", endpoint: "api.weather.gov/gridpoints", category: "Weather", icon: "⛅" },
  { name: "EPA Superfund Sites", endpoint: "enviro.epa.gov/triexplorer", category: "Environment", icon: "☢️" },
  // Infrastructure / Transport
  { name: "DOT National Bridge Inventory", endpoint: "geo.dot.gov/server/rest/bridges", category: "Infrastructure", icon: "🌉" },
  { name: "FAA Airport Data", endpoint: "services.faa.gov/airport/status", category: "Transport", icon: "✈️" },
  { name: "GTFS Transit Feeds", endpoint: "transitfeeds.com/api/v1/getFeedVersions", category: "Transit", icon: "🚇" },
  { name: "FHWA Traffic Volume", endpoint: "fhwa.dot.gov/policyinformation/travel", category: "Traffic", icon: "🚗" },
  // Safety / Crime
  { name: "FBI UCR Crime Data", endpoint: "api.usa.gov/crime/fbi/sapi", category: "Safety", icon: "🔒" },
  { name: "FEMA National Risk Index", endpoint: "hazards.fema.gov/nri/data-resources", category: "Risk", icon: "⚠️" },
  { name: "NFIRS Fire Incidents", endpoint: "usfa.fema.gov/nfirs/data", category: "Safety", icon: "🚒" },
  // Education / Health
  { name: "NCES School District Data", endpoint: "nces.ed.gov/ccd/schoolsearch", category: "Education", icon: "🎓" },
  { name: "CDC PLACES Health Data", endpoint: "data.cdc.gov/api/views/PLACES", category: "Health", icon: "🏥" },
  { name: "CMS Hospital Compare", endpoint: "data.cms.gov/provider-data/api", category: "Health", icon: "⚕️" },
  // Geospatial
  { name: "USGS Elevation Data", endpoint: "epqs.nationalmap.gov/v1/json", category: "Geography", icon: "🗺️" },
  { name: "OpenStreetMap Overpass", endpoint: "overpass-api.de/api/interpreter", category: "Mapping", icon: "📍" },
  { name: "Mapbox Geocoding", endpoint: "api.mapbox.com/geocoding/v5", category: "Mapping", icon: "🌐" },
  // Energy / Utilities
  { name: "EIA Energy Data", endpoint: "api.eia.gov/v2/electricity", category: "Energy", icon: "⚡" },
  { name: "DOE Solar Resource", endpoint: "developer.nrel.gov/api/solar", category: "Energy", icon: "☀️" },
  // Tech / Innovation
  { name: "USPTO Patent Data", endpoint: "developer.uspto.gov/api-catalog", category: "Innovation", icon: "💡" },
  { name: "FCC Broadband Map", endpoint: "broadbandmap.fcc.gov/api", category: "Technology", icon: "📶" },
  // Imagery
  { name: "Unsplash Photo API", endpoint: "api.unsplash.com/search/photos", category: "Imagery", icon: "📷" },
  { name: "Gemini Vision Model", endpoint: "ai.gateway.lovable.dev/v1/images", category: "AI Generation", icon: "🤖" },
];

// Simulated log entries that scroll like a terminal
const LOG_TEMPLATES = [
  "GET /v2/demographics?city={city} → 200 OK (142ms)",
  "Parsing 847 census block groups...",
  "GET /api/housing/median?zip={zip} → 200 OK (89ms)",
  "Indexing 12,450 property records...",
  "GET /v1/weather/historical?lat={lat}&lon={lon} → 200 OK (201ms)",
  "Processing 10 years of climate data...",
  "GET /api/crime/stats?fips={fips} → 200 OK (167ms)",
  "Aggregating incident reports by district...",
  "GET /v2/transit/routes?agency={agency} → 200 OK (94ms)",
  "Mapping 47 transit routes and 312 stops...",
  "GET /api/education/scores?district={dist} → 200 OK (118ms)",
  "Normalizing school performance metrics...",
  "GET /v1/energy/consumption?state={state} → 200 OK (156ms)",
  "Calculating per-capita energy usage...",
  "GET /api/employment/industries?msa={msa} → 200 OK (134ms)",
  "Building sector employment breakdown...",
  "Running AI model inference on city ontology...",
  "Generating infrastructure resilience score...",
  "Cross-referencing 28 data dimensions...",
  "Compiling interactive city intelligence report...",
  "GET /api/broadband/coverage?geoid={geo} → 200 OK (112ms)",
  "GET /v2/hospitals/quality?city={city} → 200 OK (178ms)",
  "Estimating 5-year population trajectory...",
  "GET /api/patents/count?assignee_city={city} → 200 OK (203ms)",
  "Scoring innovation index from 1,247 patents...",
  "GET /v1/bridges/condition?state={state} → 200 OK (145ms)",
  "Evaluating 89 bridge structural ratings...",
  "Fetching satellite imagery tiles...",
  "Rendering walkability heat map overlay...",
  "GET /api/air-quality/aqi?city={city} → 200 OK (99ms)",
];

interface Props {
  cityName: string;
}

const CityLoadingExperience = ({ cityName }: Props) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [activeStreams, setActiveStreams] = useState<typeof DATA_SOURCES[number][]>([]);
  const [smoothProgress, setSmoothProgress] = useState(0);
  const [logLines, setLogLines] = useState<string[]>([]);
  const [dataPointsLoaded, setDataPointsLoaded] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [bytesTransferred, setBytesTransferred] = useState(0);

  const shuffledFacts = useMemo(() => [...CITY_FACTS].sort(() => Math.random() - 0.5), []);
  const shuffledSources = useMemo(() => [...DATA_SOURCES].sort(() => Math.random() - 0.5), []);
  const shuffledLogs = useMemo(() => [...LOG_TEMPLATES].sort(() => Math.random() - 0.5), []);

  // Advance phases
  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((p) => Math.min(p + 1, PHASES.length - 1));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // Smooth progress interpolation
  useEffect(() => {
    const target = PHASES[phaseIndex].progress;
    const interval = setInterval(() => {
      setSmoothProgress((p) => (p >= target ? target : Math.min(p + 0.5, target)));
    }, 50);
    return () => clearInterval(interval);
  }, [phaseIndex]);

  // Rotate facts
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((f) => (f + 1) % shuffledFacts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [shuffledFacts]);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // Data source connections — stagger them in
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < shuffledSources.length) {
        setActiveStreams((prev) => [...prev, shuffledSources[i]]);
        i++;
      }
    }, 800);
    return () => clearInterval(interval);
  }, [shuffledSources]);

  // Simulated log feed
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < shuffledLogs.length) {
        setLogLines((prev) => [...prev.slice(-5), shuffledLogs[i]]);
        setRequestCount((c) => c + 1);
        setBytesTransferred((b) => b + Math.floor(Math.random() * 500 + 50));
        setDataPointsLoaded((d) => d + Math.floor(Math.random() * 200 + 20));
        i++;
      }
    }, 600);
    return () => clearInterval(interval);
  }, [shuffledLogs]);

  const phase = PHASES[phaseIndex];
  const progressPercent = Math.round(smoothProgress);

  // Group active sources by category for the badge display
  const categoryCount = activeStreams.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background grid */}
      <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="loading-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#loading-grid)" />
        </svg>
      </div>

      {/* Main content — two column on desktop */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col md:flex-row gap-6 items-center md:items-start">

        {/* LEFT: Animation + progress */}
        <div className="flex flex-col items-center flex-shrink-0 md:w-[340px]">
          {/* Construction SVG */}
          <div className="relative w-64 h-40 md:w-80 md:h-52 mb-4" aria-hidden="true">
            <svg viewBox="0 0 400 260" className="w-full h-full">
              <motion.rect x="0" y="220" width="400" height="40" rx="4" fill="hsl(var(--muted))"
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ transformOrigin: "center bottom" }}
              />
              <motion.g initial={{ opacity: 0 }} animate={{ opacity: phaseIndex >= 2 ? 1 : 0 }} transition={{ duration: 0.5 }}>
                <motion.line x1="30" y1="240" x2="370" y2="240" stroke="hsl(var(--infra-water))" strokeWidth="3" strokeDasharray="6 4"
                  initial={{ pathLength: 0 }} animate={{ pathLength: phaseIndex >= 2 ? 1 : 0 }} transition={{ duration: 1.5 }}
                />
                <motion.line x1="30" y1="250" x2="370" y2="250" stroke="hsl(var(--infra-sewer))" strokeWidth="3" strokeDasharray="6 4"
                  initial={{ pathLength: 0 }} animate={{ pathLength: phaseIndex >= 2 ? 1 : 0 }} transition={{ duration: 1.5, delay: 0.3 }}
                />
              </motion.g>
              <motion.rect x="0" y="210" width="400" height="14" rx="2" fill="hsl(var(--infra-road))"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: phaseIndex >= 4 ? 1 : 0, opacity: phaseIndex >= 4 ? 1 : 0 }}
                transition={{ duration: 1 }} style={{ transformOrigin: "left center" }}
              />
              {[
                { x: 40, w: 45, h: 60, delay: 0 },
                { x: 100, w: 35, h: 45, delay: 0.2 },
                { x: 150, w: 50, h: 90, delay: 0.4 },
                { x: 215, w: 40, h: 120, delay: 0.6 },
                { x: 270, w: 55, h: 80, delay: 0.8 },
                { x: 340, w: 40, h: 55, delay: 1 },
              ].map((b, i) => (
                <motion.rect key={i} x={b.x} y={210 - b.h} width={b.w} height={b.h} rx="3"
                  fill={i === 3 ? "hsl(var(--primary) / 0.3)" : `hsl(var(--muted-foreground) / ${0.2 + i * 0.04})`}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: phaseIndex >= 5 ? 1 : 0, opacity: phaseIndex >= 5 ? 1 : 0 }}
                  transition={{ duration: 0.8, delay: b.delay, ease: "easeOut" }}
                  style={{ transformOrigin: `${b.x + b.w / 2}px 210px` }}
                />
              ))}
              {phaseIndex >= 6 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  {[
                    { x: 225, y: 110 }, { x: 225, y: 130 }, { x: 225, y: 150 }, { x: 225, y: 170 },
                    { x: 240, y: 120 }, { x: 240, y: 140 }, { x: 240, y: 160 },
                    { x: 160, y: 140 }, { x: 160, y: 160 }, { x: 175, y: 145 },
                  ].map((w, i) => (
                    <motion.rect key={i} x={w.x} y={w.y} width="6" height="6" rx="1" fill="hsl(var(--primary) / 0.6)"
                      animate={{ opacity: [0.2, 0.9, 0.2] }}
                      transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </motion.g>
              )}
              {phaseIndex >= 8 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <motion.circle key={i} cy="215" r="2.5" fill="hsl(var(--primary) / 0.7)"
                      animate={{ cx: [60 + i * 80, 120 + i * 80] }}
                      transition={{ duration: 3 + i, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                    />
                  ))}
                </motion.g>
              )}
              {phaseIndex >= 3 && phaseIndex <= 6 && (
                <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                  <line x1="310" y1="50" x2="310" y2="210" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" />
                  <line x1="280" y1="55" x2="350" y2="55" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" />
                  <motion.line x1="330" y1="55" x2="330" y2="90" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1"
                    animate={{ y2: [85, 100, 85] }} transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.g>
              )}
            </svg>
          </div>

          {/* City name */}
          <motion.h2 className="text-xl md:text-2xl font-heading font-bold mb-1 text-foreground text-center"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          >
            Building <span className="text-gradient">{cityName}</span>
          </motion.h2>

          {/* Phase label */}
          <div className="h-10 flex flex-col items-center justify-center mb-3">
            <AnimatePresence mode="wait">
              <motion.div key={phaseIndex} className="flex flex-col items-center"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
              >
                <p className="text-sm text-muted-foreground font-body flex items-center gap-2">
                  <span>{phase.icon}</span><span>{phase.label}</span>
                </p>
                <p className="text-[9px] text-muted-foreground/50 font-mono mt-0.5">{phase.detail}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="w-full max-w-[280px] mb-3">
            <div className="h-2 bg-muted rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full relative"
                style={{ width: `${smoothProgress}%` }}
              >
                <motion.div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-primary-foreground/20"
                  animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 1, repeat: Infinity }}
                />
              </motion.div>
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] font-mono">
              <span className="text-muted-foreground/60">{elapsed}s elapsed</span>
              <motion.span className="text-primary font-bold" key={progressPercent}
                initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}
              >
                {progressPercent}%
              </motion.span>
            </div>
          </div>

          {/* Live metrics counters */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] mb-3">
            {[
              { label: "API Calls", value: requestCount, suffix: "" },
              { label: "Data Points", value: dataPointsLoaded.toLocaleString(), suffix: "" },
              { label: "Transferred", value: `${(bytesTransferred / 1024).toFixed(1)}`, suffix: "KB" },
            ].map((m) => (
              <div key={m.label} className="bg-muted/30 rounded-lg p-2 text-center">
                <motion.span className="text-sm font-heading font-bold text-primary block"
                  key={String(m.value)} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
                >
                  {m.value}{m.suffix}
                </motion.span>
                <span className="text-[8px] text-muted-foreground/50 font-mono uppercase">{m.label}</span>
              </div>
            ))}
          </div>

          {/* Fun fact */}
          <div className="max-w-[280px] h-14 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div key={factIndex} className="text-center"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
              >
                <span className="text-[8px] text-primary/50 font-mono uppercase tracking-widest">{shuffledFacts[factIndex].category}</span>
                <p className="text-[11px] text-muted-foreground/70 italic font-body leading-relaxed mt-0.5">
                  "{shuffledFacts[factIndex].fact}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT: Live data panel */}
        <div className="flex-1 min-w-0 hidden md:flex flex-col gap-3 max-h-[80vh] overflow-hidden">
          {/* Connected sources header */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-widest">
              Live Data Pipeline
            </p>
            <span className="text-[10px] font-mono text-primary/60">
              {activeStreams.length}/{DATA_SOURCES.length} sources connected
            </span>
          </div>

          {/* Category summary badges */}
          <div className="flex flex-wrap gap-1">
            {Object.entries(categoryCount).map(([cat, count]) => (
              <motion.span key={cat}
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                className="text-[8px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground/60 font-mono"
              >
                {cat} ({count})
              </motion.span>
            ))}
          </div>

          {/* Data source list — scrolling feed */}
          <div className="flex-1 overflow-hidden rounded-lg bg-muted/20 border border-border/30 p-2">
            <div className="space-y-1 max-h-[220px] overflow-hidden">
              {activeStreams.slice(-12).map((source, i) => (
                <motion.div
                  key={`${source.name}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 text-[10px] py-0.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 animate-pulse flex-shrink-0" />
                  <span className="flex-shrink-0">{source.icon}</span>
                  <span className="text-foreground/80 font-medium flex-shrink-0">{source.name}</span>
                  <span className="text-muted-foreground/30 font-mono truncate">{source.endpoint}</span>
                  <span className="ml-auto text-[8px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/60 font-mono flex-shrink-0">
                    {source.category}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Terminal-style log feed */}
          <div className="rounded-lg bg-card/80 border border-border/30 p-2 font-mono">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-red-500/60" />
                <span className="w-2 h-2 rounded-full bg-amber-500/60" />
                <span className="w-2 h-2 rounded-full bg-emerald-500/60" />
              </div>
              <span className="text-[8px] text-muted-foreground/40 uppercase">Request Log</span>
            </div>
            <div className="space-y-0.5 max-h-[120px] overflow-hidden">
              {logLines.map((line, i) => (
                <motion.p
                  key={`${line}-${i}`}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-[9px] leading-relaxed ${
                    line.includes("200 OK") ? "text-emerald-500/70" :
                    line.includes("Running") || line.includes("Generating") || line.includes("Compiling") ? "text-primary/70" :
                    "text-muted-foreground/50"
                  }`}
                >
                  <span className="text-muted-foreground/30 mr-1.5">{`>`}</span>
                  {line}
                </motion.p>
              ))}
              <motion.span
                className="inline-block w-1.5 h-3 bg-primary/60"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: compact data source ticker */}
      <div className="md:hidden w-full max-w-sm px-4 mt-3">
        <div className="flex items-center gap-2 mb-1.5">
          <p className="text-[9px] text-muted-foreground/40 font-mono uppercase tracking-widest">Live Pipeline</p>
          <span className="text-[9px] font-mono text-primary/60">{activeStreams.length} sources</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {activeStreams.slice(-8).map((source, i) => (
            <motion.span key={`m-${source.name}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              className="text-[8px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/70 font-mono flex items-center gap-1"
            >
              <span className="w-1 h-1 rounded-full bg-emerald-500/80 animate-pulse" />
              {source.icon} {source.name}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Ambient pulse ring */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full border border-primary/5 pointer-events-none"
        animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0, 0.1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
    </motion.div>
  );
};

export default CityLoadingExperience;

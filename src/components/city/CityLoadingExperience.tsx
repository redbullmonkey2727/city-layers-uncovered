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

const DATA_STREAMS = [
  "Census Bureau API",
  "Zillow Housing Index",
  "BLS Employment Data",
  "EPA Air Quality Index",
  "DOT Traffic Data",
  "FEMA Risk Assessment",
  "USGS Geographic Data",
  "FBI Crime Statistics",
];

interface Props {
  cityName: string;
}

const CityLoadingExperience = ({ cityName }: Props) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [activeStreams, setActiveStreams] = useState<string[]>([]);
  const [smoothProgress, setSmoothProgress] = useState(0);

  const shuffledFacts = useMemo(
    () => [...CITY_FACTS].sort(() => Math.random() - 0.5),
    []
  );

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
      setSmoothProgress((p) => {
        if (p >= target) return target;
        return Math.min(p + 0.5, target);
      });
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

  // Simulate data stream connections
  useEffect(() => {
    const shuffled = [...DATA_STREAMS].sort(() => Math.random() - 0.5);
    let i = 0;
    const interval = setInterval(() => {
      if (i < shuffled.length) {
        setActiveStreams((prev) => [...prev, shuffled[i]]);
        i++;
      }
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  const phase = PHASES[phaseIndex];
  const progressPercent = Math.round(smoothProgress);

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

      {/* Animated construction SVG */}
      <div className="relative w-72 h-48 md:w-96 md:h-64 mb-6" aria-hidden="true">
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
            <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
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
      <motion.h2 className="text-2xl md:text-3xl font-heading font-bold mb-1 text-foreground"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
      >
        Building <span className="text-gradient">{cityName}</span>
      </motion.h2>

      {/* Phase label + detail */}
      <div className="h-12 flex flex-col items-center justify-center mb-4">
        <AnimatePresence mode="wait">
          <motion.div key={phaseIndex} className="flex flex-col items-center"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
          >
            <p className="text-sm md:text-base text-muted-foreground font-body flex items-center gap-2">
              <span>{phase.icon}</span>
              <span>{phase.label}</span>
            </p>
            <p className="text-[10px] text-muted-foreground/50 font-mono mt-0.5">{phase.detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Progress bar with percentage */}
      <div className="w-64 md:w-80 mb-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full relative"
            style={{ width: `${smoothProgress}%` }}
            transition={{ duration: 0.3, ease: "linear" }}
          >
            <motion.div
              className="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-primary-foreground/20"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        </div>
        <div className="flex justify-between mt-2 text-xs font-mono">
          <span className="text-muted-foreground/60">{elapsed}s elapsed</span>
          <motion.span
            className="text-primary font-bold"
            key={progressPercent}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {progressPercent}%
          </motion.span>
        </div>
      </div>

      {/* Live data streams */}
      <div className="w-64 md:w-80 mb-6">
        <p className="text-[10px] text-muted-foreground/40 font-mono uppercase tracking-widest mb-2">Connected Data Sources</p>
        <div className="flex flex-wrap gap-1.5">
          {activeStreams.map((stream, i) => (
            <motion.span
              key={stream}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-[9px] px-2 py-0.5 rounded-full bg-primary/10 text-primary/70 font-mono flex items-center gap-1"
            >
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
              {stream}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Fun fact */}
      <div className="max-w-sm mx-auto px-4 h-16 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div key={factIndex} className="text-center"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}
          >
            <span className="text-[9px] text-primary/50 font-mono uppercase tracking-widest">
              {shuffledFacts[factIndex].category}
            </span>
            <p className="text-xs md:text-sm text-muted-foreground/70 italic font-body leading-relaxed mt-0.5">
              "{shuffledFacts[factIndex].fact}"
            </p>
          </motion.div>
        </AnimatePresence>
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

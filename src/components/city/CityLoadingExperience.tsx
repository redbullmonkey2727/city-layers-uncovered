import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHASES = [
  { label: "Surveying the land", icon: "🗺️", progress: 0 },
  { label: "Laying underground pipes", icon: "🔧", progress: 15 },
  { label: "Pouring foundations", icon: "🏗️", progress: 30 },
  { label: "Building the grid", icon: "📐", progress: 45 },
  { label: "Raising the skyline", icon: "🏙️", progress: 60 },
  { label: "Wiring the systems", icon: "⚡", progress: 75 },
  { label: "Populating the streets", icon: "🚶", progress: 88 },
  { label: "Almost there…", icon: "✨", progress: 96 },
];

const FUN_FACTS = [
  "The word 'infrastructure' comes from Latin — meaning 'below the structure.'",
  "New York City has over 6,300 miles of streets.",
  "Tokyo's subway system moves 8.7 million people daily.",
  "Chicago reversed the flow of its river using engineering.",
  "London's sewer system was built after the 'Great Stink' of 1858.",
  "Los Angeles was once a small pueblo of just 44 settlers.",
  "Paris redesigned its entire street layout in the 1850s.",
  "Singapore reclaimed 25% of its land from the sea.",
];

interface Props {
  cityName: string;
}

const CityLoadingExperience = ({ cityName }: Props) => {
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const shuffledFacts = useMemo(
    () => [...FUN_FACTS].sort(() => Math.random() - 0.5),
    []
  );

  // Advance phases
  useEffect(() => {
    const interval = setInterval(() => {
      setPhaseIndex((p) => Math.min(p + 1, PHASES.length - 1));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  // Rotate facts
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex((f) => (f + 1) % shuffledFacts.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [shuffledFacts]);

  // Elapsed timer
  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const phase = PHASES[phaseIndex];

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
      <div className="relative w-72 h-48 md:w-96 md:h-64 mb-8" aria-hidden="true">
        <svg viewBox="0 0 400 260" className="w-full h-full">
          {/* Ground */}
          <motion.rect
            x="0" y="220" width="400" height="40" rx="4"
            fill="hsl(var(--muted))"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: "center bottom" }}
          />

          {/* Underground pipes */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: phaseIndex >= 1 ? 1 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.line x1="30" y1="240" x2="370" y2="240" stroke="hsl(var(--infra-water))" strokeWidth="3" strokeDasharray="6 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: phaseIndex >= 1 ? 1 : 0 }} transition={{ duration: 1.5 }}
            />
            <motion.line x1="30" y1="250" x2="370" y2="250" stroke="hsl(var(--infra-sewer))" strokeWidth="3" strokeDasharray="6 4"
              initial={{ pathLength: 0 }} animate={{ pathLength: phaseIndex >= 1 ? 1 : 0 }} transition={{ duration: 1.5, delay: 0.3 }}
            />
          </motion.g>

          {/* Road */}
          <motion.rect
            x="0" y="210" width="400" height="14" rx="2"
            fill="hsl(var(--infra-road))"
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: phaseIndex >= 3 ? 1 : 0, opacity: phaseIndex >= 3 ? 1 : 0 }}
            transition={{ duration: 1 }}
            style={{ transformOrigin: "left center" }}
          />

          {/* Buildings - rise up sequentially */}
          {[
            { x: 40, w: 45, h: 60, delay: 0 },
            { x: 100, w: 35, h: 45, delay: 0.2 },
            { x: 150, w: 50, h: 90, delay: 0.4 },
            { x: 215, w: 40, h: 120, delay: 0.6 },
            { x: 270, w: 55, h: 80, delay: 0.8 },
            { x: 340, w: 40, h: 55, delay: 1 },
          ].map((b, i) => (
            <motion.rect
              key={i}
              x={b.x} y={210 - b.h} width={b.w} height={b.h} rx="3"
              fill={i === 3 ? "hsl(var(--primary) / 0.3)" : `hsl(var(--muted-foreground) / ${0.2 + i * 0.04})`}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{
                scaleY: phaseIndex >= 4 ? 1 : 0,
                opacity: phaseIndex >= 4 ? 1 : 0,
              }}
              transition={{ duration: 0.8, delay: b.delay, ease: "easeOut" }}
              style={{ transformOrigin: `${b.x + b.w / 2}px 210px` }}
            />
          ))}

          {/* Windows that light up */}
          {phaseIndex >= 5 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
              {[
                { x: 225, y: 110 }, { x: 225, y: 130 }, { x: 225, y: 150 }, { x: 225, y: 170 },
                { x: 240, y: 120 }, { x: 240, y: 140 }, { x: 240, y: 160 },
                { x: 160, y: 140 }, { x: 160, y: 160 }, { x: 175, y: 145 },
              ].map((w, i) => (
                <motion.rect
                  key={i}
                  x={w.x} y={w.y} width="6" height="6" rx="1"
                  fill="hsl(var(--primary) / 0.6)"
                  animate={{ opacity: [0.2, 0.9, 0.2] }}
                  transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </motion.g>
          )}

          {/* People / activity dots */}
          {phaseIndex >= 6 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {[0, 1, 2, 3].map((i) => (
                <motion.circle
                  key={i}
                  cy="215" r="2.5"
                  fill="hsl(var(--primary) / 0.7)"
                  animate={{ cx: [60 + i * 80, 120 + i * 80] }}
                  transition={{ duration: 3 + i, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                />
              ))}
            </motion.g>
          )}

          {/* Crane (visible during building phase) */}
          {phaseIndex >= 2 && phaseIndex <= 5 && (
            <motion.g
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <line x1="310" y1="50" x2="310" y2="210" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" />
              <line x1="280" y1="55" x2="350" y2="55" stroke="hsl(var(--primary) / 0.4)" strokeWidth="2" />
              <motion.line
                x1="330" y1="55" x2="330" y2="90"
                stroke="hsl(var(--primary) / 0.3)" strokeWidth="1"
                animate={{ y2: [85, 100, 85] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.g>
          )}
        </svg>
      </div>

      {/* City name */}
      <motion.h2
        className="text-2xl md:text-3xl font-heading font-bold mb-2 text-foreground"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Building{" "}
        <span className="text-gradient">{cityName}</span>
      </motion.h2>

      {/* Phase label */}
      <div className="h-8 flex items-center justify-center mb-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={phaseIndex}
            className="text-sm md:text-base text-muted-foreground font-body flex items-center gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <span>{phase.icon}</span>
            <span>{phase.label}</span>
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Progress bar */}
      <div className="w-64 md:w-80 mb-8">
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${phase.progress}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground/60 font-heading">
          <span>{elapsed}s</span>
          <span>{phase.progress}%</span>
        </div>
      </div>

      {/* Fun fact */}
      <div className="max-w-sm mx-auto px-4 h-16 flex items-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={factIndex}
            className="text-xs md:text-sm text-muted-foreground/70 text-center italic font-body leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            "{shuffledFacts[factIndex]}"
          </motion.p>
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

import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { timelineEras } from "@/data/cityData";

const GrowthTimeline = () => {
  const [eraIndex, setEraIndex] = useState(0);
  const era = timelineEras[eraIndex];

  // Simple SVG representation of the city at each era
  const buildingHeights: Record<number, number[]> = {
    0: [], // empty
    1: [15, 12, 10], // hamlet
    2: [20, 18, 15, 22, 12, 18], // small town
    3: [35, 28, 40, 22, 45, 30, 25, 38], // small city
    4: [50, 35, 60, 28, 70, 45, 35, 55, 30, 65], // mature
    5: [65, 45, 80, 38, 90, 55, 48, 70, 42, 85, 50, 60], // metro
  };

  const buildings = buildingHeights[eraIndex] || [];

  return (
    <SectionWrapper
      id="timeline"
      stage={7}
      title="Growth Over Decades"
      subtitle="Cities are never 'finished.' They grow in layers — old pipes beneath new roads, Victorian houses next to glass towers. Drag the timeline to watch a city age."
    >
      {/* City visualization */}
      <div className="glass-card p-6 mb-6 overflow-hidden">
        <svg viewBox="0 0 600 180" className="w-full" style={{ maxHeight: 250 }}>
          {/* Ground */}
          <rect x="0" y="150" width="600" height="30" fill="hsl(var(--muted))" />
          {/* Road */}
          <rect x="0" y="142" width="600" height="10" rx="1" fill="hsl(var(--infra-road) / 0.6)" />

          {/* Underground pipes - more visible in later eras */}
          {eraIndex >= 2 && (
            <g opacity={0.4 + eraIndex * 0.1}>
              <line x1="20" y1="162" x2="580" y2="162" stroke="hsl(var(--infra-water))" strokeWidth="2" strokeDasharray="6 3" />
              <line x1="20" y1="170" x2="580" y2="170" stroke="hsl(var(--infra-sewer))" strokeWidth="2" strokeDasharray="6 3" />
            </g>
          )}

          {/* Buildings */}
          {buildings.map((h, i) => {
            const x = 30 + i * (540 / Math.max(buildings.length, 1));
            const width = Math.min(35, 500 / Math.max(buildings.length, 1) - 8);
            return (
              <motion.rect
                key={`${eraIndex}-${i}`}
                x={x}
                y={142 - h}
                width={width}
                height={h}
                rx={2}
                fill={i % 3 === 0 ? "hsl(var(--primary) / 0.2)" : "hsl(var(--muted-foreground) / 0.25)"}
                initial={{ height: 0, y: 142 }}
                animate={{ height: h, y: 142 - h }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              />
            );
          })}

          {/* Trees */}
          {eraIndex >= 1 && [80, 250, 420, 550].slice(0, eraIndex + 1).map((x) => (
            <g key={x}>
              <circle cx={x} cy="133" r="7" fill="hsl(150 35% 25% / 0.5)" />
              <rect x={x - 1} y="138" width="2" height="5" fill="hsl(30 30% 25% / 0.5)" />
            </g>
          ))}

          {/* Era label */}
          <text x="300" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontFamily="var(--font-heading)" fontWeight="700">
            {era.label}
          </text>
        </svg>
      </div>

      {/* Timeline scrubber */}
      <div className="max-w-3xl mx-auto mb-8">
        <input
          type="range"
          min={0}
          max={timelineEras.length - 1}
          step={1}
          value={eraIndex}
          onChange={(e) => setEraIndex(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted"
          style={{ accentColor: "hsl(var(--primary))" }}
        />
        <div className="flex justify-between mt-2">
          {timelineEras.map((e, i) => (
            <button
              key={i}
              onClick={() => setEraIndex(i)}
              className={`text-[10px] md:text-xs font-heading transition-colors ${
                i === eraIndex ? "text-primary font-semibold" : "text-muted-foreground"
              }`}
            >
              {e.year}
            </button>
          ))}
        </div>
      </div>

      {/* Era details */}
      <motion.div
        key={eraIndex}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="glass-card p-6 max-w-3xl mx-auto"
      >
        <h3 className="font-heading font-bold text-lg mb-2">{era.year} — {era.label}</h3>
        <p className="text-sm text-muted-foreground mb-3">{era.description}</p>
        <div className="flex flex-wrap gap-2">
          {era.features.map((f) => (
            <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-heading">{f}</span>
          ))}
        </div>
      </motion.div>
    </SectionWrapper>
  );
};

export default GrowthTimeline;

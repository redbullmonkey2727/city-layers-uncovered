import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { timelineEras } from "@/data/cityData";

const GrowthTimeline = () => {
  const [eraIndex, setEraIndex] = useState(0);
  const era = timelineEras[eraIndex];

  // Richer building data with types
  type Building = { x: number; w: number; h: number; type: "house" | "commercial" | "tower" | "civic" };
  const eraBuildings: Record<number, Building[]> = {
    0: [],
    1: [
      { x: 200, w: 25, h: 15, type: "house" },
      { x: 260, w: 22, h: 12, type: "house" },
      { x: 310, w: 30, h: 18, type: "commercial" },
    ],
    2: [
      { x: 100, w: 25, h: 18, type: "house" }, { x: 140, w: 22, h: 15, type: "house" },
      { x: 200, w: 30, h: 22, type: "commercial" }, { x: 250, w: 28, h: 20, type: "house" },
      { x: 320, w: 35, h: 28, type: "civic" }, { x: 400, w: 25, h: 15, type: "house" },
    ],
    3: [
      { x: 60, w: 22, h: 18, type: "house" }, { x: 100, w: 25, h: 22, type: "house" },
      { x: 150, w: 30, h: 35, type: "commercial" }, { x: 200, w: 28, h: 28, type: "commercial" },
      { x: 255, w: 35, h: 45, type: "tower" }, { x: 310, w: 30, h: 40, type: "civic" },
      { x: 360, w: 25, h: 30, type: "commercial" }, { x: 420, w: 22, h: 20, type: "house" },
      { x: 470, w: 25, h: 22, type: "house" },
    ],
    4: [
      { x: 40, w: 22, h: 20, type: "house" }, { x: 80, w: 25, h: 25, type: "house" },
      { x: 120, w: 30, h: 35, type: "commercial" }, { x: 170, w: 28, h: 50, type: "tower" },
      { x: 220, w: 35, h: 65, type: "tower" }, { x: 275, w: 30, h: 55, type: "tower" },
      { x: 325, w: 32, h: 45, type: "civic" }, { x: 380, w: 28, h: 35, type: "commercial" },
      { x: 430, w: 25, h: 28, type: "commercial" }, { x: 480, w: 22, h: 22, type: "house" },
      { x: 520, w: 20, h: 18, type: "house" },
    ],
    5: [
      { x: 30, w: 22, h: 25, type: "house" }, { x: 65, w: 25, h: 30, type: "commercial" },
      { x: 105, w: 30, h: 45, type: "tower" }, { x: 150, w: 28, h: 60, type: "tower" },
      { x: 195, w: 35, h: 85, type: "tower" }, { x: 248, w: 32, h: 70, type: "tower" },
      { x: 295, w: 30, h: 90, type: "tower" }, { x: 345, w: 35, h: 55, type: "civic" },
      { x: 395, w: 28, h: 45, type: "commercial" }, { x: 440, w: 30, h: 50, type: "tower" },
      { x: 490, w: 25, h: 35, type: "commercial" }, { x: 530, w: 22, h: 25, type: "house" },
    ],
  };

  const buildings = eraBuildings[eraIndex] || [];
  const buildingColors: Record<string, string> = {
    house: "hsl(var(--muted-foreground) / 0.3)",
    commercial: "hsl(var(--secondary) / 0.25)",
    tower: "hsl(var(--primary) / 0.2)",
    civic: "hsl(var(--infra-power) / 0.25)",
  };

  const baseY = 150;

  return (
    <SectionWrapper
      id="timeline"
      stage={7}
      title="Growth Over Decades"
      subtitle="Cities are never 'finished.' They grow in layers — old pipes beneath new roads, Victorian houses next to glass towers. Drag the timeline to watch a city age."
    >
      {/* City visualization */}
      <div className="glass-card p-6 mb-6 overflow-hidden">
        <svg viewBox="0 0 600 200" className="w-full" style={{ maxHeight: 280 }}>
          {/* Sky gradient */}
          <defs>
            <linearGradient id="timeline-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(220 20% 12%)" />
              <stop offset="100%" stopColor="hsl(220 18% 16%)" />
            </linearGradient>
          </defs>
          <rect x="0" y="0" width="600" height={baseY} fill="url(#timeline-sky)" />

          {/* Stars (visible in early eras) */}
          {eraIndex <= 1 && [50, 150, 300, 420, 530].map((sx, i) => (
            <motion.circle key={sx} cx={sx} cy={10 + i * 8} r={1} fill="hsl(var(--foreground) / 0.3)"
              animate={{ opacity: [0.2, 0.7, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
            />
          ))}

          {/* Ground */}
          <rect x="0" y={baseY} width="600" height="50" fill="hsl(var(--muted))" />
          {/* Road */}
          {eraIndex >= 2 && <rect x="0" y={baseY - 2} width="600" height="6" rx="1" fill="hsl(var(--infra-road) / 0.6)" />}

          {/* Underground pipes */}
          {eraIndex >= 2 && (
            <g opacity={0.3 + eraIndex * 0.1}>
              <line x1="20" y1={baseY + 15} x2="580" y2={baseY + 15} stroke="hsl(var(--infra-water))" strokeWidth="2" strokeDasharray="6 3" />
              <line x1="20" y1={baseY + 25} x2="580" y2={baseY + 25} stroke="hsl(var(--infra-sewer))" strokeWidth="2" strokeDasharray="6 3" />
              {eraIndex >= 4 && <line x1="20" y1={baseY + 35} x2="580" y2={baseY + 35} stroke="hsl(var(--infra-fiber))" strokeWidth="1.5" strokeDasharray="4 2" />}
            </g>
          )}

          {/* Buildings with windows */}
          {buildings.map((b, i) => {
            const y = baseY - b.h;
            return (
              <motion.g
                key={`${eraIndex}-${i}`}
                initial={{ opacity: 0, y: baseY }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
              >
                <rect x={b.x} y={y} width={b.w} height={b.h} rx={1} fill={buildingColors[b.type]} />
                {/* Windows */}
                {b.h > 20 && Array.from({ length: Math.min(Math.floor(b.h / 12), 6) }).map((_, wi) => {
                  const wy = y + 4 + wi * 10;
                  const numW = Math.floor(b.w / 8) - 1;
                  return Array.from({ length: Math.max(1, numW) }).map((_, wj) => (
                    <motion.rect
                      key={`w-${wi}-${wj}`}
                      x={b.x + 4 + wj * 8} y={wy} width={4} height={4} rx={0.5}
                      fill={b.type === "tower" ? "hsl(var(--primary) / 0.4)" : "hsl(var(--foreground) / 0.12)"}
                      animate={eraIndex >= 3 ? { opacity: [0.2, 0.6, 0.2] } : {}}
                      transition={{ duration: 3, repeat: Infinity, delay: (wi + wj) * 0.3 }}
                    />
                  ));
                })}
              </motion.g>
            );
          })}

          {/* Trees */}
          {eraIndex >= 1 && [80, 250, 420, 550].slice(0, eraIndex >= 3 ? 4 : eraIndex + 1).map((x) => (
            <g key={x}>
              <circle cx={x} cy={baseY - 10} r="7" fill="hsl(150 35% 25% / 0.5)" />
              <rect x={x - 1} y={baseY - 5} width="2" height="5" fill="hsl(30 30% 25% / 0.5)" />
            </g>
          ))}

          {/* Moving car in later eras */}
          {eraIndex >= 3 && (
            <motion.rect
              x={0} y={baseY - 5} width="12" height="4" rx="2"
              fill="hsl(var(--primary) / 0.5)"
              animate={{ x: [0, 600] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          )}

          {/* Era label */}
          <text x="300" y="20" textAnchor="middle" fill="hsl(var(--foreground))" fontSize="14" fontFamily="var(--font-heading)" fontWeight="700">
            {era.label}
          </text>
          {/* Population badge */}
          {era.features.find(f => (f || "").includes("people")) && (
            <text x="300" y="35" textAnchor="middle" fill="hsl(var(--primary) / 0.7)" fontSize="9" fontFamily="var(--font-heading)">
              {era.features.find(f => (f || "").includes("people"))}
            </text>
          )}
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

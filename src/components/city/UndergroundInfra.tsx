import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { utilityLayers } from "@/data/cityData";

/** Interactive cross-section diagram showing underground utilities. */
const UndergroundInfra = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = utilityLayers.find((u) => u.id === selectedId);

  // Vertical positions for each utility in the SVG
  const positions: Record<string, number> = {
    fiber: 40,
    gas: 70,
    electric: 105,
    water: 145,
    sewer: 195,
    storm: 250,
  };

  const pipeRadius: Record<string, number> = {
    fiber: 5,
    gas: 7,
    electric: 8,
    water: 12,
    sewer: 15,
    storm: 18,
  };

  return (
    <SectionWrapper
      id="infrastructure"
      stage={3}
      title="The Hidden Miracle Underground"
      subtitle="Before any house is built, an invisible city of pipes and cables must be installed beneath every street. This is the most expensive, most coordinated, and least appreciated part of civilization."
    >
      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Cross-section SVG */}
        <div className="glass-card p-4 md:p-6 overflow-hidden">
          <svg viewBox="0 0 700 320" className="w-full" style={{ maxHeight: 420 }}>
            {/* Sky */}
            <rect x="0" y="0" width="700" height="30" fill="hsl(220 20% 12%)" />

            {/* Surface elements */}
            {/* Streetlight */}
            <rect x="120" y="5" width="3" height="25" fill="hsl(var(--muted-foreground) / 0.5)" />
            <circle cx="126" cy="6" r="4" fill="hsl(var(--primary) / 0.6)" />

            {/* Tree */}
            <circle cx="580" cy="12" r="14" fill="hsl(150 35% 25% / 0.6)" />
            <rect x="578" y="22" width="4" height="8" fill="hsl(30 30% 25% / 0.5)" />

            {/* Sidewalk left */}
            <rect x="0" y="27" width="160" height="8" fill="hsl(var(--muted-foreground) / 0.25)" />
            {/* Road */}
            <rect x="165" y="25" width="370" height="12" rx="1" fill="hsl(var(--infra-road) / 0.8)" />
            {/* Lane markings */}
            {[200, 270, 340, 410, 480].map((x) => (
              <rect key={x} x={x} y="30" width="25" height="2" fill="hsl(var(--primary) / 0.4)" rx="1" />
            ))}
            {/* Sidewalk right */}
            <rect x="540" y="27" width="160" height="8" fill="hsl(var(--muted-foreground) / 0.25)" />

            {/* Curbs */}
            <rect x="160" y="25" width="4" height="12" fill="hsl(var(--muted-foreground) / 0.4)" />
            <rect x="536" y="25" width="4" height="12" fill="hsl(var(--muted-foreground) / 0.4)" />

            {/* Underground soil */}
            <rect x="0" y="37" width="700" height="283" fill="hsl(25 20% 12%)" />

            {/* Soil texture lines */}
            {[60, 100, 150, 200, 260].map((y) => (
              <line key={y} x1="0" y1={y} x2="700" y2={y} stroke="hsl(25 15% 15%)" strokeWidth="0.5" />
            ))}

            {/* Depth markers */}
            {[
              { y: 40, label: "0.5m" },
              { y: 105, label: "1m" },
              { y: 145, label: "1.5m" },
              { y: 195, label: "2.5m" },
              { y: 250, label: "3.5m" },
            ].map((m) => (
              <g key={m.y}>
                <line x1="0" y1={m.y} x2="15" y2={m.y} stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="0.5" />
                <text x="18" y={m.y + 3} fill="hsl(var(--muted-foreground) / 0.4)" fontSize="7" fontFamily="var(--font-body)">
                  {m.label}
                </text>
              </g>
            ))}

            {/* Utility pipes / conduits */}
            {utilityLayers.map((util) => {
              const y = positions[util.id];
              const r = pipeRadius[util.id];
              const isSelected = selectedId === util.id;
              const dimmed = selectedId && !isSelected;

              return (
                <g
                  key={util.id}
                  onClick={() => setSelectedId(isSelected ? null : util.id)}
                  className="cursor-pointer"
                >
                  {/* Glow when selected */}
                  {isSelected && (
                    <motion.ellipse
                      cx="350"
                      cy={y}
                      rx={r * 2 + 15}
                      ry={r + 8}
                      fill={`hsl(${util.color.replace("var(--infra-", "").replace(")", "")} / 0.15)`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}

                  {/* Left pipe */}
                  <circle
                    cx="100"
                    cy={y}
                    r={r}
                    fill={`hsl(${util.color.replace("var(--", "").replace(")", "")})`}
                    opacity={dimmed ? 0.15 : 1}
                    className="transition-opacity duration-300"
                  />
                  {/* Connecting line */}
                  <line
                    x1={100 + r}
                    y1={y}
                    x2={600 - r}
                    y2={y}
                    stroke={`hsl(${util.color.replace("var(--", "").replace(")", "")})`}
                    strokeWidth={r * 0.8}
                    opacity={dimmed ? 0.1 : 0.7}
                    className="transition-opacity duration-300"
                  />
                  {/* Right pipe */}
                  <circle
                    cx="600"
                    cy={y}
                    r={r}
                    fill={`hsl(${util.color.replace("var(--", "").replace(")", "")})`}
                    opacity={dimmed ? 0.15 : 1}
                    className="transition-opacity duration-300"
                  />

                  {/* Label */}
                  <text
                    x="635"
                    y={y + 3}
                    fill={isSelected ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground) / 0.6)"}
                    fontSize="8"
                    fontFamily="var(--font-heading)"
                    fontWeight={isSelected ? "600" : "400"}
                    className="transition-all duration-300"
                  >
                    {util.label}
                  </text>
                </g>
              );
            })}

            {/* "CLICK A PIPE" hint */}
            {!selectedId && (
              <text x="350" y="300" textAnchor="middle" fill="hsl(var(--muted-foreground) / 0.35)" fontSize="10" fontFamily="var(--font-body)">
                Click any utility to explore it
              </text>
            )}
          </svg>
        </div>

        {/* Detail panel */}
        <div className="min-h-[250px]">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="glass-card p-6 space-y-4"
              >
                <h3 className="font-heading text-xl font-bold">{selected.label}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Depth</span>
                    <p className="text-foreground">{selected.depth}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">What it does</span>
                    <p className="text-foreground">{selected.description}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">Managed by</span>
                    <p className="text-foreground">{selected.source}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs uppercase tracking-wider">If it fails…</span>
                    <p className="text-destructive/90">{selected.failureEffect}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-6"
              >
                <h3 className="font-heading text-lg font-bold mb-3">Street Cross-Section</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Beneath every road you drive on, six or more separate utility systems run in parallel — installed by different companies, at different times, to different specifications.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  They must never touch. They must be accessible for repair. And they must all be coordinated before the first house is built.
                </p>
                <p className="text-sm text-primary mt-4 font-medium">
                  Click any pipe in the diagram →
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default UndergroundInfra;

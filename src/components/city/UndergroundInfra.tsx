import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { utilityLayers } from "@/data/cityData";

const UndergroundInfra = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [digMode, setDigMode] = useState(false);
  const [dugLayers, setDugLayers] = useState<Set<string>>(new Set());
  const selected = utilityLayers.find((u) => u.id === selectedId);

  const positions: Record<string, number> = {
    fiber: 40, gas: 70, electric: 105, water: 145, sewer: 195, storm: 250,
  };

  const pipeRadius: Record<string, number> = {
    fiber: 5, gas: 7, electric: 8, water: 12, sewer: 15, storm: 18,
  };

  const handlePipeClick = (id: string) => {
    if (digMode) {
      setDugLayers((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
      });
      setSelectedId(id);
    } else {
      setSelectedId(selectedId === id ? null : id);
    }
  };

  return (
    <SectionWrapper
      id="infrastructure"
      stage={3}
      title="The Hidden Miracle Underground"
      subtitle="Before any house is built, an invisible city of pipes and cables must be installed beneath every street. This is the most expensive, most coordinated, and least appreciated part of civilization."
    >
      {/* Dig mode toggle */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => { setDigMode(!digMode); setDugLayers(new Set()); }}
          className={`px-4 py-2 rounded-lg text-sm font-heading font-medium transition-all ${
            digMode
              ? "bg-primary/20 text-primary border border-primary/30"
              : "glass-card hover:bg-muted"
          }`}
        >
          {digMode ? "⛏️ Dig Mode ON" : "⛏️ Try Dig Mode"}
        </button>
        {digMode && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-primary/70">
            Click pipes to "dig" and reveal them · {dugLayers.size}/{utilityLayers.length} found
          </motion.p>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8 items-start">
        {/* Cross-section SVG */}
        <div className="glass-card p-4 md:p-6 overflow-hidden">
          <svg viewBox="0 0 700 320" className="w-full" style={{ maxHeight: 420 }}>
            {/* Sky */}
            <rect x="0" y="0" width="700" height="30" fill="hsl(220 20% 12%)" />

            {/* Streetlight */}
            <rect x="120" y="5" width="3" height="25" fill="hsl(var(--muted-foreground) / 0.5)" />
            <circle cx="126" cy="6" r="4" fill="hsl(var(--primary) / 0.6)" />
            <motion.circle cx="126" cy="6" r="8" fill="hsl(var(--primary) / 0.1)"
              animate={{ r: [6, 12, 6], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* Tree */}
            <circle cx="580" cy="12" r="14" fill="hsl(150 35% 25% / 0.6)" />
            <rect x="578" y="22" width="4" height="8" fill="hsl(30 30% 25% / 0.5)" />

            {/* Sidewalks */}
            <rect x="0" y="27" width="160" height="8" fill="hsl(var(--muted-foreground) / 0.25)" />
            <rect x="165" y="25" width="370" height="12" rx="1" fill="hsl(var(--infra-road) / 0.8)" />
            {[200, 270, 340, 410, 480].map((x) => (
              <rect key={x} x={x} y="30" width="25" height="2" fill="hsl(var(--primary) / 0.4)" rx="1" />
            ))}
            <rect x="540" y="27" width="160" height="8" fill="hsl(var(--muted-foreground) / 0.25)" />
            <rect x="160" y="25" width="4" height="12" fill="hsl(var(--muted-foreground) / 0.4)" />
            <rect x="536" y="25" width="4" height="12" fill="hsl(var(--muted-foreground) / 0.4)" />

            {/* Moving car */}
            <motion.rect
              x={0} y="28" width="16" height="6" rx="3" fill="hsl(var(--primary) / 0.4)"
              animate={{ x: [0, 700] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            />

            {/* Underground soil */}
            <rect x="0" y="37" width="700" height="283" fill="hsl(25 20% 12%)" />
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

            {/* Utility pipes */}
            {utilityLayers.map((util) => {
              const y = positions[util.id];
              const r = pipeRadius[util.id];
              const isSelected = selectedId === util.id;
              const dimmed = selectedId && !isSelected;
              const hidden = digMode && !dugLayers.has(util.id);

              return (
                <g
                  key={util.id}
                  onClick={() => handlePipeClick(util.id)}
                  className="cursor-pointer"
                >
                  {isSelected && (
                    <motion.ellipse
                      cx="350" cy={y} rx={r * 2 + 15} ry={r + 8}
                      fill={`hsl(${util.color.replace("var(--infra-", "").replace(")", "")} / 0.15)`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0.2, 0.4, 0.2] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    />
                  )}

                  {/* Left pipe */}
                  <circle cx="100" cy={y} r={r}
                    fill={`hsl(${util.color.replace("var(--", "").replace(")", "")})`}
                    opacity={hidden ? 0.05 : dimmed ? 0.15 : 1}
                    className="transition-opacity duration-300"
                  />
                  {/* Connecting line */}
                  <line x1={100 + r} y1={y} x2={600 - r} y2={y}
                    stroke={`hsl(${util.color.replace("var(--", "").replace(")", "")})`}
                    strokeWidth={r * 0.8}
                    opacity={hidden ? 0.03 : dimmed ? 0.1 : 0.7}
                    className="transition-opacity duration-300"
                  />
                  {/* Flow animation when selected */}
                  {isSelected && !hidden && (
                    <motion.circle cx="100" cy={y} r={r * 0.4}
                      fill="hsl(var(--foreground) / 0.5)"
                      animate={{ cx: [100, 600] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  {/* Right pipe */}
                  <circle cx="600" cy={y} r={r}
                    fill={`hsl(${util.color.replace("var(--", "").replace(")", "")})`}
                    opacity={hidden ? 0.05 : dimmed ? 0.15 : 1}
                    className="transition-opacity duration-300"
                  />

                  {/* Label */}
                  <text x="635" y={y + 3}
                    fill={isSelected ? "hsl(var(--foreground))" : hidden ? "hsl(var(--muted-foreground) / 0.15)" : "hsl(var(--muted-foreground) / 0.6)"}
                    fontSize="8" fontFamily="var(--font-heading)"
                    fontWeight={isSelected ? "600" : "400"}
                    className="transition-all duration-300"
                  >
                    {hidden ? "???" : util.label}
                  </text>

                  {/* Dig marker */}
                  {digMode && dugLayers.has(util.id) && (
                    <motion.text x="60" y={y + 3} fontSize="10" fill="hsl(var(--primary))"
                      initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      ✓
                    </motion.text>
                  )}
                </g>
              );
            })}

            {/* Hint */}
            {!selectedId && !digMode && (
              <text x="350" y="300" textAnchor="middle" fill="hsl(var(--muted-foreground) / 0.35)" fontSize="10" fontFamily="var(--font-body)">
                Click any utility to explore it
              </text>
            )}
            {digMode && dugLayers.size === 0 && (
              <text x="350" y="300" textAnchor="middle" fill="hsl(var(--primary) / 0.5)" fontSize="10" fontFamily="var(--font-body)">
                Click to dig and discover what's underground!
              </text>
            )}
            {digMode && dugLayers.size === utilityLayers.length && (
              <motion.text x="350" y="300" textAnchor="middle" fill="hsl(var(--primary))" fontSize="12" fontFamily="var(--font-heading)" fontWeight="600"
                initial={{ scale: 0 }} animate={{ scale: 1 }}>
                🎉 You found all 6 utility systems!
              </motion.text>
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

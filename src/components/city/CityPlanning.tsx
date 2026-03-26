import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

type ZoneType = "residential" | "commercial" | "industrial" | "civic" | "parks";

const zones: { type: ZoneType; label: string; color: string; description: string; emoji: string }[] = [
  { type: "residential", label: "Residential", color: "hsl(38 80% 55%)", description: "Where people live: single-family homes, townhouses, apartments.", emoji: "🏠" },
  { type: "commercial", label: "Commercial", color: "hsl(210 70% 55%)", description: "Shops, offices, restaurants, and services people use daily.", emoji: "🏪" },
  { type: "industrial", label: "Industrial", color: "hsl(0 50% 50%)", description: "Factories, warehouses, and heavy infrastructure kept away from homes.", emoji: "🏭" },
  { type: "civic", label: "Civic / Public", color: "hsl(270 50% 55%)", description: "Schools, libraries, city hall, fire stations — the public backbone.", emoji: "🏛️" },
  { type: "parks", label: "Parks & Open", color: "hsl(140 50% 40%)", description: "Green lungs of the city: parks, trails, plazas, and natural areas.", emoji: "🌳" },
];

const GRID_SIZE = 8;

const defaultGrid: ZoneType[][] = Array.from({ length: GRID_SIZE }, (_, r) =>
  Array.from({ length: GRID_SIZE }, (_, c) => {
    // Create a realistic default layout
    const center = GRID_SIZE / 2 - 0.5;
    const dist = Math.sqrt((r - center) ** 2 + (c - center) ** 2);
    if (dist < 1.2) return "commercial" as ZoneType;
    if ((r === 2 && c === 2) || (r === 5 && c === 5)) return "civic" as ZoneType;
    if ((r === 0 && c === 0) || (r === 7 && c === 7) || (r === 0 && c === 7)) return "parks" as ZoneType;
    if (r >= 6 && c <= 2) return "industrial" as ZoneType;
    return "residential" as ZoneType;
  })
);

const CityPlanning = () => {
  const [grid, setGrid] = useState<ZoneType[][]>(defaultGrid);
  const [paintBrush, setPaintBrush] = useState<ZoneType | null>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [highlight, setHighlight] = useState<ZoneType | null>(null);

  const paintCell = useCallback((r: number, c: number) => {
    if (!paintBrush) return;
    setGrid(prev => {
      const next = prev.map(row => [...row]);
      next[r][c] = paintBrush;
      return next;
    });
  }, [paintBrush]);

  const stats = useMemo(() => {
    const counts: Record<ZoneType, number> = { residential: 0, commercial: 0, industrial: 0, civic: 0, parks: 0 };
    grid.forEach(row => row.forEach(cell => counts[cell]++));
    const total = GRID_SIZE * GRID_SIZE;
    return zones.map(z => ({
      ...z,
      count: counts[z.type],
      percent: Math.round((counts[z.type] / total) * 100),
    }));
  }, [grid]);

  // Score the city layout
  const score = useMemo(() => {
    const s = stats.reduce((acc, z) => ({ ...acc, [z.type]: z.percent }), {} as Record<ZoneType, number>);
    let score = 0;
    // Balanced residential (30-50% ideal)
    if (s.residential >= 30 && s.residential <= 50) score += 2;
    else if (s.residential >= 20 && s.residential <= 60) score += 1;
    // Commercial (10-25%)
    if (s.commercial >= 10 && s.commercial <= 25) score += 2;
    // Parks (8-20%)
    if (s.parks >= 8 && s.parks <= 20) score += 2;
    else if (s.parks >= 5) score += 1;
    // Civic (5-15%)
    if (s.civic >= 5 && s.civic <= 15) score += 1;
    // Industrial separated (not too much, 5-15%)
    if (s.industrial >= 5 && s.industrial <= 15) score += 1;
    return score >= 7 ? "A" : score >= 5 ? "B" : score >= 3 ? "C" : "D";
  }, [stats]);

  const resetGrid = () => setGrid(defaultGrid);

  return (
    <SectionWrapper
      id="planning"
      stage={2}
      title="Planning the Land"
      subtitle="Before a single building goes up, the land is divided into zones. Zoning decides what can be built where — and it shapes every city you've ever seen."
    >
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Zoning grid */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-heading text-muted-foreground uppercase tracking-wider">
              {paintBrush ? `🖌️ Painting: ${zones.find(z => z.type === paintBrush)?.label}` : "Select a zone to paint"}
            </p>
            <div className="flex gap-2">
              <button onClick={resetGrid} className="text-[10px] font-heading text-muted-foreground hover:text-primary transition-colors">
                Reset
              </button>
              <span className={`text-xs font-heading font-bold px-2 py-0.5 rounded-full ${
                score === "A" ? "bg-secondary/20 text-secondary" :
                score === "B" ? "bg-primary/20 text-primary" :
                "bg-destructive/20 text-destructive"
              }`}>
                Grade: {score}
              </span>
            </div>
          </div>

          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
            onMouseLeave={() => setIsPainting(false)}
          >
            {grid.flatMap((row, r) =>
              row.map((cell, c) => {
                const zone = zones.find(z => z.type === cell)!;
                const dimmed = highlight && highlight !== cell;
                return (
                  <motion.div
                    key={`${r}-${c}`}
                    className={`aspect-square rounded-sm cursor-pointer transition-all duration-200 relative group ${
                      paintBrush ? "hover:ring-2 hover:ring-foreground/30" : ""
                    }`}
                    style={{
                      backgroundColor: zone.color,
                      opacity: dimmed ? 0.15 : 1,
                    }}
                    whileHover={{ scale: paintBrush ? 1.2 : 1.1 }}
                    onMouseDown={() => {
                      if (paintBrush) {
                        setIsPainting(true);
                        paintCell(r, c);
                      } else {
                        setHighlight(highlight === cell ? null : cell);
                      }
                    }}
                    onMouseEnter={() => {
                      if (isPainting && paintBrush) paintCell(r, c);
                    }}
                    layout
                  >
                    {/* Show emoji on hover */}
                    <span className="absolute inset-0 flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      {zone.emoji}
                    </span>
                  </motion.div>
                );
              })
            )}
          </div>

          <p className="text-[10px] text-muted-foreground">
            {paintBrush ? "Click and drag to paint zones · Click a zone tool again to deselect" : "Select a zone type below, then paint on the grid"}
          </p>

          {/* Paint tools */}
          <div className="flex gap-2 flex-wrap">
            {zones.map(z => (
              <motion.button
                key={z.type}
                onClick={() => {
                  setPaintBrush(paintBrush === z.type ? null : z.type);
                  setHighlight(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-medium transition-all ${
                  paintBrush === z.type
                    ? "ring-2 ring-foreground/50 bg-foreground/10 shadow-lg"
                    : "glass-card hover:bg-muted"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: z.color }} />
                {z.emoji} {z.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Stats & Legend */}
        <div className="space-y-4">
          {/* Zone breakdown bars */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="font-heading font-semibold text-sm mb-3">Zone Breakdown</h3>
            {stats.map(z => (
              <div key={z.type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-heading flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: z.color }} />
                    {z.emoji} {z.label}
                  </span>
                  <span className="text-xs text-muted-foreground font-heading">{z.percent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: z.color }}
                    animate={{ width: `${z.percent}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Zone info cards */}
          <AnimatePresence mode="wait">
            {highlight ? (
              <motion.div
                key={highlight}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card p-5"
              >
                {(() => {
                  const z = zones.find(z => z.type === highlight)!;
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{z.emoji}</span>
                        <h3 className="font-heading font-bold text-lg">{z.label}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{z.description}</p>
                    </>
                  );
                })()}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-5"
              >
                <p className="text-sm text-muted-foreground mb-2">
                  Real cities use zoning to prevent conflicts — factories next to schools, bars next to churches.
                </p>
                <p className="text-xs text-primary font-heading font-medium">
                  🎨 Select a zone tool and paint your own city layout!
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default CityPlanning;

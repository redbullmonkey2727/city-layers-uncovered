import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

const dependencies = [
  { from: "Utilities", to: "Homes", description: "No homes without water, sewer, and power connections." },
  { from: "Roads", to: "Stores", description: "No businesses without access roads for customers and deliveries." },
  { from: "Population", to: "Schools", description: "Schools only get built when enough families move in." },
  { from: "Jobs", to: "Population", description: "People only move where they can earn a living." },
  { from: "Homes", to: "Tax Base", description: "Property taxes from homes fund everything else." },
];

const actors = [
  { label: "Homebuilders", icon: "🏠", desc: "Build houses and apartments on prepared lots." },
  { label: "Commercial Dev.", icon: "🏢", desc: "Build offices, retail, and mixed-use projects." },
  { label: "Government", icon: "🏛️", desc: "Builds schools, fire stations, roads, and parks." },
  { label: "Utility Companies", icon: "⚡", desc: "Extend water, power, and gas to new areas." },
];

const buildPhases = [
  { label: "Clear & Grade", icon: "🚜", duration: "2-4 weeks", desc: "Remove trees, level ground, set drainage slopes." },
  { label: "Underground Utilities", icon: "🔧", duration: "4-8 weeks", desc: "Lay water, sewer, gas, electric, and telecom lines." },
  { label: "Roads & Curbs", icon: "🛣️", duration: "3-6 weeks", desc: "Pave streets, pour curbs, install drainage." },
  { label: "Foundations", icon: "🏗️", duration: "2-4 weeks", desc: "Pour concrete foundations for each building." },
  { label: "Framing & Structure", icon: "🪵", duration: "4-12 weeks", desc: "Build the skeleton — wood, steel, or concrete." },
  { label: "Mechanical Systems", icon: "⚙️", duration: "4-8 weeks", desc: "Install HVAC, plumbing, and electrical wiring." },
  { label: "Finishing & Landscaping", icon: "🌳", duration: "4-8 weeks", desc: "Drywall, paint, fixtures, sidewalks, and trees." },
];

const DevelopmentPhase = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [activePhase, setActivePhase] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hoveredDep, setHoveredDep] = useState<number | null>(null);

  const playSequence = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setActivePhase(0);
    let phase = 0;
    const interval = setInterval(() => {
      phase++;
      if (phase >= buildPhases.length) {
        clearInterval(interval);
        setIsPlaying(false);
        return;
      }
      setActivePhase(phase);
    }, 1200);
  };

  return (
    <SectionWrapper
      id="buildings"
      stage={4}
      title="Buildings Go Up"
      subtitle="Once infrastructure is in the ground, different actors start building — each depending on pieces someone else already completed."
    >
      <div ref={ref} className="space-y-10">
        {/* Construction timeline */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-heading font-semibold text-lg text-primary">Construction Sequence</h3>
            <motion.button
              onClick={playSequence}
              disabled={isPlaying}
              className={`px-4 py-2 rounded-lg text-sm font-heading font-medium transition-all ${
                isPlaying
                  ? "bg-primary/20 text-primary border border-primary/30 animate-pulse"
                  : "glass-card hover:bg-primary/10 hover:text-primary"
              }`}
              whileTap={{ scale: 0.95 }}
            >
              {isPlaying ? "⏳ Building..." : "▶️ Watch It Build"}
            </motion.button>
          </div>

          {/* Visual construction SVG */}
          <div className="mb-6 overflow-hidden rounded-lg bg-muted/30 p-4">
            <svg viewBox="0 0 600 140" className="w-full" style={{ maxHeight: 160 }}>
              {/* Ground */}
              <rect x="0" y="100" width="600" height="40" fill="hsl(var(--muted))" />

              {/* Phase-dependent visuals */}
              {/* Grading */}
              {activePhase >= 0 && (
                <motion.rect
                  x="50" y="95" width="500" height="8" rx="2"
                  fill="hsl(30 30% 25% / 0.5)"
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  style={{ transformOrigin: "left" }}
                  transition={{ duration: 0.6 }}
                />
              )}

              {/* Underground pipes */}
              {activePhase >= 1 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  <line x1="80" y1="115" x2="520" y2="115" stroke="hsl(var(--infra-water))" strokeWidth="3" strokeDasharray="6 3" />
                  <line x1="80" y1="125" x2="520" y2="125" stroke="hsl(var(--infra-sewer))" strokeWidth="2.5" strokeDasharray="6 3" />
                  <line x1="80" y1="108" x2="520" y2="108" stroke="hsl(var(--infra-power))" strokeWidth="1.5" strokeDasharray="4 3" />
                </motion.g>
              )}

              {/* Road */}
              {activePhase >= 2 && (
                <motion.rect
                  x="40" y="90" width="520" height="10" rx="2"
                  fill="hsl(var(--infra-road) / 0.7)"
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                  style={{ transformOrigin: "left" }}
                  transition={{ duration: 0.8 }}
                />
              )}

              {/* Foundations */}
              {activePhase >= 3 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {[100, 200, 300, 400].map((x, i) => (
                    <motion.rect
                      key={x}
                      x={x} y={85} width={60} height={5} rx={1}
                      fill="hsl(var(--muted-foreground) / 0.5)"
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                      transition={{ delay: i * 0.15, duration: 0.4 }}
                      style={{ transformOrigin: "left" }}
                    />
                  ))}
                </motion.g>
              )}

              {/* Building frames */}
              {activePhase >= 4 && (
                <motion.g>
                  {[
                    { x: 100, w: 60, h: 35, type: "house" },
                    { x: 200, w: 60, h: 55, type: "commercial" },
                    { x: 300, w: 60, h: 70, type: "tower" },
                    { x: 400, w: 60, h: 40, type: "civic" },
                  ].map((b, i) => (
                    <motion.rect
                      key={i}
                      x={b.x} y={85 - b.h} width={b.w} height={b.h} rx={2}
                      fill="hsl(var(--muted-foreground) / 0.15)"
                      stroke="hsl(var(--muted-foreground) / 0.3)"
                      strokeWidth="1"
                      initial={{ height: 0, y: 85 }}
                      animate={{ height: b.h, y: 85 - b.h }}
                      transition={{ delay: i * 0.2, duration: 0.6, ease: "easeOut" }}
                    />
                  ))}
                </motion.g>
              )}

              {/* Mechanical - window glow */}
              {activePhase >= 5 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                  {[
                    { x: 110, ys: [55, 65, 75] },
                    { x: 210, ys: [35, 47, 59, 71] },
                    { x: 310, ys: [20, 32, 44, 56, 68] },
                    { x: 410, ys: [50, 62, 74] },
                  ].map((col, ci) =>
                    col.ys.map((y, wi) => (
                      <motion.rect
                        key={`${ci}-${wi}`}
                        x={col.x} y={y} width={8} height={5} rx={1}
                        fill="hsl(var(--primary) / 0.4)"
                        animate={{ opacity: [0.2, 0.7, 0.2] }}
                        transition={{ duration: 2 + wi, repeat: Infinity, delay: wi * 0.3 }}
                      />
                    ))
                  )}
                </motion.g>
              )}

              {/* Landscaping - trees */}
              {activePhase >= 6 && (
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {[80, 180, 280, 380, 480].map((x, i) => (
                    <motion.g key={x} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.1, type: "spring" }}>
                      <circle cx={x} cy={78} r={7} fill="hsl(140 35% 30% / 0.6)" />
                      <rect x={x - 1.5} y={83} width={3} height={7} fill="hsl(30 30% 25% / 0.5)" />
                    </motion.g>
                  ))}
                </motion.g>
              )}

              {/* Construction crane during building */}
              {activePhase >= 3 && activePhase <= 5 && (
                <motion.g
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <rect x="348" y="5" width="3" height="80" fill="hsl(var(--primary) / 0.4)" />
                  <rect x="330" y="5" width="40" height="3" fill="hsl(var(--primary) / 0.4)" />
                  <line x1="330" y1="8" x2="348" y2="25" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
                  <line x1="370" y1="8" x2="351" y2="25" stroke="hsl(var(--primary) / 0.3)" strokeWidth="1" />
                  {/* Swinging hook */}
                  <motion.g animate={{ x: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }}>
                    <line x1="340" y1="8" x2="340" y2="30" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="0.5" />
                    <rect x="337" y="28" width="6" height="6" rx="1" fill="hsl(var(--primary) / 0.3)" />
                  </motion.g>
                </motion.g>
              )}
            </svg>
          </div>

          {/* Phase steps */}
          <div className="grid grid-cols-7 gap-1">
            {buildPhases.map((phase, i) => (
              <motion.button
                key={i}
                onClick={() => { setActivePhase(i); setIsPlaying(false); }}
                className={`p-2 rounded-lg text-center transition-all ${
                  i === activePhase
                    ? "bg-primary/15 ring-1 ring-primary/40"
                    : i < activePhase
                    ? "bg-secondary/10"
                    : "bg-muted/30"
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-lg block">{phase.icon}</span>
                <span className="text-[8px] font-heading font-medium leading-tight block mt-1 line-clamp-2">{phase.label}</span>
              </motion.button>
            ))}
          </div>

          {/* Active phase detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activePhase}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-4 p-4 rounded-lg bg-card/60 border border-border/30"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{buildPhases[activePhase].icon}</span>
                <h4 className="font-heading font-bold text-sm">{buildPhases[activePhase].label}</h4>
                <span className="text-[10px] text-muted-foreground font-heading ml-auto">{buildPhases[activePhase].duration}</span>
              </div>
              <p className="text-xs text-muted-foreground">{buildPhases[activePhase].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Who builds what + Dependencies */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-primary">Who Builds What</h3>
            <div className="grid grid-cols-2 gap-3">
              {actors.map((a, i) => (
                <motion.div
                  key={a.label}
                  className="glass-card p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <span className="text-2xl mb-2 block">{a.icon}</span>
                  <span className="font-heading font-semibold text-sm block mb-1">{a.label}</span>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 text-primary">Nothing Works Alone</h3>
            <div className="space-y-3">
              {dependencies.map((d, i) => (
                <motion.div
                  key={i}
                  className={`flex items-center gap-3 glass-card p-3 transition-all cursor-pointer ${
                    hoveredDep === i ? "ring-1 ring-primary/40 bg-primary/5" : ""
                  }`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                  onMouseEnter={() => setHoveredDep(i)}
                  onMouseLeave={() => setHoveredDep(null)}
                >
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-heading font-semibold">{d.from}</span>
                    <motion.span
                      className="text-primary"
                      animate={hoveredDep === i ? { x: [0, 4, 0] } : {}}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                    <span className="px-2 py-1 rounded bg-secondary/10 text-secondary text-xs font-heading font-semibold">{d.to}</span>
                  </div>
                  <p className="text-xs text-muted-foreground hidden sm:block">{d.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default DevelopmentPhase;

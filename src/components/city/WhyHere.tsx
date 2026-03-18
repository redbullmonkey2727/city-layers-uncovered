import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { locationFactors } from "@/data/cityData";

/** Animated terrain map that highlights features based on selected factor */
const TerrainMap = ({ selected }: { selected: string | null }) => {
  const waterActive = selected === "water" || selected === "transport" || !selected;
  const mountainActive = selected === "defense" || selected === "resources" || !selected;
  const sunActive = selected === "climate" || !selected;
  const tradeActive = selected === "trade" || selected === "transport" || !selected;

  return (
    <svg viewBox="0 0 400 280" className="w-full" style={{ maxHeight: 320 }}>
      {/* Sky gradient */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(220 25% 14%)" />
          <stop offset="100%" stopColor="hsl(220 20% 10%)" />
        </linearGradient>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="hsl(210 80% 45% / 0.6)" />
          <stop offset="100%" stopColor="hsl(210 80% 55% / 0.3)" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="hsl(38 95% 52% / 0.4)" />
          <stop offset="100%" stopColor="hsl(38 95% 52% / 0)" />
        </radialGradient>
      </defs>

      <rect width="400" height="280" fill="url(#sky)" />

      {/* Sun */}
      <motion.g animate={{ opacity: sunActive ? 1 : 0.15 }} transition={{ duration: 0.5 }}>
        <circle cx="320" cy="50" r="40" fill="url(#sunGlow)" />
        <motion.circle cx="320" cy="50" r="14" fill="hsl(38 95% 60%)"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Sun rays */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
          const rad = (angle * Math.PI) / 180;
          return (
            <motion.line
              key={angle}
              x1={320 + Math.cos(rad) * 18} y1={50 + Math.sin(rad) * 18}
              x2={320 + Math.cos(rad) * 26} y2={50 + Math.sin(rad) * 26}
              stroke="hsl(38 95% 60% / 0.5)" strokeWidth="1.5" strokeLinecap="round"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: angle / 360 }}
            />
          );
        })}
      </motion.g>

      {/* Mountains */}
      <motion.g animate={{ opacity: mountainActive ? 1 : 0.15 }} transition={{ duration: 0.5 }}>
        <polygon points="0,200 60,110 120,200" fill="hsl(220 15% 20%)" />
        <polygon points="40,200 110,85 180,200" fill="hsl(220 15% 22%)" />
        <polygon points="90,200 150,100 210,200" fill="hsl(220 15% 18%)" />
        {/* Snow caps */}
        <polygon points="100,92 110,85 120,95" fill="hsl(220 10% 60% / 0.4)" />
        <polygon points="50,118 60,110 70,120" fill="hsl(220 10% 60% / 0.3)" />
        {/* Mine icon on mountain */}
        {selected === "resources" && (
          <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            <circle cx="110" cy="130" r="8" fill="hsl(38 95% 52% / 0.3)" stroke="hsl(38 95% 52%)" strokeWidth="1" />
            <text x="110" y="134" textAnchor="middle" fontSize="10" fill="hsl(38 95% 52%)">⛏</text>
          </motion.g>
        )}
      </motion.g>

      {/* Ground / plains */}
      <rect x="0" y="200" width="400" height="80" fill="hsl(140 15% 15%)" />

      {/* Trade route (dashed path) */}
      <motion.g animate={{ opacity: tradeActive ? 1 : 0.15 }} transition={{ duration: 0.5 }}>
        <motion.path
          d="M 0,220 Q 100,210 200,225 T 400,215"
          fill="none" stroke="hsl(38 80% 50% / 0.5)" strokeWidth="2" strokeDasharray="6 4"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        {/* Caravan dots */}
        <motion.circle cx="0" cy="220" r="3" fill="hsl(38 80% 60%)"
          animate={{ cx: [0, 400] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle cx="200" cy="225" r="3" fill="hsl(38 80% 60%)"
          animate={{ cx: [200, 600] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
        {selected === "trade" && (
          <motion.text x="200" y="208" textAnchor="middle" fontSize="8" fontFamily="var(--font-heading)"
            fill="hsl(38 95% 52%)" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            Trade Route
          </motion.text>
        )}
      </motion.g>

      {/* River */}
      <motion.g animate={{ opacity: waterActive ? 1 : 0.15 }} transition={{ duration: 0.5 }}>
        <motion.path
          d="M 220,200 Q 240,230 260,240 T 300,260 T 350,270 L 400,275"
          fill="none" stroke="hsl(210 80% 55% / 0.7)" strokeWidth="8" strokeLinecap="round"
          animate={{ d: [
            "M 220,200 Q 240,230 260,240 T 300,260 T 350,270 L 400,275",
            "M 220,200 Q 245,228 262,242 T 302,258 T 348,272 L 400,275",
            "M 220,200 Q 240,230 260,240 T 300,260 T 350,270 L 400,275",
          ] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Water shimmer */}
        {[235, 265, 295, 325].map((x, i) => (
          <motion.ellipse key={x} cx={x} cy={235 + i * 10} rx="3" ry="1"
            fill="hsl(210 80% 70% / 0.4)"
            animate={{ opacity: [0.2, 0.7, 0.2], rx: [2, 4, 2] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.4 }}
          />
        ))}
      </motion.g>

      {/* Settlement cluster */}
      <motion.g animate={{ opacity: selected ? 0.8 : 1 }} transition={{ duration: 0.5 }}>
        {/* Small buildings near river */}
        {[{ x: 240, h: 12 }, { x: 255, h: 16 }, { x: 248, h: 10 }, { x: 263, h: 14 }].map((b, i) => (
          <motion.rect key={i} x={b.x} y={200 - b.h} width={8} height={b.h} rx={1}
            fill="hsl(var(--muted-foreground) / 0.4)"
            initial={{ height: 0, y: 200 }}
            animate={{ height: b.h, y: 200 - b.h }}
            transition={{ delay: 0.5 + i * 0.1 }}
          />
        ))}
        {/* Settlement label */}
        <text x="253" y="183" textAnchor="middle" fontSize="7" fontFamily="var(--font-heading)"
          fill="hsl(var(--muted-foreground) / 0.6)">
          Settlement
        </text>
      </motion.g>

      {/* Stars */}
      {[{ x: 30, y: 20 }, { x: 80, y: 45 }, { x: 170, y: 15 }, { x: 250, y: 35 }, { x: 380, y: 25 }].map((s, i) => (
        <motion.circle key={i} cx={s.x} cy={s.y} r="1" fill="hsl(var(--foreground) / 0.4)"
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.7 }}
        />
      ))}

      {/* Defense indicator */}
      {selected === "defense" && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <path d="M 235,195 L 253,180 L 271,195" fill="none" stroke="hsl(var(--primary) / 0.6)" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="253" y="175" textAnchor="middle" fontSize="7" fontFamily="var(--font-heading)" fill="hsl(var(--primary))">
            🛡️ Defensible
          </text>
        </motion.g>
      )}
    </svg>
  );
};

const WhyHere = () => {
  const [selected, setSelected] = useState<string | null>(null);
  const active = locationFactors.find((f) => f.id === selected);

  return (
    <SectionWrapper
      id="why-here"
      stage={1}
      title="Why Here?"
      subtitle="Before anything gets built, someone decides this spot is worth settling. Every city in history started because the land offered something valuable."
    >
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Terrain visualization */}
        <div className="space-y-4">
          <div className="glass-card p-4 overflow-hidden">
            <TerrainMap selected={selected} />
          </div>

          {/* Factor buttons */}
          <div className="grid grid-cols-3 gap-2">
            {locationFactors.map((f, i) => (
              <motion.button
                key={f.id}
                onClick={() => setSelected(selected === f.id ? null : f.id)}
                className={`glass-card p-3 text-left transition-all duration-300 ${
                  selected === f.id ? "ring-2 ring-primary bg-primary/10" : "hover:bg-muted/50"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className="text-xl mb-1 block">{f.icon}</span>
                <span className="font-heading font-semibold text-[11px] leading-tight">{f.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className="min-h-[280px]">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="glass-card p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-4xl">{active.icon}</span>
                  <div>
                    <h3 className="font-heading text-xl font-bold">{active.label}</h3>
                    <span className="text-xs text-primary font-heading uppercase tracking-wider">Settlement Factor</span>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-4">{active.description}</p>
                <div className="glass-card p-3 bg-primary/5 border-primary/20">
                  <p className="text-xs text-primary/80 font-heading">
                    {active.id === "water" && "💡 95% of the world's largest cities are built on rivers or coastlines."}
                    {active.id === "trade" && "💡 New York, London, and Singapore all grew from strategic trade positions."}
                    {active.id === "resources" && "💡 The California Gold Rush created San Francisco almost overnight."}
                    {active.id === "defense" && "💡 Edinburgh Castle sits on an extinct volcano — natural fortress."}
                    {active.id === "climate" && "💡 The Sun Belt migration moved 40M Americans to warmer states since 1970."}
                    {active.id === "transport" && "💡 Atlanta became a major city purely because two rail lines crossed there."}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-6"
              >
                <h3 className="font-heading text-lg font-bold mb-3">Interactive Terrain</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  The map above shows the key geographical features that attract settlers. Each factor lights up different parts of the terrain.
                </p>
                <p className="text-sm text-primary font-medium">
                  ← Tap a factor to explore why it matters
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default WhyHere;

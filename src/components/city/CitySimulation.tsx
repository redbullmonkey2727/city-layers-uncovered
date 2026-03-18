import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { simulationChoices } from "@/data/cityData";

const outcomeLabels: Record<string, { label: string; icon: string; good: "high" | "low" }> = {
  traffic: { label: "Traffic", icon: "🚗", good: "low" },
  cost: { label: "Cost", icon: "💰", good: "low" },
  sprawl: { label: "Sprawl", icon: "🏘️", good: "low" },
  livability: { label: "Livability", icon: "🌳", good: "high" },
  resilience: { label: "Resilience", icon: "🛡️", good: "high" },
};

const gradeThresholds = [
  { min: 6, label: "A+", color: "text-secondary", desc: "An exceptional, sustainable city" },
  { min: 3, label: "A", color: "text-secondary", desc: "A well-planned, livable city" },
  { min: 0, label: "B", color: "text-primary", desc: "Decent city, room for improvement" },
  { min: -3, label: "C", color: "text-muted-foreground", desc: "Growing pains are showing" },
  { min: -Infinity, label: "D", color: "text-destructive", desc: "Struggling with systemic issues" },
];

const CitySimulation = () => {
  const [choices, setChoices] = useState<Record<string, string>>({
    location: "river",
    density: "med",
    transit: "mixed",
    infra: "med",
  });

  const outcomes = useMemo(() => {
    const totals: Record<string, number> = {};
    Object.entries(choices).forEach(([choiceId, value]) => {
      const choice = simulationChoices.find((c) => c.id === choiceId);
      const option = choice?.options.find((o) => o.value === value);
      if (option) {
        Object.entries(option.effects).forEach(([key, val]) => {
          totals[key] = (totals[key] || 0) + val;
        });
      }
    });
    return totals;
  }, [choices]);

  const overallScore = useMemo(() => {
    let score = 0;
    Object.entries(outcomeLabels).forEach(([key, meta]) => {
      const val = outcomes[key] || 0;
      score += meta.good === "high" ? val : -val;
    });
    return score;
  }, [outcomes]);

  const grade = gradeThresholds.find((g) => overallScore >= g.min)!;

  const getBarWidth = (value: number) => {
    const normalized = ((value + 6) / 12) * 100;
    return Math.max(5, Math.min(95, normalized));
  };

  const cityHeight = choices.density === "high" ? 70 : choices.density === "low" ? 25 : 45;
  const numBuildings = choices.density === "high" ? 14 : choices.density === "low" ? 5 : 9;
  const hasTransit = choices.transit !== "car";
  const isCoastal = choices.location === "coast";
  const isRiver = choices.location === "river";
  const premiumInfra = choices.infra === "high";

  return (
    <SectionWrapper
      id="simulation"
      title="Build Your Own City"
      subtitle="Make a few key decisions and see how they shape your city. There are no perfect answers — every choice has tradeoffs."
    >
      <div className="grid md:grid-cols-2 gap-10">
        {/* Choices */}
        <div className="space-y-6">
          {simulationChoices.map((choice) => (
            <div key={choice.id}>
              <h4 className="font-heading font-semibold text-sm mb-2 flex items-center gap-2">
                {choice.id === "location" && "📍"}
                {choice.id === "density" && "🏙️"}
                {choice.id === "transit" && "🚆"}
                {choice.id === "infra" && "🔧"}
                {choice.label}
              </h4>
              <div className="flex flex-wrap gap-2">
                {choice.options.map((opt) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => setChoices((prev) => ({ ...prev, [choice.id]: opt.value }))}
                    className={`px-4 py-2 rounded-lg text-sm font-heading font-medium transition-all duration-300 ${
                      choices[choice.id] === opt.value
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "glass-card hover:bg-muted"
                    }`}
                    whileTap={{ scale: 0.95 }}
                    layout
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}

          {/* Enhanced mini city visualization */}
          <div className="glass-card p-4 mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">Your City Preview</p>
              <motion.span
                key={grade.label}
                className={`text-xs font-heading font-bold ${grade.color}`}
                initial={{ scale: 1.3 }} animate={{ scale: 1 }}
              >
                Grade: {grade.label}
              </motion.span>
            </div>
            <svg viewBox="0 0 300 130" className="w-full" style={{ maxHeight: 150 }}>
              {/* Sky */}
              <rect width="300" height="130" fill="hsl(220 20% 10%)" />

              {/* Stars */}
              {[20, 55, 90, 140, 200, 260].map((x, i) => (
                <motion.circle key={i} cx={x} cy={8 + i * 3} r="0.8" fill="hsl(var(--foreground) / 0.3)"
                  animate={{ opacity: [0.2, 0.8, 0.2] }}
                  transition={{ duration: 2 + i, repeat: Infinity, delay: i * 0.5 }}
                />
              ))}

              {/* Moon */}
              <circle cx="270" cy="18" r="6" fill="hsl(var(--muted-foreground) / 0.15)" />

              {/* Water (coast or river) */}
              {isCoastal && (
                <motion.g>
                  <rect x="0" y="95" width="60" height="35" fill="hsl(210 80% 35% / 0.4)" />
                  {[10, 25, 40].map((x, i) => (
                    <motion.path key={i}
                      d={`M ${x},${105 + i * 5} Q ${x + 7},${102 + i * 5} ${x + 15},${105 + i * 5}`}
                      fill="none" stroke="hsl(210 80% 60% / 0.3)" strokeWidth="0.8"
                      animate={{ x: [-2, 2, -2] }}
                      transition={{ duration: 3, repeat: Infinity, delay: i * 0.3 }}
                    />
                  ))}
                </motion.g>
              )}
              {isRiver && (
                <motion.path
                  d="M 140,95 Q 150,110 160,115 T 180,125 L 190,130"
                  fill="none" stroke="hsl(210 80% 50% / 0.5)" strokeWidth="4" strokeLinecap="round"
                  animate={{ d: [
                    "M 140,95 Q 150,110 160,115 T 180,125 L 190,130",
                    "M 140,95 Q 152,108 162,117 T 182,123 L 190,130",
                    "M 140,95 Q 150,110 160,115 T 180,125 L 190,130",
                  ] }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
              )}

              {/* Ground */}
              <rect x="0" y="95" width="300" height="35" fill="hsl(var(--muted) / 0.5)" />

              {/* Road */}
              <rect x="0" y="88" width="300" height="8" rx="1" fill="hsl(var(--infra-road) / 0.5)" />

              {/* Transit line */}
              {hasTransit && (
                <motion.g>
                  <line x1="10" y1="86" x2="290" y2="86" stroke="hsl(var(--secondary) / 0.5)" strokeWidth="1.5" strokeDasharray="3 2" />
                  {/* Moving train */}
                  <motion.rect
                    x={0} y="83" width="16" height="5" rx="2"
                    fill="hsl(var(--secondary) / 0.7)"
                    animate={{ x: [0, 280] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  />
                </motion.g>
              )}

              {/* Underground infra glow for premium */}
              {premiumInfra && (
                <motion.g>
                  <line x1="20" y1="100" x2="280" y2="100" stroke="hsl(var(--infra-water) / 0.3)" strokeWidth="1.5" strokeDasharray="4 3" />
                  <line x1="20" y1="106" x2="280" y2="106" stroke="hsl(var(--infra-fiber) / 0.3)" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="20" y1="112" x2="280" y2="112" stroke="hsl(var(--infra-power) / 0.2)" strokeWidth="1" strokeDasharray="3 4" />
                </motion.g>
              )}

              {/* Buildings */}
              {Array.from({ length: numBuildings }).map((_, i) => {
                const startX = isCoastal ? 70 : 15;
                const span = isCoastal ? 220 : 270;
                const x = startX + i * (span / numBuildings);
                const h = 10 + ((i * 7 + 13) % 11) / 11 * cityHeight;
                const w = Math.min(18, span / numBuildings - 4);
                const isPrimary = i % 4 === 0;
                return (
                  <motion.g key={`${JSON.stringify(choices)}-${i}`}>
                    <motion.rect
                      x={x} y={88 - h} width={w} height={h} rx={1}
                      fill={isPrimary ? "hsl(var(--primary) / 0.25)" : "hsl(var(--muted-foreground) / 0.25)"}
                      initial={{ height: 0, y: 88 }}
                      animate={{ height: h, y: 88 - h }}
                      transition={{ delay: i * 0.03, duration: 0.4 }}
                    />
                    {/* Windows */}
                    {h > 25 && Array.from({ length: Math.floor(h / 12) }).map((_, wi) => (
                      <motion.rect key={wi}
                        x={x + 2} y={88 - h + 4 + wi * 12} width={w - 4} height={3} rx={0.5}
                        fill={isPrimary ? "hsl(var(--primary) / 0.3)" : "hsl(var(--muted-foreground) / 0.15)"}
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 3 + wi, repeat: Infinity, delay: i * 0.2 + wi * 0.5 }}
                      />
                    ))}
                  </motion.g>
                );
              })}

              {/* Trees for transit-first */}
              {choices.transit === "public" && [80, 150, 220].map((x) => (
                <g key={x}>
                  <rect x={x + 2} y={82} width="2" height="6" fill="hsl(140 30% 25% / 0.6)" />
                  <circle cx={x + 3} cy={79} r="5" fill="hsl(140 35% 30% / 0.5)" />
                </g>
              ))}

              {/* Car on road */}
              {choices.transit === "car" && (
                <>
                  <motion.rect x={0} y="90" width="10" height="4" rx="2" fill="hsl(var(--primary) / 0.5)"
                    animate={{ x: [0, 300] }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.rect x={200} y="91" width="8" height="3.5" rx="2" fill="hsl(var(--destructive) / 0.4)"
                    animate={{ x: [200, -50] }} transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.rect x={100} y="90" width="9" height="4" rx="2" fill="hsl(var(--secondary) / 0.4)"
                    animate={{ x: [100, 350] }} transition={{ duration: 6, repeat: Infinity, ease: "linear", delay: 2 }}
                  />
                </>
              )}
            </svg>
          </div>
        </div>

        {/* Outcomes */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-heading font-semibold text-lg">City Outcomes</h4>
              <div className="text-right">
                <motion.div
                  key={grade.label}
                  className={`text-3xl font-heading font-bold ${grade.color}`}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {grade.label}
                </motion.div>
              </div>
            </div>
            <div className="space-y-4">
              {Object.entries(outcomeLabels).map(([key, meta]) => {
                const value = outcomes[key] || 0;
                const width = getBarWidth(value);
                const isGood = (meta.good === "high" && value > 0) || (meta.good === "low" && value < 0);
                const isBad = (meta.good === "high" && value < 0) || (meta.good === "low" && value > 0);

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-heading">
                        {meta.icon} {meta.label}
                      </span>
                      <motion.span
                        key={value}
                        className={`text-xs font-heading font-semibold ${
                          isGood ? "text-secondary" : isBad ? "text-destructive" : "text-muted-foreground"
                        }`}
                        initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                      >
                        {value > 0 ? "+" : ""}{value}
                      </motion.span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          isGood ? "bg-secondary" : isBad ? "bg-destructive/70" : "bg-muted-foreground/40"
                        }`}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Grade description card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={grade.label}
              className="glass-card p-4 border-primary/20"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="text-sm text-muted-foreground italic">{grade.desc}</p>
            </motion.div>
          </AnimatePresence>

          <p className="text-xs text-muted-foreground leading-relaxed">
            Real cities face these tradeoffs every day. Dense, transit-oriented cities cost less per person but require more coordination. Sprawling car-centric cities are easier to build but expensive to maintain.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default CitySimulation;

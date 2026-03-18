import { useState, useMemo } from "react";
import { motion } from "framer-motion";
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
  { min: 6, label: "A+", color: "text-secondary" },
  { min: 3, label: "A", color: "text-secondary" },
  { min: 0, label: "B", color: "text-primary" },
  { min: -3, label: "C", color: "text-muted-foreground" },
  { min: -Infinity, label: "D", color: "text-destructive" },
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

  // Overall score
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

  // Generate a mini SVG city based on choices
  const cityHeight = choices.density === "high" ? 70 : choices.density === "low" ? 25 : 45;
  const numBuildings = choices.density === "high" ? 14 : choices.density === "low" ? 5 : 9;
  const hasTransit = choices.transit !== "car";

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
              <h4 className="font-heading font-semibold text-sm mb-2">{choice.label}</h4>
              <div className="flex flex-wrap gap-2">
                {choice.options.map((opt) => (
                  <motion.button
                    key={opt.value}
                    onClick={() => setChoices((prev) => ({ ...prev, [choice.id]: opt.value }))}
                    className={`px-4 py-2 rounded-lg text-sm font-heading font-medium transition-all duration-300 ${
                      choices[choice.id] === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "glass-card hover:bg-muted"
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}

          {/* Mini city visualization */}
          <div className="glass-card p-4 mt-4">
            <p className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider mb-2">Your City Preview</p>
            <svg viewBox="0 0 300 100" className="w-full" style={{ maxHeight: 120 }}>
              <rect x="0" y="80" width="300" height="20" fill="hsl(var(--muted))" />
              <rect x="0" y="75" width="300" height="6" rx="1" fill="hsl(var(--infra-road) / 0.5)" />
              {hasTransit && (
                <line x1="10" y1="73" x2="290" y2="73" stroke="hsl(var(--secondary) / 0.5)" strokeWidth="1.5" strokeDasharray="3 2" />
              )}
              {Array.from({ length: numBuildings }).map((_, i) => {
                const x = 15 + i * (270 / numBuildings);
                const h = 10 + Math.random() * cityHeight;
                const w = Math.min(20, 260 / numBuildings - 4);
                return (
                  <motion.rect
                    key={`${JSON.stringify(choices)}-${i}`}
                    x={x} y={75 - h} width={w} height={h} rx={1}
                    fill={i % 4 === 0 ? "hsl(var(--primary) / 0.25)" : "hsl(var(--muted-foreground) / 0.25)"}
                    initial={{ height: 0, y: 75 }}
                    animate={{ height: h, y: 75 - h }}
                    transition={{ delay: i * 0.03, duration: 0.4 }}
                  />
                );
              })}
              {/* Trees for transit-first */}
              {choices.transit === "public" && [50, 150, 250].map((x) => (
                <g key={x}>
                  <circle cx={x} cy="70" r="4" fill="hsl(150 35% 30% / 0.5)" />
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Outcomes */}
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h4 className="font-heading font-semibold text-lg">City Outcomes</h4>
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
          <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
            Real cities face these tradeoffs every day. Dense, transit-oriented cities cost less per person but require more coordination. Sprawling car-centric cities are easier to build but expensive to maintain.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default CitySimulation;

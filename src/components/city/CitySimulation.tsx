import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { simulationChoices } from "@/data/cityData";

/** Outcome metrics to display. */
const outcomeLabels: Record<string, { label: string; icon: string; good: "high" | "low" }> = {
  traffic: { label: "Traffic", icon: "🚗", good: "low" },
  cost: { label: "Cost", icon: "💰", good: "low" },
  sprawl: { label: "Sprawl", icon: "🏘️", good: "low" },
  livability: { label: "Livability", icon: "🌳", good: "high" },
  resilience: { label: "Resilience", icon: "🛡️", good: "high" },
};

const CitySimulation = () => {
  const [choices, setChoices] = useState<Record<string, string>>({
    location: "river",
    density: "med",
    transit: "mixed",
    infra: "med",
  });

  // Sum up effects
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

  const getBarWidth = (value: number) => {
    // Normalize from -6..6 range to 0-100
    const normalized = ((value + 6) / 12) * 100;
    return Math.max(5, Math.min(95, normalized));
  };

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
                  <button
                    key={opt.value}
                    onClick={() => setChoices((prev) => ({ ...prev, [choice.id]: opt.value }))}
                    className={`px-4 py-2 rounded-lg text-sm font-heading font-medium transition-all duration-300 ${
                      choices[choice.id] === opt.value
                        ? "bg-primary text-primary-foreground"
                        : "glass-card hover:bg-muted"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Outcomes */}
        <div className="glass-card p-6">
          <h4 className="font-heading font-semibold text-lg mb-4">City Outcomes</h4>
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
                    <span className={`text-xs font-heading font-semibold ${
                      isGood ? "text-secondary" : isBad ? "text-destructive" : "text-muted-foreground"
                    }`}>
                      {value > 0 ? "+" : ""}{value}
                    </span>
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

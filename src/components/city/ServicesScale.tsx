import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { serviceThresholds } from "@/data/cityData";

/** Population slider that reveals services as population grows. */
const ServicesScale = () => {
  const [population, setPopulation] = useState(10000);

  const activeThresholds = useMemo(
    () => serviceThresholds.filter((t) => t.population <= population),
    [population]
  );

  const currentLabel = useMemo(() => {
    const last = [...serviceThresholds].reverse().find((t) => t.population <= population);
    return last?.label ?? "Empty";
  }, [population]);

  const formatPop = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
  };

  return (
    <SectionWrapper
      id="services"
      stage={5}
      title="Services Follow People"
      subtitle="A city doesn't build a hospital on day one. Services appear as population crosses key thresholds. Drag the slider to watch a city grow."
    >
      {/* Slider */}
      <div className="glass-card p-6 md:p-8 mb-8 max-w-3xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground font-heading">Population</span>
          <span className="font-heading font-bold text-xl text-primary">{formatPop(population)}</span>
        </div>
        <input
          type="range"
          min={50}
          max={1_000_000}
          step={50}
          value={population}
          onChange={(e) => setPopulation(Number(e.target.value))}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-primary"
          style={{ accentColor: "hsl(var(--primary))" }}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>50</span>
          <span>1M</span>
        </div>
        <div className="mt-3 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-heading font-semibold text-sm">
            {currentLabel}
          </span>
        </div>
      </div>

      {/* Service cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {serviceThresholds.map((threshold) => {
          const unlocked = threshold.population <= population;
          return (
            <motion.div
              key={threshold.population}
              className={`glass-card p-4 transition-all duration-500 ${
                unlocked ? "opacity-100" : "opacity-30"
              }`}
              animate={{ scale: unlocked ? 1 : 0.97 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-heading font-semibold text-sm">{threshold.label}</span>
                <span className="text-xs text-muted-foreground">{formatPop(threshold.population)}+</span>
              </div>
              <ul className="space-y-1">
                {threshold.services.map((s) => (
                  <li key={s} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${unlocked ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    {s}
                  </li>
                ))}
              </ul>
            </motion.div>
          );
        })}
      </div>
    </SectionWrapper>
  );
};

export default ServicesScale;

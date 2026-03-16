import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { locationFactors } from "@/data/cityData";

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
        {/* Factor buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {locationFactors.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelected(selected === f.id ? null : f.id)}
              className={`glass-card p-4 text-left transition-all duration-300 hover:scale-[1.03] ${
                selected === f.id ? "ring-2 ring-primary bg-primary/10" : ""
              }`}
            >
              <span className="text-2xl mb-2 block">{f.icon}</span>
              <span className="font-heading font-semibold text-sm">{f.label}</span>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="min-h-[180px]">
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
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{active.icon}</span>
                  <h3 className="font-heading text-xl font-bold">{active.label}</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">{active.description}</p>
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                className="text-muted-foreground italic pt-6"
              >
                ← Tap a factor to learn why it matters
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default WhyHere;

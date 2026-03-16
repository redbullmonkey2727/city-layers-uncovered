import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { citySystems } from "@/data/cityData";

const SystemsDashboard = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = citySystems.find((s) => s.id === selectedId);

  return (
    <SectionWrapper
      id="systems"
      title="City Systems Dashboard"
      subtitle="A functioning city runs on dozens of invisible systems, 24 hours a day, 365 days a year. Click any system to see what keeps it running — and what happens when it breaks."
    >
      <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">
        {/* System grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {citySystems.map((sys) => (
            <button
              key={sys.id}
              onClick={() => setSelectedId(selectedId === sys.id ? null : sys.id)}
              className={`glass-card p-4 text-center transition-all duration-300 hover:scale-[1.04] ${
                selectedId === sys.id ? "ring-2 ring-primary bg-primary/10" : ""
              }`}
            >
              <span className="text-2xl block mb-2">{sys.icon}</span>
              <span className="font-heading font-semibold text-xs">{sys.label}</span>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="glass-card p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selected.icon}</span>
                <h3 className="font-heading text-xl font-bold">{selected.label}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{selected.description}</p>

              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Prerequisites</span>
                <ul className="mt-1 space-y-1">
                  {selected.prerequisites.map((p) => (
                    <li key={p} className="text-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">If it fails…</span>
                <p className="text-sm text-destructive/90 mt-1">{selected.failureConsequence}</p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">Managed by</span>
                <p className="text-sm mt-1">{selected.managedBy}</p>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <p className="text-sm text-muted-foreground">
                Click any system to see how it works, what it depends on, and what happens when it fails.
              </p>
              <p className="text-sm text-primary mt-3 font-medium">
                Most people never think about these systems — until one breaks.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
};

export default SystemsDashboard;

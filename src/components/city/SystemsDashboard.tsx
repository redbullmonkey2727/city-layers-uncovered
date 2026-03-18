import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { citySystems } from "@/data/cityData";

/** Failure cascade simulation */
const FailureSimulation = ({ failedSystem }: { failedSystem: string }) => {
  const cascades: Record<string, string[]> = {
    power: ["internet", "water", "emergency", "schools", "food"],
    water: ["sewer", "emergency", "food"],
    roads: ["emergency", "food", "trash", "schools"],
    internet: ["emergency"],
    sewer: ["water"],
    emergency: [],
    trash: [],
    schools: [],
    food: ["emergency"],
    zoning: [],
  };

  const affected = cascades[failedSystem] || [];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-3 pt-3 border-t border-border/50">
        <p className="text-[10px] uppercase tracking-wider text-destructive/80 font-heading font-semibold mb-2">
          ⚡ Cascade Effect
        </p>
        {affected.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {affected.map((sysId, i) => {
              const sys = citySystems.find((s) => s.id === sysId);
              return sys ? (
                <motion.span
                  key={sysId}
                  className="text-[10px] px-2 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 font-heading"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15 }}
                >
                  {sys.icon} {sys.label}
                </motion.span>
              ) : null;
            })}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Isolated failure — minimal cascade.</p>
        )}
      </div>
    </motion.div>
  );
};

const SystemsDashboard = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [failureMode, setFailureMode] = useState(false);
  const selected = citySystems.find((s) => s.id === selectedId);

  const toggleFailure = useCallback(() => setFailureMode((f) => !f), []);

  return (
    <SectionWrapper
      id="systems"
      title="City Systems Dashboard"
      subtitle="A functioning city runs on dozens of invisible systems, 24 hours a day, 365 days a year. Click any system to see what keeps it running — and what happens when it breaks."
    >
      {/* Failure mode toggle */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={toggleFailure}
          className={`px-4 py-2 rounded-lg text-sm font-heading font-medium transition-all ${
            failureMode
              ? "bg-destructive/20 text-destructive border border-destructive/30"
              : "glass-card hover:bg-muted"
          }`}
        >
          {failureMode ? "🔴 Failure Mode ON" : "💡 Toggle Failure Mode"}
        </button>
        {failureMode && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-destructive/70"
          >
            Click a system to see what breaks when it fails
          </motion.p>
        )}
      </div>

      <div className="grid md:grid-cols-[1fr_380px] gap-8 items-start">
        {/* System grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {citySystems.map((sys) => {
            const isSelected = selectedId === sys.id;
            const isFailed = failureMode && isSelected;

            return (
              <motion.button
                key={sys.id}
                onClick={() => setSelectedId(isSelected ? null : sys.id)}
                className={`glass-card p-4 text-center transition-all duration-300 hover:scale-[1.04] ${
                  isFailed
                    ? "ring-2 ring-destructive bg-destructive/10 animate-pulse"
                    : isSelected
                    ? "ring-2 ring-primary bg-primary/10"
                    : ""
                }`}
                whileTap={{ scale: 0.95 }}
              >
                <span className="text-2xl block mb-2">{sys.icon}</span>
                <span className="font-heading font-semibold text-xs">{sys.label}</span>
                {failureMode && (
                  <motion.div
                    className="w-2 h-2 rounded-full bg-secondary mx-auto mt-2"
                    animate={{ backgroundColor: isSelected ? "hsl(var(--destructive))" : "hsl(var(--secondary))" }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Detail panel */}
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className={`glass-card p-6 space-y-4 ${failureMode ? "border-destructive/30" : ""}`}
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

              {/* Cascade effect in failure mode */}
              {failureMode && (
                <FailureSimulation failedSystem={selected.id} />
              )}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
              <p className="text-sm text-muted-foreground">
                Click any system to see how it works, what it depends on, and what happens when it fails.
              </p>
              <p className="text-sm text-primary mt-3 font-medium">
                Most people never think about these systems — until one breaks.
              </p>
              {failureMode && (
                <p className="text-xs text-destructive/70 mt-3 italic">
                  💡 Try clicking "Electricity" to see which other systems go down with it.
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionWrapper>
  );
};

export default SystemsDashboard;

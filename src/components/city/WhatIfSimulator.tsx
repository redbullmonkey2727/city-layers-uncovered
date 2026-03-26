import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Zap, Droplets, Wifi, Trash2, Bus, Shield, Apple, Heart,
  RotateCcw, ChevronRight, Activity, Clock, TrendingDown, BarChart3,
  Loader2, RefreshCw, Target, Gauge,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { CityData } from "@/lib/cityLookup";

/* ── Types ── */
interface SystemMetric {
  label: string;
  value: string;
  status: "good" | "warning" | "critical" | "info";
}

interface FailureEvent {
  time: string;
  event: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface CitySystem {
  id: string;
  label: string;
  emoji: string;
  status: string;
  metrics: SystemMetric[];
  vulnerabilities: string[];
  dependents: string[];
  realWorldExample: string;
  failureTimeline: FailureEvent[];
  recoveryTime: string;
  populationAffected: string;
  economicImpact: string;
}

interface CascadeScenario {
  name: string;
  trigger: string;
  description: string;
  chain: string[];
  totalImpact: string;
}

interface CityRisk {
  risk: string;
  probability: string;
  primarySystems: string[];
  description: string;
}

interface ResilienceFactor {
  factor: string;
  score: number;
  maxScore: number;
}

interface WhatIfData {
  systems: CitySystem[];
  cascadeScenarios: CascadeScenario[];
  citySpecificRisks: CityRisk[];
  resilienceScore: number;
  resilienceGrade: string;
  resilienceFactors: ResilienceFactor[];
}

const statusColors = {
  good: "hsl(150, 60%, 45%)",
  warning: "hsl(45, 90%, 50%)",
  critical: "hsl(0, 75%, 55%)",
  info: "hsl(210, 70%, 55%)",
};

const severityColors = {
  low: "hsl(150, 60%, 45%)",
  medium: "hsl(45, 90%, 50%)",
  high: "hsl(25, 85%, 55%)",
  critical: "hsl(0, 75%, 55%)",
};

const systemIcons: Record<string, React.ReactNode> = {
  power: <Zap className="w-5 h-5" />,
  water: <Droplets className="w-5 h-5" />,
  internet: <Wifi className="w-5 h-5" />,
  transit: <Bus className="w-5 h-5" />,
  waste: <Trash2 className="w-5 h-5" />,
  emergency: <Shield className="w-5 h-5" />,
  food: <Apple className="w-5 h-5" />,
  healthcare: <Heart className="w-5 h-5" />,
};

/* ── Resilience Gauge ── */
const ResilienceGauge = ({ score, grade }: { score: number; grade: string }) => {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? "hsl(150, 60%, 45%)" : score >= 50 ? "hsl(45, 90%, 50%)" : "hsl(0, 75%, 55%)";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-heading font-bold">{score}</span>
          <span className="text-xs text-muted-foreground font-heading">{grade}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground font-heading mt-1">Resilience Score</span>
    </div>
  );
};

/* ── System Card ── */
const SystemCard = ({
  system,
  isActive,
  isFailed,
  onClick,
}: {
  system: CitySystem;
  isActive: boolean;
  isFailed: boolean;
  onClick: () => void;
}) => (
  <motion.button
    onClick={onClick}
    className={`w-full text-left glass-card p-4 transition-all duration-300 ${
      isActive ? "ring-2 ring-primary border-primary/30" : isFailed ? "ring-2 ring-destructive border-destructive/30 bg-destructive/5" : "hover:border-primary/20"
    }`}
    whileHover={{ y: -2 }}
    layout
  >
    <div className="flex items-center gap-3 mb-2">
      <span className={`text-lg ${isFailed ? "grayscale" : ""}`}>
        {isFailed ? "💥" : system.emoji}
      </span>
      <div className="flex-1 min-w-0">
        <h4 className="font-heading font-semibold text-sm truncate">{system.label}</h4>
        <span className={`text-[10px] font-heading font-bold uppercase tracking-wider ${
          isFailed ? "text-destructive" : "text-emerald-500"
        }`}>
          {isFailed ? "OFFLINE" : "OPERATIONAL"}
        </span>
      </div>
      <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? "rotate-90 text-primary" : "text-muted-foreground"}`} />
    </div>
    {/* Mini metric bars */}
    <div className="grid grid-cols-2 gap-1.5 mt-2">
      {system.metrics.slice(0, 2).map((m, i) => (
        <div key={i} className="text-[9px]">
          <span className="text-muted-foreground">{m.label}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColors[m.status] }} />
            <span className="font-mono font-medium text-foreground">{m.value}</span>
          </div>
        </div>
      ))}
    </div>
  </motion.button>
);

/* ── Failure Timeline ── */
const FailureTimeline = ({ events }: { events: FailureEvent[] }) => (
  <div className="space-y-3">
    {events.map((event, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.08 }}
        className="flex gap-3 items-start"
      >
        <div className="flex flex-col items-center">
          <span
            className="w-3 h-3 rounded-full shrink-0 mt-1"
            style={{ background: severityColors[event.severity] }}
          />
          {i < events.length - 1 && (
            <div className="w-px h-full bg-border/50 mt-1" />
          )}
        </div>
        <div className="pb-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold text-muted-foreground w-12 shrink-0">{event.time}</span>
            <span
              className="text-[9px] px-1.5 py-0.5 rounded-full font-heading font-bold uppercase"
              style={{
                color: severityColors[event.severity],
                background: severityColors[event.severity] + "15",
              }}
            >
              {event.severity}
            </span>
          </div>
          <p className="text-xs text-foreground mt-1 leading-relaxed">{event.event}</p>
        </div>
      </motion.div>
    ))}
  </div>
);

/* ── Main Component ── */
const WhatIfSimulator = ({ data }: { data: CityData }) => {
  const [whatIfData, setWhatIfData] = useState<WhatIfData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  const [failedSystems, setFailedSystems] = useState<Set<string>>(new Set());
  const [activeScenario, setActiveScenario] = useState<CascadeScenario | null>(null);
  const [cascadeStep, setCascadeStep] = useState(0);
  const [activeView, setActiveView] = useState<"dashboard" | "scenarios" | "risks">("dashboard");

  const fetchWhatIf = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("city-whatif", {
        body: {
          cityName: data.cityName,
          state: data.state,
          population: data.population,
          infrastructure: data.infrastructure,
          challenges: data.challenges,
        },
      });
      if (fnError) throw new Error(fnError.message);
      if (!result?.success) throw new Error(result?.error || "Failed to analyze");
      setWhatIfData(result.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [data]);

  useEffect(() => { fetchWhatIf(); }, [fetchWhatIf]);

  const triggerFailure = useCallback((systemId: string) => {
    if (!whatIfData) return;
    const system = whatIfData.systems.find((s) => s.id === systemId);
    if (!system) return;

    setSelectedSystem(systemId);
    const newFailed = new Set(failedSystems);
    newFailed.add(systemId);

    // Cascade to dependents with delays
    const cascadeQueue = [...system.dependents];
    let delay = 0;
    cascadeQueue.forEach((depId) => {
      delay += 400;
      setTimeout(() => {
        setFailedSystems((prev) => {
          const next = new Set(prev);
          next.add(depId);
          return next;
        });
      }, delay);
    });

    setFailedSystems(newFailed);
  }, [whatIfData, failedSystems]);

  const runScenario = useCallback((scenario: CascadeScenario) => {
    setActiveScenario(scenario);
    setFailedSystems(new Set());
    setCascadeStep(0);

    scenario.chain.forEach((sysId, i) => {
      setTimeout(() => {
        setCascadeStep(i + 1);
        setFailedSystems((prev) => {
          const next = new Set(prev);
          next.add(sysId);
          return next;
        });
        setSelectedSystem(sysId);
      }, i * 800);
    });
  }, []);

  const reset = () => {
    setFailedSystems(new Set());
    setActiveScenario(null);
    setCascadeStep(0);
    setSelectedSystem(null);
  };

  const activeSystem = whatIfData?.systems.find((s) => s.id === selectedSystem);
  const chaosLevel = whatIfData ? Math.round((failedSystems.size / whatIfData.systems.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
          <Activity className="w-10 h-10 text-primary" />
        </motion.div>
        <p className="text-sm font-heading font-semibold">Analyzing {data.cityName}'s Infrastructure…</p>
        <p className="text-xs text-muted-foreground">Mapping vulnerabilities and dependencies</p>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertTriangle className="w-8 h-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <button onClick={fetchWhatIf} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-heading font-medium">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  if (!whatIfData) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-destructive" />
            What If It Breaks?
          </h3>
          <p className="text-muted-foreground text-sm max-w-lg leading-relaxed">
            A deep analysis of {data.cityName}'s {whatIfData.systems.length} critical systems.
            Click any system to simulate failure and watch the cascade.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ResilienceGauge score={whatIfData.resilienceScore} grade={whatIfData.resilienceGrade} />
        </div>
      </div>

      {/* Chaos meter */}
      {failedSystems.size > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-4 border-destructive/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-heading font-bold text-muted-foreground">CITY STATUS</span>
            <button onClick={reset} className="flex items-center gap-1 text-xs font-heading text-muted-foreground hover:text-foreground">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
          <div className="h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: chaosLevel > 60 ? "hsl(0, 75%, 55%)" : chaosLevel > 30 ? "hsl(40, 90%, 50%)" : "hsl(150, 60%, 45%)" }}
              animate={{ width: `${chaosLevel}%` }}
              transition={{ type: "spring", stiffness: 100 }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-[10px] font-heading">
            <span className="text-muted-foreground">{failedSystems.size}/{whatIfData.systems.length} systems offline</span>
            <span className={chaosLevel > 60 ? "text-destructive font-bold" : chaosLevel > 30 ? "text-yellow-500" : "text-emerald-500"}>
              {chaosLevel > 60 ? "TOTAL COLLAPSE 💀" : chaosLevel > 30 ? "MAJOR CRISIS 🔥" : "DISRUPTION ⚠️"}
            </span>
          </div>
        </motion.div>
      )}

      {/* Sub-nav */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {([
          { key: "dashboard", icon: <BarChart3 className="w-3.5 h-3.5" />, label: "Systems Dashboard" },
          { key: "scenarios", icon: <Activity className="w-3.5 h-3.5" />, label: "Cascade Scenarios" },
          { key: "risks", icon: <Target className="w-3.5 h-3.5" />, label: "City Risks" },
        ] as const).map((v) => (
          <button key={v.key} onClick={() => setActiveView(v.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-all ${
              activeView === v.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >{v.icon} {v.label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeView === "dashboard" ? (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid lg:grid-cols-[1fr_400px] gap-6"
          >
            {/* Systems Grid */}
            <div className="grid sm:grid-cols-2 gap-3">
              {whatIfData.systems.map((system) => (
                <SystemCard
                  key={system.id}
                  system={system}
                  isActive={selectedSystem === system.id}
                  isFailed={failedSystems.has(system.id)}
                  onClick={() => {
                    setSelectedSystem(selectedSystem === system.id ? null : system.id);
                  }}
                />
              ))}
            </div>

            {/* Detail Panel */}
            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {activeSystem ? (
                  <motion.div key={activeSystem.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    {/* System detail */}
                    <div className="glass-card p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{failedSystems.has(activeSystem.id) ? "💥" : activeSystem.emoji}</span>
                          <h4 className="font-heading font-bold">{activeSystem.label}</h4>
                        </div>
                        {!failedSystems.has(activeSystem.id) && (
                          <button
                            onClick={() => triggerFailure(activeSystem.id)}
                            className="px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-xs font-heading font-bold hover:bg-destructive/20 transition-colors"
                          >
                            ⚡ Knock Offline
                          </button>
                        )}
                      </div>

                      {/* All metrics */}
                      <div className="grid grid-cols-2 gap-3">
                        {activeSystem.metrics.map((m, i) => (
                          <div key={i} className="p-3 rounded-lg bg-muted/30">
                            <span className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider">{m.label}</span>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="w-2 h-2 rounded-full" style={{ background: statusColors[m.status] }} />
                              <span className="text-sm font-heading font-bold">{m.value}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Vulnerabilities */}
                      <div>
                        <p className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground font-bold mb-2">
                          Vulnerabilities
                        </p>
                        <div className="space-y-1">
                          {activeSystem.vulnerabilities.map((v, i) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0" />
                              {v}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Impact stats */}
                      <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground font-heading">Recovery</p>
                          <p className="text-xs font-heading font-bold text-destructive">{activeSystem.recoveryTime}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground font-heading">Affected</p>
                          <p className="text-xs font-heading font-bold text-destructive">{activeSystem.populationAffected}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground font-heading">Cost/Day</p>
                          <p className="text-xs font-heading font-bold text-destructive">{activeSystem.economicImpact}</p>
                        </div>
                      </div>

                      {/* Real world example */}
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-[10px] font-heading text-primary font-bold uppercase tracking-wider mb-1">Real-World Precedent</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{activeSystem.realWorldExample}</p>
                      </div>
                    </div>

                    {/* Failure Timeline */}
                    {failedSystems.has(activeSystem.id) && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
                        <h4 className="text-[10px] font-heading uppercase tracking-widest text-destructive font-bold mb-4 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" /> Failure Cascade Timeline
                        </h4>
                        <FailureTimeline events={activeSystem.failureTimeline} />
                      </motion.div>
                    )}

                    {/* Dependents */}
                    <div className="glass-card p-4">
                      <p className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground font-bold mb-2">
                        Systems That Depend On This
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {activeSystem.dependents.map((depId) => {
                          const dep = whatIfData.systems.find((s) => s.id === depId);
                          if (!dep) return null;
                          return (
                            <button
                              key={depId}
                              onClick={() => setSelectedSystem(depId)}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-heading transition-all ${
                                failedSystems.has(depId) ? "bg-destructive/10 text-destructive" : "bg-muted/50 text-muted-foreground hover:bg-muted"
                              }`}
                            >
                              <span>{failedSystems.has(depId) ? "💥" : dep.emoji}</span>
                              {dep.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center">
                    <Gauge className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-heading font-medium text-foreground mb-1">Select a System</p>
                    <p className="text-xs text-muted-foreground">Click any system card to view detailed metrics, vulnerabilities, and simulate failure.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ) : activeView === "scenarios" ? (
          <motion.div key="scenarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="grid sm:grid-cols-3 gap-4">
              {whatIfData.cascadeScenarios.map((scenario, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => runScenario(scenario)}
                  className={`glass-card p-5 text-left hover:border-destructive/30 transition-all group ${
                    activeScenario?.name === scenario.name ? "ring-2 ring-destructive border-destructive/30" : ""
                  }`}
                >
                  <h4 className="font-heading font-bold text-sm mb-2 group-hover:text-destructive transition-colors">
                    {scenario.name}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-3">{scenario.description}</p>

                  {/* Cascade chain visualization */}
                  <div className="flex items-center gap-1 flex-wrap mb-3">
                    {scenario.chain.map((sysId, j) => {
                      const sys = whatIfData.systems.find((s) => s.id === sysId);
                      const isReached = activeScenario?.name === scenario.name && j < cascadeStep;
                      return (
                        <div key={j} className="flex items-center gap-1">
                          <span className={`text-sm transition-all ${isReached ? "scale-125" : ""}`}>
                            {isReached ? "💥" : sys?.emoji || "⚙️"}
                          </span>
                          {j < scenario.chain.length - 1 && (
                            <ChevronRight className={`w-3 h-3 ${isReached ? "text-destructive" : "text-muted-foreground/30"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-[10px] text-destructive/70 font-heading font-medium">
                    {scenario.totalImpact}
                  </div>

                  <div className="mt-3 text-[10px] font-heading font-bold text-primary uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                    ▶ Run Scenario
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Resilience factors */}
            <div className="glass-card p-6 mt-6">
              <h4 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" /> Resilience Breakdown
              </h4>
              <div className="space-y-3">
                {whatIfData.resilienceFactors.map((factor, i) => {
                  const pct = Math.round((factor.score / factor.maxScore) * 100);
                  const color = pct >= 70 ? "hsl(150, 60%, 45%)" : pct >= 40 ? "hsl(45, 90%, 50%)" : "hsl(0, 75%, 55%)";
                  return (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-heading font-medium text-foreground">{factor.factor}</span>
                        <span className="font-mono font-bold" style={{ color }}>{factor.score}/{factor.maxScore}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="risks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {whatIfData.citySpecificRisks.map((risk, i) => {
              const probColor = risk.probability === "high" ? "text-destructive" : risk.probability === "medium" ? "text-yellow-500" : "text-emerald-500";
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-heading font-bold text-base">{risk.risk}</h4>
                    <span className={`text-xs font-heading font-bold uppercase tracking-wider ${probColor}`}>
                      {risk.probability} probability
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{risk.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-heading text-muted-foreground uppercase tracking-wider">Threatens:</span>
                    {risk.primarySystems.map((sysId) => {
                      const sys = whatIfData.systems.find((s) => s.id === sysId);
                      return (
                        <span key={sysId} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-xs font-heading">
                          {sys?.emoji || "⚙️"} {sys?.label || sysId}
                        </span>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatIfSimulator;

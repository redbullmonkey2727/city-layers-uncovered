import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Sparkles, Shield, Target, ChevronDown, BarChart3 } from "lucide-react";

interface KeyStat {
  label: string;
  currentValue: string;
  fiveYear: string;
  tenYear: string;
  twentyFiveYear: string;
  trend: "rising" | "falling" | "stable";
  confidence: "high" | "medium" | "low";
  category: string;
}

interface Scenario {
  name: string;
  probability: number;
  description: string;
  keyChanges: string[];
  sentiment: "optimistic" | "neutral" | "pessimistic";
}

interface Risk {
  title: string;
  severity: number;
  timeframe: string;
  description: string;
  mitigationStatus: string;
}

interface Opportunity {
  title: string;
  potential: number;
  sector: string;
  description: string;
}

interface PopPoint {
  year: number;
  population: number;
  label: string;
}

interface ForecastData {
  keyStats: KeyStat[];
  scenarios: Scenario[];
  risks: Risk[];
  opportunities: Opportunity[];
  populationForecast: PopPoint[];
  overallOutlook: string;
  outlookSummary: string;
}

interface Props {
  cityName: string;
  state: string;
  population: string;
}

const OUTLOOK_COLORS: Record<string, string> = {
  thriving: "text-emerald-400",
  growing: "text-emerald-500",
  stable: "text-blue-400",
  declining: "text-amber-400",
  "at-risk": "text-red-400",
};

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "rising") return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
  if (trend === "falling") return <TrendingDown className="w-3.5 h-3.5 text-red-400" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
};

const ConfidenceDots = ({ level }: { level: string }) => {
  const n = level === "high" ? 3 : level === "medium" ? 2 : 1;
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`w-1.5 h-1.5 rounded-full ${i <= n ? "bg-primary" : "bg-muted"}`} />
      ))}
    </div>
  );
};

const CityForecast = ({ cityName, state, population }: Props) => {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStat, setExpandedStat] = useState<number | null>(null);
  const [activeView, setActiveView] = useState<"stats" | "scenarios" | "risks">("stats");
  const { toast } = useToast();

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const { data: result, error } = await supabase.functions.invoke("city-forecast", {
          body: { cityName, state, population },
        });
        if (error) throw error;
        if (!result?.success) throw new Error(result?.error || "Failed");
        setData(result.data);
      } catch (err) {
        console.error("Forecast error:", err);
        toast({ title: "Couldn't load forecast", description: "Try again later.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [cityName]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-48 bg-muted animate-pulse rounded" />
            <div className="h-3 w-32 bg-muted animate-pulse rounded" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-2">
              <div className="h-3 w-20 bg-muted animate-pulse rounded" />
              <div className="h-6 w-24 bg-muted animate-pulse rounded" />
              <div className="h-2 w-16 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxPop = Math.max(...(data.populationForecast?.map((p) => p.population) || [1]));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg">Future Outlook</h3>
              <p className="text-xs text-muted-foreground">5, 10 & 25-year projections for {cityName}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-muted-foreground/50 uppercase">Outlook</span>
          <span className={`text-sm font-heading font-bold uppercase ${OUTLOOK_COLORS[data.overallOutlook] || "text-foreground"}`}>
            {data.overallOutlook}
          </span>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex gap-1 p-1 bg-muted/30 rounded-lg w-fit">
        {(["stats", "scenarios", "risks"] as const).map((v) => (
          <button key={v} onClick={() => setActiveView(v)}
            className={`px-4 py-1.5 text-xs font-heading font-medium rounded-md transition-all ${
              activeView === v ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {v === "stats" ? "📊 Key Stats" : v === "scenarios" ? "🔮 Scenarios" : "⚠️ Risks & Opportunities"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeView === "stats" && (
          <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Key Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data.keyStats?.map((stat, i) => (
                <motion.button
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setExpandedStat(expandedStat === i ? null : i)}
                  className="glass-card p-4 text-left hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono text-muted-foreground/50 uppercase">{stat.category}</span>
                    <div className="flex items-center gap-2">
                      <ConfidenceDots level={stat.confidence} />
                      <TrendIcon trend={stat.trend} />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground font-heading mb-1">{stat.label}</p>
                  <p className="text-xl font-heading font-bold text-foreground">{stat.currentValue}</p>

                  <AnimatePresence>
                    {expandedStat === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                          {[
                            { label: "5 Years", value: stat.fiveYear },
                            { label: "10 Years", value: stat.tenYear },
                            { label: "25 Years", value: stat.twentyFiveYear },
                          ].map((proj) => (
                            <div key={proj.label} className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">{proj.label}</span>
                              <span className="font-heading font-semibold text-primary">{proj.value}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex items-center justify-center mt-2">
                    <ChevronDown className={`w-3 h-3 text-muted-foreground/30 transition-transform ${expandedStat === i ? "rotate-180" : ""}`} />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Population Forecast Chart */}
            {data.populationForecast && data.populationForecast.length > 0 && (
              <div className="glass-card p-6">
                <h4 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" /> Population Projection
                </h4>
                <div className="flex items-end justify-around gap-2 h-40">
                  {data.populationForecast.map((point, i) => {
                    const height = (point.population / maxPop) * 100;
                    const isFuture = i > 0;
                    return (
                      <motion.div key={point.year} className="flex flex-col items-center gap-1 flex-1"
                        initial={{ opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                        style={{ transformOrigin: "bottom" }}
                      >
                        <span className="text-[9px] font-mono text-muted-foreground/60">{point.label}</span>
                        <div
                          className={`w-full max-w-[40px] rounded-t-md transition-all ${
                            isFuture ? "bg-primary/30 border border-primary/20 border-b-0" : "bg-primary"
                          }`}
                          style={{ height: `${height}%`, minHeight: 8 }}
                        />
                        <span className="text-[10px] font-heading font-bold">{point.year}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Outlook narrative */}
            {data.outlookSummary && (
              <div className="glass-card p-6">
                <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" /> Analyst's Outlook
                </h4>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line font-body">
                  {data.outlookSummary}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeView === "scenarios" && (
          <motion.div key="scenarios" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {data.scenarios?.map((scenario, i) => {
              const sentimentColors = {
                optimistic: "border-emerald-500/30 bg-emerald-500/5",
                neutral: "border-blue-500/30 bg-blue-500/5",
                pessimistic: "border-red-500/30 bg-red-500/5",
              };
              return (
                <motion.div
                  key={scenario.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`glass-card p-6 border-l-4 ${sentimentColors[scenario.sentiment] || ""}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-heading font-bold">{scenario.name}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{scenario.probability}% likely</span>
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${scenario.probability}%` }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                  <ul className="space-y-1">
                    {scenario.keyChanges?.map((change, j) => (
                      <li key={j} className="text-xs text-muted-foreground/80 flex items-start gap-2">
                        <span className="text-primary mt-0.5">→</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {activeView === "risks" && (
          <motion.div key="risks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            {/* Risks */}
            <div>
              <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Key Risks
              </h4>
              <div className="space-y-2">
                {data.risks?.map((risk, i) => (
                  <motion.div
                    key={risk.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="glass-card p-4 flex items-center gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="relative w-10 h-10">
                        <svg viewBox="0 0 40 40" className="w-full h-full -rotate-90">
                          <circle cx="20" cy="20" r="16" fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                          <motion.circle
                            cx="20" cy="20" r="16" fill="none"
                            stroke={risk.severity >= 7 ? "hsl(0 70% 50%)" : risk.severity >= 4 ? "hsl(40 80% 50%)" : "hsl(120 50% 50%)"}
                            strokeWidth="3" strokeLinecap="round"
                            strokeDasharray={100} strokeDashoffset={100 - risk.severity * 10}
                            initial={{ strokeDashoffset: 100 }}
                            animate={{ strokeDashoffset: 100 - risk.severity * 10 }}
                            transition={{ delay: 0.3 + i * 0.1, duration: 0.8 }}
                          />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-mono">
                          {risk.severity}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-heading font-semibold text-sm">{risk.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                          risk.mitigationStatus === "addressed" ? "bg-emerald-500/10 text-emerald-500" :
                          risk.mitigationStatus === "in-progress" ? "bg-amber-500/10 text-amber-500" :
                          "bg-red-500/10 text-red-400"
                        }`}>
                          {risk.mitigationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{risk.description}</p>
                      <span className="text-[9px] font-mono text-muted-foreground/50 uppercase">{risk.timeframe}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Opportunities */}
            <div>
              <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-500" /> Opportunities
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.opportunities?.map((opp, i) => (
                  <motion.div
                    key={opp.title}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-card p-4 hover:border-emerald-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono text-muted-foreground/50 uppercase">{opp.sector}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 10 }).map((_, j) => (
                          <div key={j} className={`w-1 h-3 rounded-full ${j < opp.potential ? "bg-emerald-500/60" : "bg-muted"}`} />
                        ))}
                      </div>
                    </div>
                    <p className="font-heading font-semibold text-sm mb-1">{opp.title}</p>
                    <p className="text-xs text-muted-foreground">{opp.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CityForecast;

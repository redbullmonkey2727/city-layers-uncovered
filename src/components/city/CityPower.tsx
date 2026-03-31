import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import type { CityData } from "@/lib/cityLookup";

interface PowerData {
  mayor: { name: string; party: string; since: string; previousRole: string; keyPolicies: string[]; approvalEstimate: string };
  cityCouncil: { totalSeats: number; democrats: number; republicans: number; independent: number; keyMembers: { name: string; district: string; party: string; focus: string }[] };
  stateGovernor: { name: string; party: string };
  congressionalReps: { name: string; party: string; chamber: string; district: string }[];
  powerBrokers: { name: string; role: string; sector: string; influence: string; description: string; estimatedInvestment: string; politicalLean: string }[];
  majorDevelopers: { name: string; notableProjects: string[]; estimatedValue: string; politicalDonations: string }[];
  topEmployers: { name: string; employees: string; sector: string }[];
  politicalLandscape: { leaning: string; lastPresidentialVote: { democrat: number; republican: number; other: number }; voterTurnout: string; keyIssues: string[]; recentControversies: string[] };
  moneyFlow: { annualBudget: string; topRevenueSource: string; biggestExpense: string; recentBondMeasures: string[]; majorFederalGrants: string[] };
  unions: { name: string; members: string; influence: string }[];
  costOfLiving: { index: number; medianHomePrice: string; medianRent: string; medianHouseholdIncome: string; groceryIndex: number; transportIndex: number; healthcareIndex: number; comparedToNational: string };
  happinessIndex: { score: number; ranking: string; factors: { name: string; score: number; description: string }[] };
}

const partyColor = (party: string) => {
  const p = (party || "").toLowerCase();
  if (p.includes("democrat")) return "hsl(217 91% 60%)";
  if (p.includes("republican")) return "hsl(0 72% 51%)";
  if (p.includes("independent") || p.includes("nonpartisan")) return "hsl(280 60% 55%)";
  return "hsl(var(--muted-foreground))";
};

const partyBg = (party: string) => {
  const p = (party || "").toLowerCase();
  if (p.includes("democrat")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  if (p.includes("republican")) return "bg-red-500/10 text-red-400 border-red-500/20";
  return "bg-purple-500/10 text-purple-400 border-purple-500/20";
};

const sectorEmoji: Record<string, string> = {
  real_estate: "🏗️", tech: "💻", finance: "💰", healthcare: "🏥", energy: "⚡",
  media: "📺", philanthropy: "🤝", labor: "✊", government: "🏛️", manufacturing: "🏭",
  retail: "🛒", education: "🎓",
};

const CityPower = ({ data }: { data: CityData }) => {
  const [powerData, setPowerData] = useState<PowerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("government");
  const [expandedBroker, setExpandedBroker] = useState<number | null>(null);

  useEffect(() => {
    const fetchPower = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data: result, error: fnError } = await supabase.functions.invoke("city-power", {
          body: { cityName: data.cityName, state: data.state, population: data.population },
        });
        if (fnError) throw new Error(fnError.message);
        if (!result?.success) throw new Error(result?.error || "Failed to load");
        setPowerData(result.data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchPower();
  }, [data.cityName]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 2 }}>
            <span className="text-4xl">🏛️</span>
          </motion.div>
          <h2 className="text-2xl font-heading font-bold mt-3">Analyzing Power Structure...</h2>
          <p className="text-sm text-muted-foreground mt-1">Mapping who really runs {data.cityName}</p>
        </div>
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    );
  }

  if (error || !powerData) {
    return (
      <div className="text-center py-16">
        <span className="text-4xl">⚠️</span>
        <p className="text-muted-foreground mt-3">{error || "Failed to load power data"}</p>
      </div>
    );
  }

  const sections = [
    { id: "government", label: "🏛️ Government", short: "Gov" },
    { id: "power-brokers", label: "👔 Power Brokers", short: "Power" },
    { id: "money", label: "💰 Money Flow", short: "Money" },
    { id: "politics", label: "🗳️ Politics", short: "Politics" },
    { id: "economy", label: "📊 Economy", short: "Economy" },
  ];

  const voteData = powerData.politicalLandscape.lastPresidentialVote;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">
          Who Runs <span className="text-gradient">{data.cityName}</span>?
        </h2>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          The people, money, and politics shaping this city.
        </p>
      </div>

      {/* Section Nav */}
      <div className="flex gap-1 overflow-x-auto pb-2 no-scrollbar">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSection(s.id)}
            className={`px-3 py-2 text-xs font-heading font-medium rounded-lg whitespace-nowrap transition-all ${
              activeSection === s.id
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            <span className="hidden sm:inline">{s.label}</span>
            <span className="sm:hidden">{s.short}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSection === "government" && (
          <motion.div key="gov" className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Mayor Card */}
            <div className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-heading">Mayor</span>
                  <h3 className="text-xl font-heading font-bold mt-1">{powerData.mayor.name}</h3>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${partyBg(powerData.mayor.party)}`}>
                    {powerData.mayor.party}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-muted-foreground">Since {powerData.mayor.since}</span>
                  <div className="text-xs text-muted-foreground mt-1">Approval: <span className="text-foreground font-medium">{powerData.mayor.approvalEstimate}</span></div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Previously: {powerData.mayor.previousRole}</p>
              <div className="flex flex-wrap gap-1.5">
                {powerData.mayor.keyPolicies.map((p, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{p}</span>
                ))}
              </div>
            </div>

            {/* City Council Composition */}
            <div className="glass-card p-6">
              <h4 className="font-heading font-semibold text-sm mb-4">City Council ({powerData.cityCouncil.totalSeats} seats)</h4>
              {/* Visual bar */}
              <div className="flex h-6 rounded-full overflow-hidden mb-4">
                <motion.div
                  className="bg-blue-500 flex items-center justify-center"
                  initial={{ width: 0 }}
                  animate={{ width: `${(powerData.cityCouncil.democrats / powerData.cityCouncil.totalSeats) * 100}%` }}
                  transition={{ duration: 0.8 }}
                >
                  <span className="text-[10px] font-bold text-white">{powerData.cityCouncil.democrats}D</span>
                </motion.div>
                {powerData.cityCouncil.independent > 0 && (
                  <motion.div
                    className="bg-purple-500 flex items-center justify-center"
                    initial={{ width: 0 }}
                    animate={{ width: `${(powerData.cityCouncil.independent / powerData.cityCouncil.totalSeats) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    <span className="text-[10px] font-bold text-white">{powerData.cityCouncil.independent}I</span>
                  </motion.div>
                )}
                <motion.div
                  className="bg-red-500 flex items-center justify-center"
                  initial={{ width: 0 }}
                  animate={{ width: `${(powerData.cityCouncil.republicans / powerData.cityCouncil.totalSeats) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <span className="text-[10px] font-bold text-white">{powerData.cityCouncil.republicans}R</span>
                </motion.div>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {powerData.cityCouncil.keyMembers.map((m, i) => (
                  <motion.div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: partyColor(m.party) }} />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium block truncate">{m.name}</span>
                      <span className="text-[10px] text-muted-foreground">{m.district} · {m.focus}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* State & Federal */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="glass-card p-5">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-heading">Governor</span>
                <h4 className="font-heading font-semibold mt-1">{powerData.stateGovernor.name}</h4>
                <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full border ${partyBg(powerData.stateGovernor.party)}`}>
                  {powerData.stateGovernor.party}
                </span>
              </div>
              <div className="glass-card p-5">
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-heading">Congressional Reps</span>
                <div className="mt-2 space-y-1.5">
                  {powerData.congressionalReps.slice(0, 4).map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: partyColor(r.party) }} />
                      <span className="text-xs">{r.name} <span className="text-muted-foreground">({r.chamber})</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeSection === "power-brokers" && (
          <motion.div key="brokers" className="space-y-4" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {powerData.powerBrokers.map((broker, i) => (
              <motion.div
                key={i}
                className={`glass-card p-5 cursor-pointer transition-all ${expandedBroker === i ? "ring-1 ring-primary/50" : "hover:border-primary/20"}`}
                onClick={() => setExpandedBroker(expandedBroker === i ? null : i)}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{sectorEmoji[broker.sector] || "👤"}</span>
                    <div>
                      <h4 className="font-heading font-semibold text-sm">{broker.name}</h4>
                      <p className="text-xs text-muted-foreground">{broker.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${partyBg(broker.politicalLean)}`}>
                      {broker.politicalLean}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${broker.influence === "high" ? "bg-amber-500/10 text-amber-400" : "bg-muted text-muted-foreground"}`}>
                      {broker.influence} influence
                    </span>
                  </div>
                </div>
                <AnimatePresence>
                  {expandedBroker === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">{broker.description}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">{broker.estimatedInvestment}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Major Developers */}
            <h4 className="font-heading font-semibold text-sm mt-8 mb-3 flex items-center gap-2">
              <span>🏗️</span> Major Developers
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              {powerData.majorDevelopers.map((dev, i) => (
                <motion.div key={i} className="glass-card p-5"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <h5 className="font-heading font-semibold text-sm">{dev.name}</h5>
                  <p className="text-xs text-emerald-400 mt-1">{dev.estimatedValue}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {dev.notableProjects.map((p, j) => (
                      <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{p}</span>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2">Donations: {dev.politicalDonations}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeSection === "money" && (
          <motion.div key="money" className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Budget Overview */}
            <div className="glass-card p-6">
              <h4 className="font-heading font-semibold text-sm mb-4">City Budget</h4>
              <div className="grid grid-cols-3 gap-4 text-center mb-6">
                <div>
                  <span className="text-2xl font-heading font-bold text-primary">{powerData.moneyFlow.annualBudget}</span>
                  <span className="text-[10px] text-muted-foreground block mt-1">Annual Budget</span>
                </div>
                <div>
                  <span className="text-sm font-heading font-semibold">{powerData.moneyFlow.topRevenueSource}</span>
                  <span className="text-[10px] text-muted-foreground block mt-1">Top Revenue</span>
                </div>
                <div>
                  <span className="text-sm font-heading font-semibold">{powerData.moneyFlow.biggestExpense}</span>
                  <span className="text-[10px] text-muted-foreground block mt-1">Biggest Expense</span>
                </div>
              </div>

              {/* Bond Measures */}
              <h5 className="text-xs uppercase tracking-wider text-muted-foreground font-heading mb-2">Recent Bond Measures</h5>
              <div className="space-y-1.5 mb-4">
                {powerData.moneyFlow.recentBondMeasures.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-foreground/80">{b}</span>
                  </div>
                ))}
              </div>

              {/* Federal Grants */}
              <h5 className="text-xs uppercase tracking-wider text-muted-foreground font-heading mb-2">Federal Grants</h5>
              <div className="space-y-1.5">
                {powerData.moneyFlow.majorFederalGrants.map((g, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-foreground/80">{g}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Employers */}
            <div className="glass-card p-6">
              <h4 className="font-heading font-semibold text-sm mb-4">Top Employers</h4>
              <div className="space-y-2">
                {powerData.topEmployers.map((emp, i) => (
                  <motion.div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-center gap-2">
                      <span>{sectorEmoji[emp.sector] || "🏢"}</span>
                      <span className="text-sm font-medium">{emp.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{emp.employees}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Unions */}
            {powerData.unions.length > 0 && (
              <div className="glass-card p-6">
                <h4 className="font-heading font-semibold text-sm mb-4">✊ Labor Unions</h4>
                <div className="space-y-2">
                  {powerData.unions.map((u, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <span className="text-xs font-medium">{u.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">{u.members}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${u.influence === "high" ? "bg-amber-500/10 text-amber-400" : "bg-muted text-muted-foreground"}`}>{u.influence}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeSection === "politics" && (
          <motion.div key="politics" className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Political Leaning */}
            <div className="glass-card p-6">
              <div className="text-center mb-6">
                <span className="text-3xl font-heading font-bold">{powerData.politicalLandscape.leaning}</span>
                <p className="text-xs text-muted-foreground mt-1">Voter Turnout: {powerData.politicalLandscape.voterTurnout}</p>
              </div>

              {/* Vote bar */}
              <h5 className="text-xs uppercase tracking-wider text-muted-foreground font-heading mb-2">Last Presidential Election</h5>
              <div className="flex h-10 rounded-xl overflow-hidden mb-4">
                <motion.div className="bg-blue-500 flex items-center justify-center"
                  initial={{ width: 0 }} animate={{ width: `${voteData.democrat}%` }} transition={{ duration: 1 }}>
                  <span className="text-xs font-bold text-white">{voteData.democrat}%</span>
                </motion.div>
                {voteData.other > 0 && (
                  <motion.div className="bg-gray-500 flex items-center justify-center"
                    initial={{ width: 0 }} animate={{ width: `${voteData.other}%` }} transition={{ duration: 1, delay: 0.2 }}>
                    <span className="text-[10px] font-bold text-white">{voteData.other}%</span>
                  </motion.div>
                )}
                <motion.div className="bg-red-500 flex items-center justify-center"
                  initial={{ width: 0 }} animate={{ width: `${voteData.republican}%` }} transition={{ duration: 1, delay: 0.4 }}>
                  <span className="text-xs font-bold text-white">{voteData.republican}%</span>
                </motion.div>
              </div>

              {/* Key Issues */}
              <h5 className="text-xs uppercase tracking-wider text-muted-foreground font-heading mb-2 mt-6">Key Issues</h5>
              <div className="flex flex-wrap gap-1.5">
                {powerData.politicalLandscape.keyIssues.map((issue, i) => (
                  <span key={i} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">{issue}</span>
                ))}
              </div>

              {/* Controversies */}
              {powerData.politicalLandscape.recentControversies.length > 0 && (
                <>
                  <h5 className="text-xs uppercase tracking-wider text-muted-foreground font-heading mb-2 mt-6">Recent Controversies</h5>
                  <div className="space-y-2">
                    {powerData.politicalLandscape.recentControversies.map((c, i) => (
                      <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                        <span className="text-xs">⚡</span>
                        <p className="text-xs text-muted-foreground">{c}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        {activeSection === "economy" && (
          <motion.div key="economy" className="space-y-6" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {/* Cost of Living */}
            <div className="glass-card p-6">
              <h4 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2">
                💵 Cost of Living
              </h4>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-24 h-24">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                    <motion.circle cx="50" cy="50" r="40" fill="none"
                      stroke={powerData.costOfLiving.index > 100 ? "hsl(0 72% 51%)" : "hsl(142 71% 45%)"}
                      strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 40}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - powerData.costOfLiving.index / 150) }}
                      transition={{ duration: 1.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-heading font-bold">{powerData.costOfLiving.index}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{powerData.costOfLiving.comparedToNational}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">100 = National Average</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Median Home", value: powerData.costOfLiving.medianHomePrice, emoji: "🏠" },
                  { label: "Median Rent", value: powerData.costOfLiving.medianRent, emoji: "🔑" },
                  { label: "Household Income", value: powerData.costOfLiving.medianHouseholdIncome, emoji: "💼" },
                  { label: "Grocery Index", value: String(powerData.costOfLiving.groceryIndex), emoji: "🛒" },
                ].map((item, i) => (
                  <motion.div key={i} className="text-center p-3 rounded-lg bg-muted/30"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                    <span className="text-lg block">{item.emoji}</span>
                    <span className="text-sm font-heading font-bold block mt-1">{item.value}</span>
                    <span className="text-[10px] text-muted-foreground">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Happiness Index */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-heading font-semibold text-sm flex items-center gap-2">
                  😊 Happiness Index
                </h4>
                <span className="text-xs text-muted-foreground">{powerData.happinessIndex.ranking}</span>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-20 h-20">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" />
                    <motion.circle cx="50" cy="50" r="40" fill="none"
                      stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 40}
                      initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - powerData.happinessIndex.score / 100) }}
                      transition={{ duration: 1.5 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-heading font-bold">{powerData.happinessIndex.score}</span>
                  </div>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">Overall Happiness Score</span>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Based on community, income, health, safety, education, and environment factors</p>
                </div>
              </div>
              <div className="space-y-3">
                {powerData.happinessIndex.factors.map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{f.name}</span>
                      <span className="text-xs text-muted-foreground">{f.score}/100</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: f.score >= 75 ? "hsl(142 71% 45%)" : f.score >= 60 ? "hsl(var(--primary))" : "hsl(0 72% 51%)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${f.score}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.06 }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{f.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CityPower;

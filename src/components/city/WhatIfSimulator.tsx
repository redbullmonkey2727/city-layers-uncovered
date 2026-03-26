import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Zap, Droplets, Wifi, Trash2, Bus, Shield, GraduationCap, Apple, RotateCcw, Power } from "lucide-react";
import type { CityData } from "@/lib/cityLookup";

interface SystemNode {
  id: string;
  label: string;
  icon: React.ReactNode;
  emoji: string;
  color: string;
  dependsOn: string[];
  description: string;
  failureEffect: string;
  cascadeDelay: number;
}

const SYSTEMS: SystemNode[] = [
  { id: "power", label: "Electricity", icon: <Zap className="w-5 h-5" />, emoji: "⚡", color: "hsl(48, 96%, 53%)", dependsOn: [], description: "Powers everything from hospitals to traffic lights.", failureEffect: "Total blackout. Traffic signals dead. Hospitals on generators. No AC/heat.", cascadeDelay: 0 },
  { id: "water", label: "Water", icon: <Droplets className="w-5 h-5" />, emoji: "💧", color: "hsl(200, 80%, 55%)", dependsOn: ["power"], description: "Pumps need electricity to deliver clean water to every tap.", failureEffect: "Pumps fail. Water pressure drops to zero. Boil-water advisory issued.", cascadeDelay: 200 },
  { id: "internet", label: "Internet", icon: <Wifi className="w-5 h-5" />, emoji: "🌐", color: "hsl(260, 70%, 60%)", dependsOn: ["power"], description: "Cell towers, data centers, and routers all need power.", failureEffect: "No internet, no phone, no 911 calls. Banks go offline.", cascadeDelay: 100 },
  { id: "transit", label: "Transit", icon: <Bus className="w-5 h-5" />, emoji: "🚌", color: "hsl(160, 60%, 45%)", dependsOn: ["power", "internet"], description: "Traffic signals, subway systems, and dispatch all need power + comms.", failureEffect: "Trains stop in tunnels. Intersections become 4-way stops. Gridlock.", cascadeDelay: 300 },
  { id: "waste", label: "Waste", icon: <Trash2 className="w-5 h-5" />, emoji: "🗑️", color: "hsl(30, 60%, 50%)", dependsOn: ["transit"], description: "Garbage trucks need fuel infrastructure and clear roads.", failureEffect: "Trash piles up on streets within 48 hours. Rats and health hazards.", cascadeDelay: 400 },
  { id: "emergency", label: "Emergency", icon: <Shield className="w-5 h-5" />, emoji: "🚒", color: "hsl(0, 75%, 55%)", dependsOn: ["power", "internet", "water"], description: "911 dispatch, fire hydrants, and ambulance comms depend on multiple systems.", failureEffect: "No 911. Fire hydrants dry. Ambulances can't communicate or navigate.", cascadeDelay: 250 },
  { id: "food", label: "Food Supply", icon: <Apple className="w-5 h-5" />, emoji: "🍎", color: "hsl(120, 50%, 45%)", dependsOn: ["power", "transit"], description: "Refrigeration and delivery trucks keep grocery stores stocked.", failureEffect: "Perishables spoil in hours. Shelves bare within 3 days. Panic buying.", cascadeDelay: 500 },
  { id: "schools", label: "Schools", icon: <GraduationCap className="w-5 h-5" />, emoji: "🏫", color: "hsl(220, 60%, 55%)", dependsOn: ["power", "water", "transit"], description: "Schools need heating, water, safe roads, and communication systems.", failureEffect: "Schools close indefinitely. Parents can't work. Childcare crisis.", cascadeDelay: 350 },
];

// Position nodes in a radial layout
const getNodePosition = (index: number, total: number, radius: number) => {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius,
  };
};

interface Props {
  data: CityData;
}

const WhatIfSimulator = ({ data }: Props) => {
  const [failedSystems, setFailedSystems] = useState<Set<string>>(new Set());
  const [cascading, setCascading] = useState(false);
  const [hoveredSystem, setHoveredSystem] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<{ id: string; label: string; time: string }[]>([]);

  const triggerCascade = useCallback((systemId: string) => {
    if (cascading) return;
    setCascading(true);
    const newFailed = new Set(failedSystems);
    const newTimeline: { id: string; label: string; time: string }[] = [...timeline];

    // BFS cascade
    const queue: { id: string; depth: number }[] = [{ id: systemId, depth: 0 }];
    const visited = new Set<string>();
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);

      const system = SYSTEMS.find((s) => s.id === id)!;
      const delay = system.cascadeDelay + depth * 150;

      timeouts.push(
        setTimeout(() => {
          setFailedSystems((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
          });

          const hours = depth === 0 ? "0 min" : depth <= 1 ? `${depth * 15} min` : `${depth} hr`;
          setTimeline((prev) => [...prev, { id, label: system.label, time: `+${hours}` }]);
        }, delay)
      );

      // Find dependents (systems that depend on this one)
      SYSTEMS.forEach((s) => {
        if (s.dependsOn.includes(id) && !visited.has(s.id)) {
          // Only cascade if ALL dependencies are met (at least one is failed)
          queue.push({ id: s.id, depth: depth + 1 });
        }
      });
    }

    setTimeout(() => setCascading(false), 1200);
  }, [cascading, failedSystems, timeline]);

  const reset = () => {
    setFailedSystems(new Set());
    setTimeline([]);
    setCascading(false);
  };

  const radius = 140;
  const center = 200;
  const isFailed = (id: string) => failedSystems.has(id);

  const activeSystem = hoveredSystem
    ? SYSTEMS.find((s) => s.id === hoveredSystem)
    : null;

  const chaosLevel = Math.round((failedSystems.size / SYSTEMS.length) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <h3 className="text-2xl md:text-3xl font-heading font-bold flex items-center justify-center gap-3">
          <AlertTriangle className="w-7 h-7 text-destructive" />
          What If It Breaks?
        </h3>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
          Tap a system to knock it out and watch the cascade. Every city is a web of dependencies —
          {data.cityName}'s {data.population} residents rely on all of them.
        </p>
      </div>

      {/* Chaos meter */}
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between text-xs font-heading mb-2">
          <span className="text-muted-foreground">City Stability</span>
          <span className={`font-bold ${chaosLevel > 60 ? "text-destructive" : chaosLevel > 30 ? "text-yellow-500" : "text-emerald-500"}`}>
            {chaosLevel === 0 ? "All Systems Go ✅" : chaosLevel < 30 ? "Minor Disruption ⚠️" : chaosLevel < 60 ? "Major Crisis 🔥" : "Total Collapse 💀"}
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: chaosLevel > 60 ? "hsl(0, 75%, 55%)" : chaosLevel > 30 ? "hsl(40, 90%, 50%)" : "hsl(150, 60%, 45%)",
            }}
            animate={{ width: `${100 - chaosLevel}%` }}
            transition={{ type: "spring", stiffness: 100 }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Dependency Graph */}
        <div className="glass-card p-6 relative">
          <svg viewBox="0 0 400 400" className="w-full max-w-[400px] mx-auto">
            {/* Draw dependency lines */}
            {SYSTEMS.map((system) => {
              const pos = getNodePosition(SYSTEMS.indexOf(system), SYSTEMS.length, radius);
              return system.dependsOn.map((depId) => {
                const depIndex = SYSTEMS.findIndex((s) => s.id === depId);
                const depPos = getNodePosition(depIndex, SYSTEMS.length, radius);
                const bothFailed = isFailed(system.id) && isFailed(depId);
                const isHovered = hoveredSystem === system.id || hoveredSystem === depId;
                return (
                  <motion.line
                    key={`${depId}-${system.id}`}
                    x1={center + depPos.x}
                    y1={center + depPos.y}
                    x2={center + pos.x}
                    y2={center + pos.y}
                    stroke={bothFailed ? "hsl(0, 75%, 55%)" : isHovered ? "hsl(var(--primary))" : "hsl(var(--border))"}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    strokeDasharray={bothFailed ? "6 3" : "none"}
                    opacity={bothFailed ? 0.8 : 0.4}
                    animate={{
                      stroke: bothFailed ? "hsl(0, 75%, 55%)" : isHovered ? "hsl(var(--primary))" : "hsl(var(--border))",
                    }}
                    transition={{ duration: 0.3 }}
                  />
                );
              });
            })}

            {/* Draw nodes */}
            {SYSTEMS.map((system, i) => {
              const pos = getNodePosition(i, SYSTEMS.length, radius);
              const failed = isFailed(system.id);
              const hovered = hoveredSystem === system.id;

              return (
                <g
                  key={system.id}
                  className="cursor-pointer"
                  onClick={() => !failed && triggerCascade(system.id)}
                  onMouseEnter={() => setHoveredSystem(system.id)}
                  onMouseLeave={() => setHoveredSystem(null)}
                >
                  {/* Pulse ring for failed systems */}
                  {failed && (
                    <motion.circle
                      cx={center + pos.x}
                      cy={center + pos.y}
                      r={28}
                      fill="none"
                      stroke="hsl(0, 75%, 55%)"
                      strokeWidth="1.5"
                      initial={{ r: 22, opacity: 0.8 }}
                      animate={{ r: 32, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  )}

                  <motion.circle
                    cx={center + pos.x}
                    cy={center + pos.y}
                    r={hovered ? 26 : 22}
                    fill={failed ? "hsl(0, 75%, 55%)" : hovered ? "hsl(var(--primary))" : "hsl(var(--card))"}
                    stroke={failed ? "hsl(0, 60%, 40%)" : hovered ? "hsl(var(--primary))" : "hsl(var(--border))"}
                    strokeWidth="2"
                    animate={{
                      scale: failed ? [1, 1.08, 1] : 1,
                    }}
                    transition={failed ? { duration: 0.8, repeat: Infinity } : { duration: 0.2 }}
                  />

                  <text
                    x={center + pos.x}
                    y={center + pos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="18"
                    className="pointer-events-none select-none"
                  >
                    {failed ? "💥" : system.emoji}
                  </text>

                  <text
                    x={center + pos.x}
                    y={center + pos.y + 38}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="600"
                    fill={failed ? "hsl(0, 75%, 55%)" : "hsl(var(--muted-foreground))"}
                    className="pointer-events-none select-none font-heading"
                  >
                    {system.label}
                  </text>
                </g>
              );
            })}

            {/* Center label */}
            <text x={center} y={center - 8} textAnchor="middle" fontSize="10" fontWeight="700" fill="hsl(var(--foreground))" className="font-heading">
              {data.cityName}
            </text>
            <text x={center} y={center + 8} textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))" className="font-heading">
              TAP TO BREAK
            </text>
          </svg>

          {/* Reset button */}
          {failedSystems.size > 0 && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={reset}
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border text-xs font-heading font-medium hover:bg-muted transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </motion.button>
          )}
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Hovered system info */}
          <AnimatePresence mode="wait">
            {activeSystem ? (
              <motion.div
                key={activeSystem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card p-5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{isFailed(activeSystem.id) ? "💥" : activeSystem.emoji}</span>
                  <h4 className="font-heading font-bold text-sm">{activeSystem.label}</h4>
                  {isFailed(activeSystem.id) && (
                    <span className="ml-auto text-[10px] font-heading font-bold text-destructive uppercase tracking-wider bg-destructive/10 px-2 py-0.5 rounded-full">
                      OFFLINE
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{activeSystem.description}</p>
                {isFailed(activeSystem.id) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 rounded-lg bg-destructive/10 border border-destructive/20"
                  >
                    <p className="text-xs text-destructive font-medium leading-relaxed">
                      ⚠️ {activeSystem.failureEffect}
                    </p>
                  </motion.div>
                )}
                {activeSystem.dependsOn.length > 0 && (
                  <div className="text-[10px] text-muted-foreground font-heading">
                    Depends on: {activeSystem.dependsOn.map((d) => SYSTEMS.find((s) => s.id === d)?.emoji).join(" ")}
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-5 text-center"
              >
                <Power className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground font-heading">
                  Hover over a system to learn about it. Tap to knock it out.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cascade timeline */}
          {timeline.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-5"
            >
              <h4 className="font-heading font-semibold text-xs uppercase tracking-wider text-muted-foreground mb-3">
                ⏱️ Failure Timeline
              </h4>
              <div className="space-y-2">
                {timeline.map((event, i) => {
                  const system = SYSTEMS.find((s) => s.id === event.id);
                  return (
                    <motion.div
                      key={`${event.id}-${i}`}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span className="w-12 text-right text-muted-foreground font-mono font-medium shrink-0">
                        {event.time}
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                      <span className="text-foreground">
                        {system?.emoji} {event.label} goes down
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Fun fact callout */}
          <div className="glass-card p-4 border-primary/20">
            <p className="text-[11px] text-muted-foreground leading-relaxed font-heading">
              💡 <span className="font-semibold text-foreground">Real fact:</span>{" "}
              {data.infrastructure.notableEngineering || `${data.cityName}'s infrastructure serves ${data.population} people daily.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatIfSimulator;

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, TrendingUp, TrendingDown, Minus, Eye, Network, FileText,
  Activity, Zap, Home, Cloud, Heart, Shield, Building, Users, Leaf,
  GraduationCap, Landmark, Cpu, RefreshCw, ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { CityData } from "@/lib/cityLookup";

/* ── Types ── */
interface DataPoint {
  id: string;
  domain: string;
  label: string;
  value: string;
  unit: string;
  trend: "up" | "down" | "stable";
  trendPercent: number;
  insight: string;
  severity: "low" | "medium" | "high" | "critical";
}

interface Connection {
  from: string;
  to: string;
  relationship: string;
  strength: number;
}

interface IntelligenceData {
  dataPoints: DataPoint[];
  connections: Connection[];
  narrative: string;
  threatLevel: "stable" | "watch" | "elevated" | "critical";
  keyInsight: string;
}

/* ── Domain config ── */
const domainIcons: Record<string, React.ReactNode> = {
  economy: <TrendingUp className="w-4 h-4" />,
  housing: <Home className="w-4 h-4" />,
  energy: <Zap className="w-4 h-4" />,
  weather: <Cloud className="w-4 h-4" />,
  health: <Heart className="w-4 h-4" />,
  crime: <Shield className="w-4 h-4" />,
  infrastructure: <Building className="w-4 h-4" />,
  demographics: <Users className="w-4 h-4" />,
  environment: <Leaf className="w-4 h-4" />,
  education: <GraduationCap className="w-4 h-4" />,
  politics: <Landmark className="w-4 h-4" />,
  technology: <Cpu className="w-4 h-4" />,
};

const domainColors: Record<string, string> = {
  economy: "hsl(48, 96%, 53%)",
  housing: "hsl(25, 85%, 55%)",
  energy: "hsl(45, 93%, 47%)",
  weather: "hsl(200, 80%, 55%)",
  health: "hsl(340, 75%, 55%)",
  crime: "hsl(0, 75%, 55%)",
  infrastructure: "hsl(220, 60%, 55%)",
  demographics: "hsl(280, 60%, 55%)",
  environment: "hsl(150, 60%, 45%)",
  education: "hsl(210, 70%, 55%)",
  politics: "hsl(30, 60%, 50%)",
  technology: "hsl(180, 60%, 45%)",
};

const severityColors: Record<string, string> = {
  low: "hsl(150, 60%, 45%)",
  medium: "hsl(48, 96%, 53%)",
  high: "hsl(25, 90%, 55%)",
  critical: "hsl(0, 75%, 55%)",
};

const threatConfig: Record<string, { color: string; bg: string; label: string }> = {
  stable: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "STABLE" },
  watch: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "WATCH" },
  elevated: { color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20", label: "ELEVATED" },
  critical: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", label: "CRITICAL" },
};

/* ── Force-directed graph layout ── */
const useForceLayout = (nodes: DataPoint[], edges: Connection[], width: number, height: number) => {
  return useMemo(() => {
    if (!nodes.length) return { positions: new Map<string, { x: number; y: number }>() };

    const positions = new Map<string, { x: number; y: number }>();
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.35;

    // Place nodes in a radial layout grouped by domain
    const domains = [...new Set(nodes.map((n) => n.domain))];
    nodes.forEach((node, i) => {
      const domainIndex = domains.indexOf(node.domain);
      const angle = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
      // Add slight jitter based on domain to cluster same-domain nodes
      const domainOffset = (domainIndex / domains.length) * 0.3;
      const r = radius * (0.8 + domainOffset * 0.4);
      positions.set(node.id, {
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    });

    // Simple force simulation (5 iterations)
    for (let iter = 0; iter < 5; iter++) {
      // Repulsion between all nodes
      nodes.forEach((a, i) => {
        nodes.forEach((b, j) => {
          if (i >= j) return;
          const posA = positions.get(a.id)!;
          const posB = positions.get(b.id)!;
          const dx = posB.x - posA.x;
          const dy = posB.y - posA.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 80) {
            const force = (80 - dist) * 0.3;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            posA.x -= fx;
            posA.y -= fy;
            posB.x += fx;
            posB.y += fy;
          }
        });
      });

      // Attraction along edges
      edges.forEach((edge) => {
        const posA = positions.get(edge.from);
        const posB = positions.get(edge.to);
        if (!posA || !posB) return;
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist > 150) {
          const force = (dist - 150) * 0.02;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          posA.x += fx;
          posA.y += fy;
          posB.x -= fx;
          posB.y -= fy;
        }
      });

      // Keep nodes within bounds
      nodes.forEach((node) => {
        const pos = positions.get(node.id)!;
        pos.x = Math.max(40, Math.min(width - 40, pos.x));
        pos.y = Math.max(40, Math.min(height - 40, pos.y));
      });
    }

    return { positions };
  }, [nodes, edges, width, height]);
};

/* ── Main component ── */
const CityIntelligence = ({ data }: { data: CityData }) => {
  const [intel, setIntel] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"graph" | "briefing">("graph");
  const [animatedIn, setAnimatedIn] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const fetchIntelligence = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke("city-intelligence", {
        body: { cityName: data.cityName, state: data.state, population: data.population },
      });
      if (fnError) throw new Error(fnError.message);
      if (!result?.success) throw new Error(result?.error || "Failed to generate intelligence");
      setIntel(result.data);
      setAnimatedIn(false);
      setTimeout(() => setAnimatedIn(true), 100);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [data.cityName, data.state, data.population]);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  const graphWidth = 600;
  const graphHeight = 500;
  const { positions } = useForceLayout(intel?.dataPoints || [], intel?.connections || [], graphWidth, graphHeight);

  const focusNode = selectedNode || hoveredNode;
  const connectedNodes = useMemo(() => {
    if (!focusNode || !intel) return new Set<string>();
    const set = new Set<string>();
    intel.connections.forEach((c) => {
      if (c.from === focusNode) set.add(c.to);
      if (c.to === focusNode) set.add(c.from);
    });
    return set;
  }, [focusNode, intel]);

  const focusConnections = useMemo(() => {
    if (!focusNode || !intel) return [];
    return intel.connections.filter((c) => c.from === focusNode || c.to === focusNode);
  }, [focusNode, intel]);

  const selectedPoint = intel?.dataPoints.find((d) => d.id === selectedNode);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Network className="w-10 h-10 text-primary" />
        </motion.div>
        <div className="space-y-2 text-center">
          <p className="text-sm font-heading font-semibold text-foreground">Building Intelligence Ontology</p>
          <p className="text-xs text-muted-foreground">Connecting data points across {data.cityName}…</p>
        </div>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary"
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.2, delay: i * 0.15, repeat: Infinity }}
            />
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
        <button
          onClick={fetchIntelligence}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-heading font-medium"
        >
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );
  }

  if (!intel) return null;

  const threat = threatConfig[intel.threatLevel] || threatConfig.stable;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h3 className="text-2xl md:text-3xl font-heading font-bold flex items-center gap-3">
            <Eye className="w-7 h-7 text-primary" />
            City Intelligence
          </h3>
          <p className="text-muted-foreground text-sm max-w-lg leading-relaxed">
            An ontology of {intel.dataPoints.length} data points across {new Set(intel.dataPoints.map((d) => d.domain)).size} domains,
            revealing {intel.connections.length} hidden connections in {data.cityName}.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full border text-xs font-heading font-bold tracking-wider ${threat.bg} ${threat.color}`}>
            ● {threat.label}
          </div>
          <button
            onClick={fetchIntelligence}
            className="p-2 rounded-full bg-card border border-border hover:bg-muted transition-colors"
            title="Regenerate"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Key Insight Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-5 border-primary/20 bg-primary/5"
      >
        <div className="flex items-start gap-3">
          <Activity className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-heading uppercase tracking-widest text-primary mb-1">Key Intelligence Finding</p>
            <p className="text-sm text-foreground leading-relaxed font-medium">{intel.keyInsight}</p>
          </div>
        </div>
      </motion.div>

      {/* View toggle */}
      <div className="flex gap-1 bg-muted/50 rounded-lg p-1 w-fit">
        {([
          { key: "graph", icon: <Network className="w-3.5 h-3.5" />, label: "Network Graph" },
          { key: "briefing", icon: <FileText className="w-3.5 h-3.5" />, label: "Intelligence Briefing" },
        ] as const).map((view) => (
          <button
            key={view.key}
            onClick={() => setActiveView(view.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-heading font-medium transition-all ${
              activeView === view.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {view.icon} {view.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeView === "graph" ? (
          <motion.div
            key="graph"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid lg:grid-cols-[1fr_340px] gap-6"
          >
            {/* SVG Network Graph */}
            <div className="glass-card p-4 overflow-hidden relative">
              <svg
                ref={svgRef}
                viewBox={`0 0 ${graphWidth} ${graphHeight}`}
                className="w-full"
                style={{ minHeight: 400 }}
              >
                {/* Grid background */}
                <defs>
                  <pattern id="intel-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="hsl(var(--border))" strokeWidth="0.3" opacity="0.3" />
                  </pattern>
                </defs>
                <rect width={graphWidth} height={graphHeight} fill="url(#intel-grid)" />

                {/* Connections */}
                {intel.connections.map((conn, i) => {
                  const from = positions.get(conn.from);
                  const to = positions.get(conn.to);
                  if (!from || !to) return null;

                  const isFocused = focusNode && (conn.from === focusNode || conn.to === focusNode);
                  const isDimmed = focusNode && !isFocused;

                  return (
                    <motion.line
                      key={`${conn.from}-${conn.to}-${i}`}
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={isFocused ? "hsl(var(--primary))" : "hsl(var(--border))"}
                      strokeWidth={isFocused ? conn.strength * 0.6 : 1}
                      opacity={isDimmed ? 0.08 : isFocused ? 0.8 : 0.2}
                      strokeDasharray={conn.strength < 3 ? "4 3" : "none"}
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{
                        pathLength: 1,
                        opacity: isDimmed ? 0.08 : isFocused ? 0.8 : 0.2,
                      }}
                      transition={{ duration: 0.8, delay: i * 0.05 }}
                    />
                  );
                })}

                {/* Data point nodes */}
                {intel.dataPoints.map((point, i) => {
                  const pos = positions.get(point.id);
                  if (!pos) return null;

                  const isSelected = selectedNode === point.id;
                  const isConnected = connectedNodes.has(point.id);
                  const isFocusNode = focusNode === point.id;
                  const isDimmed = focusNode && !isFocusNode && !isConnected;
                  const color = domainColors[point.domain] || "hsl(var(--primary))";
                  const nodeRadius = isFocusNode ? 22 : isConnected ? 18 : 16;

                  return (
                    <g
                      key={point.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedNode(selectedNode === point.id ? null : point.id)}
                      onMouseEnter={() => setHoveredNode(point.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Severity pulse for high/critical */}
                      {(point.severity === "high" || point.severity === "critical") && (
                        <motion.circle
                          cx={pos.x}
                          cy={pos.y}
                          r={nodeRadius + 6}
                          fill="none"
                          stroke={severityColors[point.severity]}
                          strokeWidth="1"
                          initial={{ r: nodeRadius, opacity: 0.6 }}
                          animate={{ r: nodeRadius + 10, opacity: 0 }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      )}

                      {/* Node circle */}
                      <motion.circle
                        cx={pos.x}
                        cy={pos.y}
                        r={nodeRadius}
                        fill={isSelected ? color : "hsl(var(--card))"}
                        stroke={color}
                        strokeWidth={isFocusNode ? 3 : 2}
                        opacity={isDimmed ? 0.15 : 1}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: isDimmed ? 0.15 : 1 }}
                        transition={{ delay: i * 0.04, type: "spring", stiffness: 300 }}
                      />

                      {/* Domain emoji */}
                      <text
                        x={pos.x}
                        y={pos.y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="13"
                        opacity={isDimmed ? 0.15 : 1}
                        className="pointer-events-none select-none"
                      >
                        {point.domain === "economy" ? "📈" :
                         point.domain === "housing" ? "🏠" :
                         point.domain === "energy" ? "⚡" :
                         point.domain === "weather" ? "🌤️" :
                         point.domain === "health" ? "❤️" :
                         point.domain === "crime" ? "🛡️" :
                         point.domain === "infrastructure" ? "🏗️" :
                         point.domain === "demographics" ? "👥" :
                         point.domain === "environment" ? "🌿" :
                         point.domain === "education" ? "🎓" :
                         point.domain === "politics" ? "🏛️" :
                         point.domain === "technology" ? "💻" : "📊"}
                      </text>

                      {/* Label */}
                      <text
                        x={pos.x}
                        y={pos.y + nodeRadius + 12}
                        textAnchor="middle"
                        fontSize="7"
                        fontWeight="600"
                        fill="hsl(var(--muted-foreground))"
                        opacity={isDimmed ? 0.1 : 0.8}
                        className="pointer-events-none select-none font-heading"
                      >
                        {point.label.length > 18 ? point.label.slice(0, 16) + "…" : point.label}
                      </text>

                      {/* Trend indicator */}
                      {!isDimmed && (
                        <text
                          x={pos.x + nodeRadius - 2}
                          y={pos.y - nodeRadius + 5}
                          fontSize="9"
                          className="pointer-events-none select-none"
                        >
                          {point.trend === "up" ? "↑" : point.trend === "down" ? "↓" : "→"}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Legend */}
              <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                {[...new Set(intel.dataPoints.map((d) => d.domain))].slice(0, 6).map((domain) => (
                  <span key={domain} className="flex items-center gap-1 text-[9px] text-muted-foreground font-heading">
                    <span className="w-2 h-2 rounded-full" style={{ background: domainColors[domain] }} />
                    {domain}
                  </span>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div className="space-y-4">
              {/* Selected node detail */}
              <AnimatePresence mode="wait">
                {selectedPoint ? (
                  <motion.div
                    key={selectedPoint.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="glass-card p-5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ background: domainColors[selectedPoint.domain] }}
                        />
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-heading font-bold">
                          {selectedPoint.domain}
                        </span>
                      </div>
                      <span
                        className="text-[10px] px-2 py-0.5 rounded-full font-heading font-bold uppercase tracking-wider"
                        style={{
                          color: severityColors[selectedPoint.severity],
                          background: severityColors[selectedPoint.severity] + "15",
                        }}
                      >
                        {selectedPoint.severity}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-sm">{selectedPoint.label}</h4>

                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-heading font-bold text-foreground">
                        {selectedPoint.value}
                      </span>
                      <span className="text-xs text-muted-foreground">{selectedPoint.unit}</span>
                      <span className={`flex items-center gap-0.5 text-xs font-heading font-semibold ml-auto ${
                        selectedPoint.trend === "up" ? "text-emerald-400" : selectedPoint.trend === "down" ? "text-red-400" : "text-muted-foreground"
                      }`}>
                        {selectedPoint.trend === "up" ? <TrendingUp className="w-3 h-3" /> :
                         selectedPoint.trend === "down" ? <TrendingDown className="w-3 h-3" /> :
                         <Minus className="w-3 h-3" />}
                        {selectedPoint.trendPercent}%
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">{selectedPoint.insight}</p>

                    {/* Connections from this node */}
                    {focusConnections.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-border/50">
                        <p className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground font-bold">
                          Connected to
                        </p>
                        {focusConnections.map((conn, i) => {
                          const otherId = conn.from === selectedPoint.id ? conn.to : conn.from;
                          const other = intel.dataPoints.find((d) => d.id === otherId);
                          if (!other) return null;
                          return (
                            <motion.button
                              key={`${conn.from}-${conn.to}`}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={() => setSelectedNode(otherId)}
                              className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                            >
                              <div className="flex items-center gap-2 text-xs">
                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: domainColors[other.domain] }} />
                                <span className="font-heading font-medium text-foreground">{other.label}</span>
                                <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                              <p className="text-[10px] text-muted-foreground mt-1 pl-4 leading-relaxed">
                                {conn.relationship}
                              </p>
                              <div className="flex gap-0.5 mt-1 pl-4">
                                {Array.from({ length: 5 }).map((_, j) => (
                                  <span
                                    key={j}
                                    className="w-1 h-1 rounded-full"
                                    style={{
                                      background: j < conn.strength ? "hsl(var(--primary))" : "hsl(var(--muted))",
                                    }}
                                  />
                                ))}
                              </div>
                            </motion.button>
                          );
                        })}
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
                    <Network className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                    <p className="text-xs text-muted-foreground font-heading">
                      Select a node to explore its connections and see how data points influence each other.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Data points grid */}
              <div className="glass-card p-4">
                <h4 className="text-[10px] font-heading uppercase tracking-widest text-muted-foreground font-bold mb-3">
                  All Data Points
                </h4>
                <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                  {intel.dataPoints.map((point) => (
                    <button
                      key={point.id}
                      onClick={() => setSelectedNode(selectedNode === point.id ? null : point.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all text-xs ${
                        selectedNode === point.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: domainColors[point.domain] }}
                      />
                      <span className="font-heading font-medium text-foreground truncate flex-1">{point.label}</span>
                      <span className="text-muted-foreground font-mono text-[10px] shrink-0">
                        {point.value}
                      </span>
                      <span className={`text-[10px] ${
                        point.trend === "up" ? "text-emerald-400" : point.trend === "down" ? "text-red-400" : "text-muted-foreground"
                      }`}>
                        {point.trend === "up" ? "↑" : point.trend === "down" ? "↓" : "→"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── Intelligence Briefing ── */
          <motion.div
            key="briefing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="glass-card p-8 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border/50">
                <FileText className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-[10px] font-heading uppercase tracking-widest text-primary font-bold">
                    CLASSIFIED — {data.cityName.toUpperCase()} INTELLIGENCE ASSESSMENT
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                    Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} •{" "}
                    {intel.dataPoints.length} data sources • {intel.connections.length} connections identified
                  </p>
                </div>
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                {intel.narrative.split("\n").map((paragraph, i) => {
                  if (!paragraph.trim()) return null;
                  const isHeader = paragraph.includes(":") && paragraph.length < 60 && paragraph === paragraph.toUpperCase();
                  if (isHeader || paragraph.match(/^(INTELLIGENCE|PRIMARY|SECONDARY|OUTLOOK|FINDING|ASSESSMENT)/)) {
                    return (
                      <motion.h4
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="text-xs font-heading uppercase tracking-widest text-primary font-bold mt-6 mb-2"
                      >
                        {paragraph}
                      </motion.h4>
                    );
                  }
                  return (
                    <motion.p
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.08 }}
                      className="text-sm text-muted-foreground leading-relaxed mb-3"
                    >
                      {paragraph}
                    </motion.p>
                  );
                })}
              </div>

              <div className={`mt-6 p-4 rounded-lg border ${threat.bg}`}>
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${threat.color}`} />
                  <span className={`text-xs font-heading font-bold ${threat.color}`}>
                    OVERALL ASSESSMENT: {threat.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{intel.keyInsight}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CityIntelligence;

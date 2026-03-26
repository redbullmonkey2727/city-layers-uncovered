import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

const layers = [
  { label: "Money & Governance", color: "hsl(var(--primary) / 0.1)", border: "hsl(var(--primary) / 0.6)", icon: "🏛️", detail: "Taxes, bonds, grants, and budgets fund it all. Political decisions shape every other layer.", svgColor: "var(--primary)", depth: 0 },
  { label: "Services & People", color: "hsl(var(--secondary) / 0.15)", border: "hsl(var(--secondary))", icon: "👥", detail: "Schools, hospitals, police, fire, parks — the services that make a city livable arrive after everything else.", svgColor: "var(--secondary)", depth: 1 },
  { label: "Buildings & Homes", color: "hsl(var(--muted-foreground) / 0.15)", border: "hsl(var(--muted-foreground))", icon: "🏠", detail: "From single-family homes to skyscrapers — each building depends on every layer below it being in place.", svgColor: "var(--muted-foreground)", depth: 2 },
  { label: "Telecom & Internet", color: "hsl(var(--infra-fiber) / 0.2)", border: "hsl(var(--infra-fiber))", icon: "🌐", detail: "Fiber optic cables, cell towers, and copper lines carry data at the speed of light.", svgColor: "var(--infra-fiber)", depth: 3 },
  { label: "Power & Gas", color: "hsl(var(--infra-power) / 0.2)", border: "hsl(var(--infra-power))", icon: "⚡", detail: "Substations, transformers, and conduits deliver electricity to every outlet.", svgColor: "var(--infra-power)", depth: 4 },
  { label: "Water & Sewer", color: "hsl(var(--infra-water) / 0.2)", border: "hsl(var(--infra-water))", icon: "💧", detail: "Clean water in, dirty water out. Thousands of miles of pipes run beneath every city.", svgColor: "var(--infra-water)", depth: 5 },
  { label: "Roads & Transit", color: "hsl(var(--infra-road) / 0.3)", border: "hsl(var(--infra-road))", icon: "🛣️", detail: "Streets, highways, bike lanes, and transit lines form the circulatory system.", svgColor: "var(--infra-road)", depth: 6 },
  { label: "Zoning & Planning", color: "hsl(var(--primary) / 0.15)", border: "hsl(var(--primary))", icon: "📐", detail: "Master plans and zoning codes determine what can be built where.", svgColor: "var(--primary)", depth: 7 },
];

/** Isometric layer-cake SVG showing city systems stacked */
const LayerCake = ({ hoveredIndex, exploded }: { hoveredIndex: number | null; exploded: boolean }) => {
  const layerH = 18;
  const gap = exploded ? 28 : 4;
  const offsetX = 40;
  const baseW = 280;
  const baseX = 60;

  return (
    <svg viewBox="0 0 400 380" className="w-full" style={{ maxHeight: 380 }}>
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Render layers bottom to top */}
      {[...layers].reverse().map((layer, ri) => {
        const i = layers.length - 1 - ri;
        const y = 320 - i * (layerH + gap);
        const isHovered = hoveredIndex === i;
        const dimmed = hoveredIndex !== null && !isHovered;

        // Isometric parallelogram points
        const topLeft = `${baseX + offsetX * 0.3},${y}`;
        const topRight = `${baseX + baseW},${y}`;
        const bottomRight = `${baseX + baseW - offsetX * 0.3},${y + layerH}`;
        const bottomLeft = `${baseX},${y + layerH}`;

        // Side face
        const sideRight = `${baseX + baseW},${y + layerH * 0.6}`;
        const sideBottomRight = `${baseX + baseW - offsetX * 0.3},${y + layerH + layerH * 0.6}`;

        return (
          <motion.g
            key={layer.label}
            animate={{
              opacity: dimmed ? 0.25 : 1,
              x: isHovered && exploded ? 8 : 0,
            }}
            transition={{ duration: 0.3 }}
          >
            {/* Glow effect on hover */}
            {isHovered && (
              <motion.rect
                x={baseX - 5} y={y - 5} width={baseW + 10} height={layerH + 10} rx={4}
                fill={`hsl(${layer.svgColor} / 0.15)`}
                initial={{ opacity: 0 }} animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                filter="url(#glow)"
              />
            )}

            {/* Top face */}
            <polygon
              points={`${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`}
              fill={`hsl(${layer.svgColor} / ${isHovered ? 0.35 : 0.2})`}
              stroke={`hsl(${layer.svgColor} / ${isHovered ? 0.8 : 0.4})`}
              strokeWidth={isHovered ? 1.5 : 0.5}
            />

            {/* Side face (depth illusion) */}
            <polygon
              points={`${topRight} ${sideRight} ${sideBottomRight} ${bottomRight}`}
              fill={`hsl(${layer.svgColor} / ${isHovered ? 0.25 : 0.1})`}
              stroke={`hsl(${layer.svgColor} / 0.2)`}
              strokeWidth={0.5}
            />

            {/* Label */}
            <text
              x={baseX + baseW / 2}
              y={y + layerH / 2 + 4}
              textAnchor="middle"
              fontSize={isHovered ? "9" : "8"}
              fontFamily="var(--font-heading)"
              fontWeight={isHovered ? "700" : "500"}
              fill={`hsl(${layer.svgColor} / ${isHovered ? 1 : 0.7})`}
            >
              {layer.icon} {layer.label}
            </text>

            {/* Animated data flow lines when hovered */}
            {isHovered && (
              <>
                <motion.line
                  x1={baseX + 20} y1={y + layerH / 2}
                  x2={baseX + baseW - 20} y2={y + layerH / 2}
                  stroke={`hsl(${layer.svgColor} / 0.4)`}
                  strokeWidth="1"
                  strokeDasharray="4 3"
                  animate={{ strokeDashoffset: [0, -14] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </>
            )}
          </motion.g>
        );
      })}

      {/* Connection lines between layers when exploded */}
      {exploded && layers.slice(0, -1).map((_, i) => {
        const y1 = 320 - i * (layerH + gap);
        const y2 = 320 - (i + 1) * (layerH + gap) + layerH;
        return (
          <motion.line
            key={`conn-${i}`}
            x1={baseX + baseW / 2} y1={y1}
            x2={baseX + baseW / 2} y2={y2}
            stroke="hsl(var(--primary) / 0.15)"
            strokeWidth="1"
            strokeDasharray="3 3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5, strokeDashoffset: [0, -12] }}
            transition={{ opacity: { delay: 0.3 }, strokeDashoffset: { duration: 2, repeat: Infinity, ease: "linear" } }}
          />
        );
      })}
    </svg>
  );
};

const BigIdea = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [exploded, setExploded] = useState(false);

  return (
    <SectionWrapper id="big-idea" title="A City Is a Layered Machine" subtitle="Think of a city like a living organism — or a stack of invisible systems piled on top of each other. Remove any single layer and the whole thing starts to fail.">
      <div className="grid md:grid-cols-2 gap-12 items-start">
        {/* Layer stack - interactive list */}
        <div ref={ref} className="flex flex-col gap-2">
          {layers.map((layer, i) => (
            <div key={layer.label}>
              <motion.div
                className="relative rounded-lg px-5 py-3 font-heading font-medium text-sm md:text-base cursor-pointer select-none flex items-center gap-3"
                style={{
                  backgroundColor: hoveredIndex === i ? layer.border.replace(")", " / 0.25)").replace("hsl(", "hsl(") : layer.color,
                  borderLeft: `3px solid ${layer.border}`,
                }}
                initial={{ opacity: 0, x: -40 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                whileHover={{ x: 8 }}
              >
                <span className="text-lg">{layer.icon}</span>
                <span className="flex-1">{layer.label}</span>
                <motion.span
                  className="text-xs text-muted-foreground"
                  animate={{ rotate: expandedIndex === i ? 180 : 0 }}
                >
                  ▼
                </motion.span>
              </motion.div>
              <AnimatePresence>
                {expandedIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-8 mt-1 mb-2 p-3 rounded-lg bg-card/80 border border-border/50 text-sm text-muted-foreground leading-relaxed">
                      {layer.detail}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* 3D isometric layer cake visualization */}
        <div className="space-y-4">
          <div className="glass-card p-4 overflow-hidden">
            <LayerCake hoveredIndex={hoveredIndex} exploded={exploded} />
          </div>

          {/* Explode toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExploded(!exploded)}
              className={`px-4 py-2 rounded-lg text-sm font-heading font-medium transition-all ${
                exploded
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "glass-card hover:bg-muted"
              }`}
            >
              {exploded ? "🔍 Exploded View ON" : "🔍 Explode Layers"}
            </button>
            <p className="text-xs text-muted-foreground">
              Hover a layer to highlight it
            </p>
          </div>

          {/* Interactive stat callouts */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "6+", label: "Utility layers", sub: "under every street" },
              { value: "50+", label: "Agencies", sub: "coordinating daily" },
              { value: "24/7", label: "Monitoring", sub: "never stops" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="glass-card p-3 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.8 + i * 0.15 }}
              >
                <span className="text-xl font-heading font-bold text-primary block">{stat.value}</span>
                <span className="text-[10px] font-heading uppercase tracking-wider text-foreground">{stat.label}</span>
                <span className="text-[9px] text-muted-foreground block">{stat.sub}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default BigIdea;

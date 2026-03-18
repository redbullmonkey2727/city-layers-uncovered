import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

const layers = [
  { label: "Zoning & Planning", color: "hsl(var(--primary) / 0.15)", border: "hsl(var(--primary))", icon: "📐", detail: "Master plans and zoning codes determine what can be built where — residential, commercial, industrial. Without this layer, cities would be chaotic." },
  { label: "Roads & Transit", color: "hsl(var(--infra-road) / 0.3)", border: "hsl(var(--infra-road))", icon: "🛣️", detail: "Streets, highways, bike lanes, and transit lines form the circulatory system. A city without roads is a city without life." },
  { label: "Water & Sewer", color: "hsl(var(--infra-water) / 0.2)", border: "hsl(var(--infra-water))", icon: "💧", detail: "Clean water in, dirty water out. Thousands of miles of pipes run beneath every city, installed over decades." },
  { label: "Power & Gas", color: "hsl(var(--infra-power) / 0.2)", border: "hsl(var(--infra-power))", icon: "⚡", detail: "Substations, transformers, and conduits deliver electricity to every outlet. Gas mains heat homes and power stoves." },
  { label: "Telecom & Internet", color: "hsl(var(--infra-fiber) / 0.2)", border: "hsl(var(--infra-fiber))", icon: "🌐", detail: "Fiber optic cables, cell towers, and copper lines carry data at the speed of light. The newest and most rapidly evolving layer." },
  { label: "Buildings & Homes", color: "hsl(var(--muted-foreground) / 0.15)", border: "hsl(var(--muted-foreground))", icon: "🏠", detail: "From single-family homes to skyscrapers — each building depends on every layer below it being in place." },
  { label: "Services & People", color: "hsl(var(--secondary) / 0.15)", border: "hsl(var(--secondary))", icon: "👥", detail: "Schools, hospitals, police, fire, parks — the services that make a city livable arrive after everything else." },
  { label: "Money & Governance", color: "hsl(var(--primary) / 0.1)", border: "hsl(var(--primary) / 0.6)", icon: "🏛️", detail: "Taxes, bonds, grants, and budgets fund it all. Political decisions shape every other layer." },
];

const BigIdea = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <SectionWrapper id="big-idea" title="A City Is a Layered Machine" subtitle="Think of a city like a living organism — or a stack of invisible systems piled on top of each other. Remove any single layer and the whole thing starts to fail.">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Layer stack */}
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

        {/* Explanation */}
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            Every city you've ever walked through sits on top of an <strong className="text-foreground">enormous invisible stack</strong> of coordinated systems.
          </p>
          <p>
            Beneath the streets: water mains, sewer pipes, storm drains, gas lines, electric cables, and fiber optics — installed in a precise order, maintained by different agencies, and mostly forgotten until something breaks.
          </p>
          <p>
            Above ground: roads, buildings, schools, hospitals, fire stations — each one dependent on the layers below it. <strong className="text-foreground">Nothing works alone.</strong>
          </p>

          {/* Interactive stat callouts */}
          <div className="grid grid-cols-3 gap-3 pt-2">
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

          <p className="text-primary font-medium">
            Click any layer to learn more, or scroll down to see it all come together.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default BigIdea;

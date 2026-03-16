import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

const dependencies = [
  { from: "Utilities", to: "Homes", description: "No homes without water, sewer, and power connections." },
  { from: "Roads", to: "Stores", description: "No businesses without access roads for customers and deliveries." },
  { from: "Population", to: "Schools", description: "Schools only get built when enough families move in." },
  { from: "Jobs", to: "Population", description: "People only move where they can earn a living." },
  { from: "Homes", to: "Tax Base", description: "Property taxes from homes fund everything else." },
];

const actors = [
  { label: "Homebuilders", icon: "🏠", desc: "Build houses and apartments on prepared lots." },
  { label: "Commercial Developers", icon: "🏢", desc: "Build offices, retail, and mixed-use projects." },
  { label: "Government", icon: "🏛️", desc: "Builds schools, fire stations, roads, and parks." },
  { label: "Utility Companies", icon: "⚡", desc: "Extend water, power, and gas to new areas." },
];

const DevelopmentPhase = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionWrapper
      id="buildings"
      stage={4}
      title="Buildings Go Up"
      subtitle="Once infrastructure is in the ground, different actors start building — each depending on pieces someone else already completed."
    >
      <div ref={ref} className="grid md:grid-cols-2 gap-10">
        {/* Who builds what */}
        <div>
          <h3 className="font-heading font-semibold text-lg mb-4 text-primary">Who Builds What</h3>
          <div className="grid grid-cols-2 gap-3">
            {actors.map((a, i) => (
              <motion.div
                key={a.label}
                className="glass-card p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <span className="text-2xl mb-2 block">{a.icon}</span>
                <span className="font-heading font-semibold text-sm block mb-1">{a.label}</span>
                <p className="text-xs text-muted-foreground">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dependencies */}
        <div>
          <h3 className="font-heading font-semibold text-lg mb-4 text-primary">Nothing Works Alone</h3>
          <div className="space-y-3">
            {dependencies.map((d, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-3 glass-card p-3"
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              >
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="px-2 py-1 rounded bg-primary/10 text-primary text-xs font-heading font-semibold">{d.from}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="px-2 py-1 rounded bg-secondary/10 text-secondary text-xs font-heading font-semibold">{d.to}</span>
                </div>
                <p className="text-xs text-muted-foreground hidden sm:block">{d.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default DevelopmentPhase;

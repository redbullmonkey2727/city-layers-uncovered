import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "./SectionWrapper";
import { fundingSources } from "@/data/cityData";

const FundingFlow = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <SectionWrapper
      id="funding"
      stage={6}
      title="Who Pays for All This?"
      subtitle="Cities cost billions to build and maintain. The money comes from a mix of public taxes, private investment, government grants, and debt. Here's how the pie roughly breaks down."
    >
      <div ref={ref} className="grid md:grid-cols-2 gap-10 items-start">
        {/* Bar chart */}
        <div className="space-y-3">
          {fundingSources.map((src, i) => (
            <motion.div
              key={src.id}
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-heading font-semibold text-sm">{src.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-heading font-medium ${
                    src.type === "public" ? "bg-secondary/15 text-secondary" : "bg-primary/15 text-primary"
                  }`}>
                    {src.type}
                  </span>
                  <span className="text-xs text-muted-foreground w-8 text-right">{src.percent}%</span>
                </div>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${src.type === "public" ? "bg-secondary" : "bg-primary"}`}
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${src.percent}%` } : {}}
                  transition={{ delay: 0.3 + i * 0.08, duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Descriptions */}
        <div className="space-y-4">
          {fundingSources.map((src) => (
            <div key={src.id} className="glass-card p-4">
              <h4 className="font-heading font-semibold text-sm mb-1">{src.label}</h4>
              <p className="text-xs text-muted-foreground mb-2">{src.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {src.examples.map((ex) => (
                  <span key={ex} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{ex}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default FundingFlow;

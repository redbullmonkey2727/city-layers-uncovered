import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

const layers = [
  { label: "Zoning & Planning", color: "hsl(var(--primary) / 0.15)", border: "hsl(var(--primary))" },
  { label: "Roads & Transit", color: "hsl(var(--infra-road) / 0.3)", border: "hsl(var(--infra-road))" },
  { label: "Water & Sewer", color: "hsl(var(--infra-water) / 0.2)", border: "hsl(var(--infra-water))" },
  { label: "Power & Gas", color: "hsl(var(--infra-power) / 0.2)", border: "hsl(var(--infra-power))" },
  { label: "Telecom & Internet", color: "hsl(var(--infra-fiber) / 0.2)", border: "hsl(var(--infra-fiber))" },
  { label: "Buildings & Homes", color: "hsl(var(--muted-foreground) / 0.15)", border: "hsl(var(--muted-foreground))" },
  { label: "Services & People", color: "hsl(var(--secondary) / 0.15)", border: "hsl(var(--secondary))" },
  { label: "Money & Governance", color: "hsl(var(--primary) / 0.1)", border: "hsl(var(--primary) / 0.6)" },
];

const BigIdea = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <SectionWrapper id="big-idea" title="A City Is a Layered Machine" subtitle="Think of a city like a living organism — or a stack of invisible systems piled on top of each other. Remove any single layer and the whole thing starts to fail.">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Layer stack */}
        <div ref={ref} className="flex flex-col gap-2">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.label}
              className="relative rounded-lg px-5 py-3 font-heading font-medium text-sm md:text-base"
              style={{ backgroundColor: layer.color, borderLeft: `3px solid ${layer.border}` }}
              initial={{ opacity: 0, x: -40 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {layer.label}
            </motion.div>
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
          <p className="text-primary font-medium">
            Scroll down to see how it all comes together, one layer at a time.
          </p>
        </div>
      </div>
    </SectionWrapper>
  );
};

export default BigIdea;

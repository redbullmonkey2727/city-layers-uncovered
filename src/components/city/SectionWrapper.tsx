import { useRef, ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface Props {
  id: string;
  children: ReactNode;
  className?: string;
  /** Stage number badge (optional) */
  stage?: number;
  title?: string;
  subtitle?: string;
}

/** Wraps a section with scroll-fade-in, anchor id, and optional stage header. */
const SectionWrapper = ({ id, children, className = "", stage, title, subtitle }: Props) => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} id={id} className={`section-padding relative ${className}`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        {(stage || title) && (
          <div className="mb-12 max-w-3xl">
            {stage && (
              <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold tracking-widest uppercase rounded-full bg-primary/10 text-primary font-heading">
                Stage {stage}
              </span>
            )}
            {title && <h2 className="text-3xl md:text-5xl font-bold font-heading mb-4">{title}</h2>}
            {subtitle && <p className="text-lg text-muted-foreground leading-relaxed">{subtitle}</p>}
          </div>
        )}
        {children}
      </motion.div>
    </section>
  );
};

export default SectionWrapper;

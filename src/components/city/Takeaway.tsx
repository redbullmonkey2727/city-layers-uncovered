import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const Takeaway = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="takeaway" className="section-padding relative overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <motion.p
          className="text-sm tracking-[0.3em] uppercase text-primary font-heading font-semibold mb-6"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          The Takeaway
        </motion.p>

        <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-8">
          Every normal place is actually an{" "}
          <span className="text-gradient">enormous systems accomplishment.</span>
        </h2>

        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            The next time you turn on a faucet, flush a toilet, flip a light switch, or drive down a road — remember that dozens of interconnected systems made that moment possible.
          </p>
          <p>
            Cities are one of humanity's greatest coordination achievements. They're built by thousands of people across decades, in layers so deep most of us never see them.
          </p>
          <p className="text-foreground font-medium">
            Most infrastructure is invisible until it breaks. Now you know what's really underneath.
          </p>
        </div>

        <motion.div
          className="mt-12 flex justify-center"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          <a
            href="#hero"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-sm font-heading font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            ↑ Back to the top
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Takeaway;

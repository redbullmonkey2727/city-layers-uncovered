import { motion } from "framer-motion";

/** Full-screen hero with animated city silhouette rising from empty land. */
const HeroSection = () => {
  const layerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.8 + i * 0.35, duration: 0.8, ease: "easeOut" as const },
    }),
  };

  return (
    <section id="hero" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-6">
      {/* Subtle gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />

      {/* Animated SVG city */}
      <div className="absolute bottom-0 left-0 right-0 h-[45vh] pointer-events-none">
        <svg viewBox="0 0 1200 400" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
          {/* Ground */}
          <motion.rect x="0" y="340" width="1200" height="60" fill="hsl(var(--muted))" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }} />

          {/* Underground pipes — shown as colored lines below ground */}
          <motion.g custom={0} variants={layerVariants} initial="hidden" animate="visible">
            <line x1="50" y1="365" x2="1150" y2="365" stroke="hsl(var(--infra-water))" strokeWidth="3" strokeDasharray="8 4" />
            <line x1="50" y1="375" x2="1150" y2="375" stroke="hsl(var(--infra-sewer))" strokeWidth="3" strokeDasharray="8 4" />
            <line x1="50" y1="385" x2="1150" y2="385" stroke="hsl(var(--infra-power))" strokeWidth="2" strokeDasharray="6 4" />
          </motion.g>

          {/* Road */}
          <motion.rect x="0" y="325" width="1200" height="18" rx="2" fill="hsl(var(--infra-road))" custom={1} variants={layerVariants} initial="hidden" animate="visible" />
          <motion.g custom={1} variants={layerVariants} initial="hidden" animate="visible">
            {[100, 250, 400, 550, 700, 850, 1000].map((x) => (
              <rect key={x} x={x} y="333" width="40" height="2" fill="hsl(var(--primary) / 0.5)" rx="1" />
            ))}
          </motion.g>

          {/* Small buildings */}
          <motion.g custom={2} variants={layerVariants} initial="hidden" animate="visible">
            <rect x="80" y="280" width="50" height="45" rx="3" fill="hsl(var(--muted-foreground) / 0.3)" />
            <rect x="160" y="290" width="40" height="35" rx="3" fill="hsl(var(--muted-foreground) / 0.25)" />
            <rect x="350" y="275" width="55" height="50" rx="3" fill="hsl(var(--muted-foreground) / 0.3)" />
            <rect x="500" y="295" width="35" height="30" rx="3" fill="hsl(var(--muted-foreground) / 0.2)" />
            <rect x="900" y="285" width="45" height="40" rx="3" fill="hsl(var(--muted-foreground) / 0.25)" />
          </motion.g>

          {/* Taller buildings */}
          <motion.g custom={3} variants={layerVariants} initial="hidden" animate="visible">
            <rect x="240" y="220" width="45" height="105" rx="3" fill="hsl(var(--muted-foreground) / 0.35)" />
            <rect x="440" y="200" width="55" height="125" rx="3" fill="hsl(var(--muted-foreground) / 0.4)" />
            <rect x="540" y="235" width="40" height="90" rx="3" fill="hsl(var(--muted-foreground) / 0.3)" />
            <rect x="680" y="195" width="60" height="130" rx="4" fill="hsl(var(--primary) / 0.15)" />
            <rect x="760" y="240" width="45" height="85" rx="3" fill="hsl(var(--muted-foreground) / 0.3)" />
            <rect x="1000" y="230" width="50" height="95" rx="3" fill="hsl(var(--muted-foreground) / 0.35)" />
          </motion.g>

          {/* Tallest / accent building */}
          <motion.g custom={4} variants={layerVariants} initial="hidden" animate="visible">
            <rect x="600" y="150" width="50" height="175" rx="4" fill="hsl(var(--primary) / 0.25)" />
            {/* Antenna */}
            <line x1="625" y1="150" x2="625" y2="125" stroke="hsl(var(--primary) / 0.5)" strokeWidth="2" />
            {/* Window glow dots */}
            {[165, 185, 205, 225, 245, 265, 285].map((y) => (
              <g key={y}>
                <rect x="610" y={y} width="6" height="6" rx="1" fill="hsl(var(--primary) / 0.4)" />
                <rect x="622" y={y} width="6" height="6" rx="1" fill="hsl(var(--primary) / 0.3)" />
                <rect x="634" y={y} width="6" height="6" rx="1" fill="hsl(var(--primary) / 0.4)" />
              </g>
            ))}
          </motion.g>

          {/* Trees */}
          <motion.g custom={3} variants={layerVariants} initial="hidden" animate="visible">
            {[130, 310, 470, 640, 830, 960, 1090].map((x) => (
              <g key={x}>
                <circle cx={x} cy="310" r="12" fill="hsl(160 40% 25% / 0.5)" />
                <rect x={x - 2} y="318" width="4" height="10" fill="hsl(30 30% 25% / 0.5)" />
              </g>
            ))}
          </motion.g>
        </svg>
      </div>

      {/* Text content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-[20vh]">
        <motion.p
          className="text-sm tracking-[0.3em] uppercase text-primary font-heading font-semibold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          An Interactive Visual Guide
        </motion.p>
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold leading-[1.05] mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
        >
          How a City<br />
          <span className="text-gradient">Gets Built</span>
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Cities aren't built all at once. They're layered systems of land, pipes,
          wires, roads, buildings, services, money, and time — assembled across
          decades by thousands of people you'll never meet.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <a
            href="#big-idea"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-heading font-semibold text-sm tracking-wide hover:brightness-110 transition-all glow-primary"
          >
            Start the Build ↓
          </a>
          <a
            href="#systems"
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full border border-border text-foreground font-heading font-semibold text-sm tracking-wide hover:bg-muted/50 transition-all"
          >
            Explore the Systems
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

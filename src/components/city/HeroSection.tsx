import { motion } from "framer-motion";
import CitySearch from "./CitySearch";

interface Props {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

/** Full-screen hero with search bar front and center. */
const HeroSection = ({ onSearch, isLoading }: Props) => {
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
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />

      {/* Animated SVG city */}
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] pointer-events-none opacity-60">
        <svg viewBox="0 0 1200 400" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
          <motion.rect x="0" y="340" width="1200" height="60" fill="hsl(var(--muted))" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 1 }} />
          <motion.g custom={0} variants={layerVariants} initial="hidden" animate="visible">
            <line x1="50" y1="365" x2="1150" y2="365" stroke="hsl(var(--infra-water))" strokeWidth="3" strokeDasharray="8 4" />
            <line x1="50" y1="375" x2="1150" y2="375" stroke="hsl(var(--infra-sewer))" strokeWidth="3" strokeDasharray="8 4" />
          </motion.g>
          <motion.rect x="0" y="325" width="1200" height="18" rx="2" fill="hsl(var(--infra-road))" custom={1} variants={layerVariants} initial="hidden" animate="visible" />
          <motion.g custom={2} variants={layerVariants} initial="hidden" animate="visible">
            <rect x="80" y="280" width="50" height="45" rx="3" fill="hsl(var(--muted-foreground) / 0.3)" />
            <rect x="160" y="290" width="40" height="35" rx="3" fill="hsl(var(--muted-foreground) / 0.25)" />
            <rect x="350" y="275" width="55" height="50" rx="3" fill="hsl(var(--muted-foreground) / 0.3)" />
            <rect x="900" y="285" width="45" height="40" rx="3" fill="hsl(var(--muted-foreground) / 0.25)" />
          </motion.g>
          <motion.g custom={3} variants={layerVariants} initial="hidden" animate="visible">
            <rect x="240" y="220" width="45" height="105" rx="3" fill="hsl(var(--muted-foreground) / 0.35)" />
            <rect x="440" y="200" width="55" height="125" rx="3" fill="hsl(var(--muted-foreground) / 0.4)" />
            <rect x="680" y="195" width="60" height="130" rx="4" fill="hsl(var(--primary) / 0.15)" />
            <rect x="1000" y="230" width="50" height="95" rx="3" fill="hsl(var(--muted-foreground) / 0.35)" />
          </motion.g>
          <motion.g custom={4} variants={layerVariants} initial="hidden" animate="visible">
            <rect x="600" y="150" width="50" height="175" rx="4" fill="hsl(var(--primary) / 0.25)" />
            {[165, 195, 225, 255, 285].map((y) => (
              <g key={y}>
                <rect x="610" y={y} width="6" height="6" rx="1" fill="hsl(var(--primary) / 0.4)" />
                <rect x="622" y={y} width="6" height="6" rx="1" fill="hsl(var(--primary) / 0.3)" />
                <rect x="634" y={y} width="6" height="6" rx="1" fill="hsl(var(--primary) / 0.4)" />
              </g>
            ))}
          </motion.g>
        </svg>
      </div>

      {/* Text content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-[15vh]">
        <motion.p
          className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-heading font-medium mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          A road trip companion by Jonny Foote
        </motion.p>
        <motion.h1
          className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold leading-[1.05] mb-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
        >
          Who Built<br />
          <span className="text-gradient">All This?</span>
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.8 }}
        >
          You're driving through a city you've never been to. Type its name below and discover who built it, why it's here, and what's really going on beneath the surface.
        </motion.p>

        <CitySearch onSearch={onSearch} isLoading={isLoading} />

        <motion.div
          className="mt-8 flex flex-col sm:flex-row gap-3 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <a
            href="#big-idea"
            className="text-sm text-muted-foreground hover:text-primary transition-colors font-heading"
          >
            Or explore how cities work ↓
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

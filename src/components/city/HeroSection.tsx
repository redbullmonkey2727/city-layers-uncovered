import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import CitySearch from "./CitySearch";
import RecentSearches from "./RecentSearches";
import { useMemo, useEffect, useState } from "react";
import { Eye } from "lucide-react";

interface Props {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

/** Floating orb for ambient background effect */
const FloatingOrb = ({ delay, x, y, size, color }: { delay: number; x: string; y: string; size: number; color: string }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{ left: x, top: y, width: size, height: size, background: color, filter: "blur(60px)" }}
    animate={{ y: [0, -30, 0], x: [0, 15, 0], scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
    transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    aria-hidden="true"
  />
);

/** Small floating particle */
const Particle = ({ i }: { i: number }) => {
  const props = useMemo(() => ({
    left: `${10 + Math.random() * 80}%`,
    top: `${20 + Math.random() * 60}%`,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 5,
    duration: 6 + Math.random() * 8,
  }), [i]);

  return (
    <motion.div
      className="absolute rounded-full bg-primary/40 pointer-events-none"
      style={{ left: props.left, top: props.top, width: props.size, height: props.size }}
      animate={{ y: [0, -60 - Math.random() * 40], opacity: [0, 0.8, 0] }}
      transition={{ duration: props.duration, repeat: Infinity, delay: props.delay, ease: "easeOut" }}
      aria-hidden="true"
    />
  );
};

const HeroSection = ({ onSearch, isLoading }: Props) => {
  const { user, subscription } = useAuth();
  const isPro = subscription.plan === "pro";
  const [viewCount, setViewCount] = useState<number | null>(null);

  useEffect(() => {
    supabase.rpc("increment_page_view" as any, { page_path: "/" }).then(({ data }) => {
      if (typeof data === "number") setViewCount(data);
    });
  }, []);

  const layerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.8 + i * 0.35, duration: 0.8, ease: "easeOut" as const },
    }),
  };

  return (
    <section id="hero" className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-6" aria-label="Hero — Search for a city">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" aria-hidden="true" />

      {/* Ambient orbs */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <FloatingOrb delay={0} x="10%" y="20%" size={300} color="hsl(38 95% 52% / 0.06)" />
        <FloatingOrb delay={2} x="70%" y="15%" size={250} color="hsl(185 55% 38% / 0.05)" />
        <FloatingOrb delay={4} x="50%" y="60%" size={200} color="hsl(270 65% 55% / 0.04)" />
      </div>

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {Array.from({ length: 15 }).map((_, i) => (
          <Particle key={i} i={i} />
        ))}
      </div>

      {/* Animated SVG city */}
      <div className="absolute bottom-0 left-0 right-0 h-[35vh] pointer-events-none opacity-50" aria-hidden="true">
        <svg viewBox="0 0 1200 400" className="w-full h-full" preserveAspectRatio="xMidYMax slice" role="img" aria-label="Animated city skyline">
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
            {[165, 195, 225, 255, 285].map((y, wi) => (
              <g key={y}>
                <motion.rect x="610" y={y} width="6" height="6" rx="1" fill="hsl(var(--primary) / 0.4)"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 3, repeat: Infinity, delay: wi * 0.5 }}
                />
                <motion.rect x="622" y={y} width="6" height="6" rx="1" fill="hsl(var(--primary) / 0.3)"
                  animate={{ opacity: [0.2, 0.7, 0.2] }}
                  transition={{ duration: 4, repeat: Infinity, delay: wi * 0.3 }}
                />
                <motion.rect x="634" y={y} width="6" height="6" rx="1" fill="hsl(var(--primary) / 0.4)"
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: wi * 0.7 }}
                />
              </g>
            ))}
          </motion.g>
          <motion.rect
            x={0} y="328" width="18" height="8" rx="3"
            fill="hsl(var(--primary) / 0.5)"
            animate={{ x: [0, 1200] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
          <motion.rect
            x={800} y="330" width="14" height="7" rx="3"
            fill="hsl(var(--secondary) / 0.4)"
            animate={{ x: [800, -200] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>

      {/* Text content */}
      <div className="relative z-10 text-center max-w-3xl mx-auto mb-[12vh]">
        <motion.p
          className="text-xs tracking-[0.3em] uppercase text-muted-foreground font-heading font-medium mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          A road trip companion by Jonny Foote
        </motion.p>
        <motion.h1
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-heading font-bold leading-[1.05] mb-5"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
        >
          Who Built<br />
          <span className="text-gradient">All This?</span>
        </motion.h1>
        <motion.p
          className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.8 }}
        >
          You're driving through a city you've never been to. Type its name and discover who built it, why it's here, and what's really going on beneath the surface.
        </motion.p>

        <CitySearch onSearch={onSearch} isLoading={isLoading} />
        <RecentSearches onSelect={onSearch} />

        <motion.div
          className="mt-8 flex flex-col items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {!user ? (
            <p className="text-sm text-muted-foreground">
              5 free lookups · <Link to="/sign-up" className="text-primary hover:underline font-medium">Sign up</Link> to save your cities
            </p>
          ) : !isPro ? (
            <Link to="/pricing">
              <Badge className="cursor-pointer bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 transition-colors font-heading text-xs">
                ✦ Upgrade to Pro for unlimited access
              </Badge>
            </Link>
          ) : (
            <Badge className="bg-primary/10 text-primary border-primary/20 font-heading text-xs">
              ✦ Pro — Unlimited lookups
            </Badge>
          )}
          <a
            href="#big-idea"
            className="text-sm text-muted-foreground hover:text-primary transition-colors font-heading group flex items-center gap-1"
          >
            Or explore how cities work <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;

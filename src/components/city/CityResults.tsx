import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { CityData, CityImages } from "@/lib/cityLookup";
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronLeft, ChevronRight, MapPin, Users, Calendar, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  data: CityData;
  images: CityImages;
  onClear: () => void;
  onSave?: () => void;
}

const CityResults = ({ data, images, onClear, onSave }: Props) => {
  const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="space-y-0">
      {/* ── Immersive Hero ── */}
      <div className="relative min-h-[70vh] flex items-end overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          {images.hero ? (
            <motion.img
              src={images.hero}
              alt={`${data.cityName} skyline`}
              className="w-full h-full object-cover"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.2 }}
            />
          ) : (
            <Skeleton className="w-full h-full rounded-none" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-12 pt-32">
          <motion.div {...fadeIn} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={onClear}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-heading uppercase tracking-widest"
              >
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
              {onSave && (
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-heading bg-background/50 backdrop-blur-sm border-border/50" onClick={onSave}>
                  <Bookmark className="w-3.5 h-3.5" /> Save City
                </Button>
              )}
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold leading-none mb-3">
              <span className="text-gradient">{data.cityName}</span>
            </h1>
            {data.state && (
              <p className="text-xl md:text-2xl text-muted-foreground font-heading">{data.state}</p>
            )}
            {data.nickname && (
              <p className="text-muted-foreground font-heading text-lg italic mt-1">"{data.nickname}"</p>
            )}

            <div className="flex flex-wrap items-center gap-5 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-primary" /> Founded {data.founded}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> {data.population}</span>
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-primary" /> {data.state}</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Summary Banner ── */}
      <motion.div
        {...fadeIn}
        transition={{ delay: 0.3 }}
        className="bg-card/50 backdrop-blur-sm border-y border-border/50 py-8"
      >
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto px-6 text-center italic">
          {data.summary}
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">
        {/* ── Why Here + Landmark Image ── */}
        <Section title="Why Here?" icon="📍" delay={0.1}>
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div>
              <p className="text-muted-foreground mb-5 leading-relaxed">{data.whyHere.originalSettlers}</p>
              <div className="space-y-2">
                {data.whyHere.reasons.map((r, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="flex items-center gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold font-heading">{i + 1}</span>
                    <span className="text-sm text-foreground/90">{r}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <CityImage src={images.landmark} alt={`${data.cityName} landmark`} />
          </div>
        </Section>

        {/* ── Who Built This ── */}
        <Section title="Who Built This?" icon="🏗️" delay={0.15}>
          <p className="text-muted-foreground mb-6 leading-relaxed">{data.whoBuiltThis.majorDevelopers}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {data.whoBuiltThis.keyFigures.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="glass-card p-5 hover:border-primary/30 transition-colors group"
              >
                <h4 className="font-heading font-semibold text-sm group-hover:text-primary transition-colors">{f.name}</h4>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{f.contribution}</p>
                <span className="text-[10px] text-primary/70 font-heading mt-3 inline-block uppercase tracking-wider">{f.era}</span>
              </motion.div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {data.whoBuiltThis.keyIndustries.map((ind, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-heading">{ind}</span>
            ))}
          </div>
        </Section>

        {/* ── Street Scene Image ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <CityImage src={images.street} alt={`${data.cityName} street scene`} aspectWide />
          <p className="text-center text-xs text-muted-foreground mt-3 font-heading uppercase tracking-wider">
            Street life in {data.cityName}
          </p>
        </motion.div>

        {/* ── What You're Seeing ── */}
        <Section title="What You're Seeing" icon="👀" delay={0.2}>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="glass-card p-5">
              <span className="text-xs uppercase tracking-wider text-primary font-heading font-semibold">Architecture</span>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{data.whatYoureSeeing.architecturalStyle}</p>
            </div>
            <div className="glass-card p-5">
              <span className="text-xs uppercase tracking-wider text-secondary font-heading font-semibold">Street Layout</span>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{data.whatYoureSeeing.streetLayout}</p>
            </div>
          </div>

          {data.whatYoureSeeing.neighborhoods.length > 0 && (
            <div className="mb-6">
              <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" /> Neighborhoods
              </h4>
              <NeighborhoodCarousel neighborhoods={data.whatYoureSeeing.neighborhoods} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {data.whatYoureSeeing.landmarks.map((l, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-heading"
              >
                {l}
              </motion.span>
            ))}
          </div>
        </Section>

        {/* ── Infrastructure ── */}
        <Section title="The Invisible Systems" icon="🔧" delay={0.25}>
          <div className="grid sm:grid-cols-2 gap-4">
            <InfraCard label="Water Source" value={data.infrastructure.waterSource} emoji="💧" />
            <InfraCard label="Power Grid" value={data.infrastructure.powerGrid} emoji="⚡" />
            <InfraCard label="Transport" value={data.infrastructure.transportNetwork} emoji="🚇" />
            <InfraCard label="Notable Engineering" value={data.infrastructure.notableEngineering} emoji="🏗️" />
          </div>
        </Section>

        {/* ── Aerial Image ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CityImage src={images.aerial} alt={`${data.cityName} aerial view`} aspectWide />
          <p className="text-center text-xs text-muted-foreground mt-3 font-heading uppercase tracking-wider">
            Aerial view of {data.cityName}
          </p>
        </motion.div>

        {/* ── Layers of Time (Interactive Timeline) ── */}
        <Section title="Layers of Time" icon="📅" delay={0.3}>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
            <div className="space-y-6">
              {data.layers.periods.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.1 }}
                  className="flex gap-5 items-start pl-0"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center z-10">
                    <span className="text-[10px] font-heading font-bold text-primary">{i + 1}</span>
                  </div>
                  <div className="flex-1 glass-card p-5 hover:border-primary/30 transition-colors">
                    <span className="text-xs font-heading font-semibold text-primary uppercase tracking-wider">{p.era}</span>
                    <p className="text-sm mt-2">{p.whatWasBuilt}</p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{p.whyItMatters}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Section>

        {/* ── Fun Facts ── */}
        <Section title="Things You Didn't Know" icon="💡" delay={0.35}>
          <div className="grid sm:grid-cols-2 gap-4">
            {data.funFacts.map((fact, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="glass-card p-5 flex items-start gap-3 hover:border-primary/30 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">{fact}</p>
              </motion.div>
            ))}
          </div>
        </Section>

        {/* ── Challenges ── */}
        <Section title="Current Challenges" icon="⚠️" delay={0.4}>
          <div className="glass-card p-6 border-destructive/20">
            <p className="text-muted-foreground leading-relaxed">{data.challenges}</p>
          </div>
        </Section>

        {/* Footer CTA */}
        <motion.div {...fadeIn} transition={{ delay: 0.5 }} className="text-center pt-8">
          <button
            onClick={onClear}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-primary text-primary-foreground font-heading font-semibold text-sm tracking-wide hover:brightness-110 transition-all glow-primary"
          >
            Look Up Another City
          </button>
        </motion.div>
      </div>
    </div>
  );
};

/* ── Helper components ── */

const Section = ({ title, icon, delay, children }: { title: string; icon: string; delay: number; children: React.ReactNode }) => (
  <motion.section
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="flex items-center gap-3 mb-6">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-2xl md:text-3xl font-heading font-bold">{title}</h2>
    </div>
    {children}
  </motion.section>
);

const CityImage = ({ src, alt, aspectWide }: { src?: string; alt: string; aspectWide?: boolean }) => (
  <div className={`relative rounded-xl overflow-hidden ${aspectWide ? "aspect-[21/9]" : "aspect-[4/3]"}`}>
    {src ? (
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      />
    ) : (
      <Skeleton className="w-full h-full rounded-xl" />
    )}
  </div>
);

const InfraCard = ({ label, value, emoji }: { label: string; value: string; emoji: string }) => (
  <div className="glass-card p-5 hover:border-primary/30 transition-colors">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">{emoji}</span>
      <span className="text-xs uppercase tracking-wider text-primary font-heading font-semibold">{label}</span>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">{value}</p>
  </div>
);

const NeighborhoodCarousel = ({ neighborhoods }: { neighborhoods: { name: string; character: string; era: string }[] }) => {
  const [current, setCurrent] = useState(0);
  const max = neighborhoods.length;

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-heading font-semibold">{neighborhoods[current].name}</h4>
              <span className="text-[10px] text-primary/70 font-heading uppercase tracking-wider">{neighborhoods[current].era}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{neighborhoods[current].character}</p>
            <div className="flex items-center gap-1 mt-4">
              {neighborhoods.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === current ? "bg-primary" : "bg-muted-foreground/30"}`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {max > 1 && (
        <>
          <button
            onClick={() => setCurrent((c) => (c - 1 + max) % max)}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrent((c) => (c + 1) % max)}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};

export default CityResults;

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import type { CityData, CityImages } from "@/lib/cityLookup";
import { Button } from "@/components/ui/button";
import { Bookmark, ChevronLeft, ChevronRight, MapPin, Users, Calendar, Sparkles, ChevronDown, X, ZoomIn, Share2, TrendingUp, ThermometerSun, Footprints, DollarSign, ArrowUp, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import MilestoneTimeline from "./MilestoneTimeline";
import WhatIfSimulator from "./WhatIfSimulator";
import CityIntelligence from "./CityIntelligence";
import CityImageComponent from "./CityImage";

interface Props {
  data: CityData;
  images: CityImages;
  onClear: () => void;
  onSave?: () => void;
}

/* ── Animated counter ── */
const AnimatedCounter = ({ value, duration = 2000 }: { value: string; duration?: number }) => {
  const [display, setDisplay] = useState("0");
  const numericMatch = value.match(/^([\d,]+)/);

  useEffect(() => {
    if (!numericMatch) { setDisplay(value); return; }
    const target = parseInt(numericMatch[1].replace(/,/g, ""));
    if (isNaN(target)) { setDisplay(value); return; }
    const suffix = value.slice(numericMatch[1].length);
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);
      setDisplay(current.toLocaleString() + suffix);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{display}</span>;
};

/* ── Interactive Score Ring with breakdown ── */
const ScoreRing = ({
  score, label, color, icon, factors, isExpanded, onToggle,
}: {
  score: number; label: string; color: string; icon: React.ReactNode;
  factors: { name: string; impact: number; direction: "positive" | "negative" }[];
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const circumference = 2 * Math.PI * 32;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onToggle}
        className={`relative w-20 h-20 group cursor-pointer transition-transform ${isExpanded ? "scale-110" : "hover:scale-105"}`}
      >
        <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
          <circle cx="36" cy="36" r="32" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
          <motion.circle
            cx="36" cy="36" r="32" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-heading font-bold">{score}</span>
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-card border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </button>
      <div className="flex items-center gap-1 text-xs text-muted-foreground font-heading">
        {icon}
        {label}
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden w-full max-w-[200px]"
          >
            <div className="space-y-1.5 pt-2 border-t border-border/50 mt-1">
              {factors.map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-1.5 text-[10px]"
                >
                  <span className={f.direction === "positive" ? "text-emerald-500" : "text-red-400"}>
                    {f.direction === "positive" ? "+" : "−"}{Math.abs(f.impact)}
                  </span>
                  <span className="text-muted-foreground truncate">{f.name}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CityRadar = ({ data }: { data: CityData }) => {
  const traits = [
    { label: "History", value: Math.min(data.layers.periods.length / 5, 1) },
    { label: "Culture", value: Math.min(data.whatYoureSeeing.neighborhoods.length / 4, 1) },
    { label: "Industry", value: Math.min(data.whoBuiltThis.keyIndustries.length / 5, 1) },
    { label: "Landmarks", value: Math.min(data.whatYoureSeeing.landmarks.length / 5, 1) },
    { label: "Infra", value: data.infrastructure.notableEngineering ? 0.8 : 0.4 },
    { label: "Green", value: data.funFacts.length > 3 ? 0.7 : 0.5 },
  ];
  const n = traits.length;
  const cx = 100, cy = 100, r = 70;
  const getPoint = (i: number, scale: number) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + Math.cos(angle) * r * scale, y: cy + Math.sin(angle) * r * scale };
  };
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const dataPoints = traits.map((t, i) => getPoint(i, t.value));
  const dataPath = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <svg viewBox="0 0 200 200" className="w-full max-w-[220px] mx-auto">
      {gridLevels.map((level) => {
        const points = Array.from({ length: n }).map((_, i) => getPoint(i, level));
        const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";
        return <path key={level} d={path} fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" />;
      })}
      {traits.map((_, i) => {
        const p = getPoint(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="hsl(var(--border))" strokeWidth="0.5" />;
      })}
      <motion.path
        d={dataPath}
        fill="hsl(var(--primary) / 0.15)"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        style={{ transformOrigin: "100px 100px" }}
      />
      {dataPoints.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(var(--primary))"
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.7 + i * 0.1 }}
        />
      ))}
      {traits.map((t, i) => {
        const p = getPoint(i, 1.22);
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fill="hsl(var(--muted-foreground))" fontSize="7" fontFamily="var(--font-heading)" fontWeight="500"
          >
            {t.label}
          </text>
        );
      })}
    </svg>
  );
};

/* ── Scroll-to-top button ── */
const ScrollToTop = () => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 hover:brightness-110 transition-all"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const CityResults = ({ data, images, onClear, onSave }: Props) => {
  const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [expandedTimeline, setExpandedTimeline] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "deep-dive" | "timeline" | "what-if" | "intel">("overview");
  const [expandedScore, setExpandedScore] = useState<string | null>(null);
  const { toast } = useToast();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  // Derived scores for visual widgets
  const walkScore = Math.min(95, Math.max(30, data.whatYoureSeeing.neighborhoods.length * 12 + 35));
  const historyScore = Math.min(98, data.layers.periods.length * 15 + 20);
  const infraScore = data.infrastructure.notableEngineering ? 82 : 55;

  const handleShare = async () => {
    const text = `Check out ${data.cityName}, ${data.state} — ${data.summary.slice(0, 100)}...`;
    if (navigator.share) {
      try { await navigator.share({ title: `${data.cityName} — City Layers`, text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard! 📋" });
    }
  };

  return (
    <div className="space-y-0">
      <ScrollToTop />

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-6 cursor-pointer"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightboxSrc(null)}
          >
            <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted">
              <X className="w-5 h-5" />
            </button>
            <motion.img
              src={lightboxSrc} alt="Fullscreen view"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Parallax Hero ── */}
      <div ref={heroRef} className="relative min-h-[75vh] flex items-end overflow-hidden">
        <motion.div className="absolute inset-0" style={{ scale: heroScale }}>
          {/* Prefer AI hero for dramatic effect, fall back to first Unsplash photo */}
          {images.aiHero ? (
            <motion.img
              src={images.aiHero}
              alt={`${data.cityName} skyline — AI generated`}
              width={1920} height={1080}
              className="w-full h-full object-cover cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              onClick={() => setLightboxSrc(images.aiHero!)}
            />
          ) : images.photos[0] ? (
            <motion.img
              src={images.photos[0].url}
              alt={images.photos[0].alt}
              width={1200} height={800}
              className="w-full h-full object-cover cursor-pointer"
              loading="eager"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              onClick={() => setLightboxSrc(images.photos[0].url)}
            />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background: `linear-gradient(135deg, hsl(var(--primary) / 0.3) 0%, hsl(var(--secondary) / 0.2) 100%)`,
              }}
            />
          )}
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />

        <motion.div className="relative z-10 w-full max-w-5xl mx-auto px-6 pb-14 pt-32" style={{ opacity: heroOpacity }}>
          <motion.div {...fadeIn} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={onClear}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors font-heading uppercase tracking-widest"
              >
                <ChevronLeft className="w-3 h-3" /> Back
              </button>
              <div className="flex gap-2">
                {onSave && (
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs font-heading bg-background/50 backdrop-blur-sm border-border/50" onClick={onSave}>
                    <Bookmark className="w-3.5 h-3.5" /> Save
                  </Button>
                )}
                <Button variant="outline" size="sm" className="gap-1.5 text-xs font-heading bg-background/50 backdrop-blur-sm border-border/50" onClick={handleShare}>
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
              </div>
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

            <div className="flex flex-wrap items-center gap-5 mt-6">
              <motion.span className="flex items-center gap-1.5 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <Calendar className="w-4 h-4 text-primary" /> Founded <span className="text-foreground font-semibold">{data.founded}</span>
              </motion.span>
              <motion.span className="flex items-center gap-1.5 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <Users className="w-4 h-4 text-primary" /> <span className="text-foreground font-semibold"><AnimatedCounter value={data.population} /></span>
              </motion.span>
              <motion.span className="flex items-center gap-1.5 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <MapPin className="w-4 h-4 text-primary" /> {data.state}
              </motion.span>
            </div>
          </motion.div>
        </motion.div>
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

      {/* ── Tab Navigation ── */}
      <div className="sticky top-14 z-30 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="max-w-5xl mx-auto px-6 flex gap-1">
          {(["overview", "deep-dive", "timeline", "what-if", "intel"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 md:px-5 py-3 text-xs md:text-sm font-heading font-medium transition-all border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "overview" ? "📊 Overview" : tab === "deep-dive" ? "🔍 Deep Dive" : tab === "timeline" ? "🕰️ Timeline" : tab === "what-if" ? "🎮 What If?" : "🔮 Intel"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-16 space-y-16">

        <AnimatePresence mode="wait">
          {activeTab === "overview" ? (
            <motion.div key="overview" className="space-y-16"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            >
              {/* ── Score Rings + Radar ── */}
              <div className="grid md:grid-cols-[1fr_280px] gap-6">
                <div className="space-y-6">
                  {/* Score rings */}
                  <div className="glass-card p-6">
                    <h4 className="font-heading font-semibold text-sm mb-5 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" /> City Scores
                    </h4>
                    <div className="flex justify-around">
                      <ScoreRing score={walkScore} label="Walkability" color="hsl(var(--secondary))" icon={<Footprints className="w-3 h-3" />}
                        isExpanded={expandedScore === "walk"} onToggle={() => setExpandedScore(expandedScore === "walk" ? null : "walk")}
                        factors={[
                          { name: `${data.whatYoureSeeing.neighborhoods.length} walkable neighborhoods`, impact: data.whatYoureSeeing.neighborhoods.length * 5, direction: "positive" },
                          { name: "Street grid layout", impact: data.whatYoureSeeing.streetLayout ? 12 : 0, direction: "positive" },
                          { name: `${data.whatYoureSeeing.landmarks.length} pedestrian landmarks`, impact: data.whatYoureSeeing.landmarks.length * 3, direction: "positive" },
                          { name: "Car-dependent infrastructure", impact: 15, direction: "negative" },
                        ]}
                      />
                      <ScoreRing score={historyScore} label="History" color="hsl(var(--primary))" icon={<Calendar className="w-3 h-3" />}
                        isExpanded={expandedScore === "history"} onToggle={() => setExpandedScore(expandedScore === "history" ? null : "history")}
                        factors={[
                          { name: `${data.layers.periods.length} documented eras`, impact: data.layers.periods.length * 10, direction: "positive" },
                          { name: `Founded ${data.founded}`, impact: 15, direction: "positive" },
                          { name: `${data.whoBuiltThis.keyFigures.length} key historical figures`, impact: data.whoBuiltThis.keyFigures.length * 5, direction: "positive" },
                        ]}
                      />
                      <ScoreRing score={infraScore} label="Infrastructure" color="hsl(var(--infra-water))" icon={<ThermometerSun className="w-3 h-3" />}
                        isExpanded={expandedScore === "infra"} onToggle={() => setExpandedScore(expandedScore === "infra" ? null : "infra")}
                        factors={[
                          { name: data.infrastructure.notableEngineering ? "Notable engineering feats" : "Standard engineering", impact: data.infrastructure.notableEngineering ? 25 : 10, direction: "positive" },
                          { name: "Water system coverage", impact: 15, direction: "positive" },
                          { name: "Aging infrastructure", impact: 20, direction: "negative" },
                          { name: "Transport network", impact: 12, direction: "positive" },
                        ]}
                      />
                    </div>
                  </div>

                  {/* Quick stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { icon: "🏗️", label: "Key Figures", value: String(data.whoBuiltThis.keyFigures.length) },
                      { icon: "🏘️", label: "Neighborhoods", value: String(data.whatYoureSeeing.neighborhoods.length) },
                      { icon: "🏛️", label: "Landmarks", value: String(data.whatYoureSeeing.landmarks.length) },
                      { icon: "📅", label: "Historical Eras", value: String(data.layers.periods.length) },
                      { icon: "🏭", label: "Industries", value: String(data.whoBuiltThis.keyIndustries.length) },
                      { icon: "💡", label: "Fun Facts", value: String(data.funFacts.length) },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        className="glass-card p-4 text-center hover:border-primary/30 transition-colors group"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 + i * 0.06 }}
                        whileHover={{ y: -2 }}
                      >
                        <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform">{stat.icon}</span>
                        <span className="text-xl font-heading font-bold text-primary"><AnimatedCounter value={stat.value} duration={1200} /></span>
                        <span className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider block mt-1">{stat.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-5">
                  <h4 className="font-heading font-semibold text-sm mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" /> City Profile
                  </h4>
                  <CityRadar data={data} />
                </div>
              </div>

              {/* ── Image Gallery ── */}
              <div>
                <h3 className="font-heading font-semibold text-sm mb-4 flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                  📷 City Views
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.photos.length > 0 ? (
                    images.photos.slice(0, 6).map((photo, i) => (
                      <motion.div
                        key={photo.id}
                        className="relative rounded-xl overflow-hidden group cursor-pointer"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        onClick={() => setLightboxSrc(photo.url)}
                      >
                        <CityImageComponent
                          photo={photo}
                          cityName={data.cityName}
                          aspectRatio="square"
                          size="thumb"
                          showCredit
                          className="rounded-xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ZoomIn className="w-3 h-3" />
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    Array.from({ length: 6 }).map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-xl" />
                    ))
                  )}
                </div>
              </div>

              {/* ── Fun Facts as cards ── */}
              <Section title="Things You Didn't Know" icon="💡" delay={0.2}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {data.funFacts.map((fact, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.08 }}
                      className="glass-card p-5 flex items-start gap-3 hover:border-primary/30 transition-all hover:-translate-y-0.5 duration-300"
                    >
                      <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{fact}</p>
                    </motion.div>
                  ))}
                </div>
              </Section>

              {/* ── Challenges ── */}
              <Section title="Current Challenges" icon="⚠️" delay={0.25}>
                <div className="glass-card p-6 border-destructive/20">
                  <p className="text-muted-foreground leading-relaxed">{data.challenges}</p>
                </div>
              </Section>
            </motion.div>
          ) : activeTab === "deep-dive" ? (
            <motion.div key="deep-dive" className="space-y-16"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            >
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
                          className="flex items-center gap-3 group"
                        >
                          <span className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold font-heading group-hover:bg-primary group-hover:text-primary-foreground transition-colors">{i + 1}</span>
                          <span className="text-sm text-foreground/90">{r}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                  <CityImageComponent photo={images.photos[1] || null} cityName={data.cityName} alt={`${data.cityName} landmark`} className="rounded-xl" onClick={() => images.photos[1] && setLightboxSrc(images.photos[1].url)} showCredit />
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
                      className="glass-card p-5 hover:border-primary/30 transition-all group hover:-translate-y-1 duration-300"
                    >
                      <h4 className="font-heading font-semibold text-sm group-hover:text-primary transition-colors">{f.name}</h4>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{f.contribution}</p>
                      <span className="text-[10px] text-primary/70 font-heading mt-3 inline-block uppercase tracking-wider">{f.era}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.whoBuiltThis.keyIndustries.map((ind, i) => (
                    <motion.span key={i} className="px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-heading hover:bg-secondary/20 transition-colors cursor-default"
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
                    >{ind}</motion.span>
                  ))}
                </div>
              </Section>

              {/* ── Street Scene Image ── */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <CityImageComponent photo={images.photos[2] || null} cityName={data.cityName} alt={`${data.cityName} street scene`} aspectRatio="wide" className="rounded-xl" onClick={() => images.photos[2] && setLightboxSrc(images.photos[2].url)} showCredit />
                <p className="text-center text-xs text-muted-foreground mt-3 font-heading uppercase tracking-wider">
                  Street life in {data.cityName}
                </p>
              </motion.div>

              {/* ── What You're Seeing ── */}
              <Section title="What You're Seeing" icon="👀" delay={0.2}>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="glass-card p-5 hover:border-primary/30 transition-colors">
                    <span className="text-xs uppercase tracking-wider text-primary font-heading font-semibold">Architecture</span>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{data.whatYoureSeeing.architecturalStyle}</p>
                  </div>
                  <div className="glass-card p-5 hover:border-secondary/30 transition-colors">
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
                      className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-heading hover:bg-primary/20 transition-colors cursor-default"
                    >
                      {l}
                    </motion.span>
                  ))}
                </div>
              </Section>

              {/* ── Infrastructure ── */}
              <Section title="The Invisible Systems" icon="🔧" delay={0.25}>
                <InfraVisual data={data} />
              </Section>

              {/* ── Aerial Image ── */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <CityImageComponent photo={images.photos[3] || null} cityName={data.cityName} alt={`${data.cityName} aerial view`} aspectRatio="wide" className="rounded-xl" onClick={() => images.photos[3] && setLightboxSrc(images.photos[3].url)} showCredit />
                <p className="text-center text-xs text-muted-foreground mt-3 font-heading uppercase tracking-wider">
                  Aerial view of {data.cityName}
                </p>
              </motion.div>

              {/* ── Layers of Time ── */}
              <Section title="Layers of Time" icon="📅" delay={0.3}>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />
                  <div className="space-y-4">
                    {data.layers.periods.map((p, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 + i * 0.1 }}
                        className="flex gap-5 items-start pl-0"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center z-10 cursor-pointer hover:bg-primary/30 transition-colors"
                          onClick={() => setExpandedTimeline(expandedTimeline === i ? null : i)}
                        >
                          <span className="text-[10px] font-heading font-bold text-primary">{i + 1}</span>
                        </div>
                        <div className="flex-1">
                          <button
                            className="w-full text-left glass-card p-5 hover:border-primary/30 transition-all group"
                            onClick={() => setExpandedTimeline(expandedTimeline === i ? null : i)}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-heading font-semibold text-primary uppercase tracking-wider">{p.era}</span>
                              <motion.div animate={{ rotate: expandedTimeline === i ? 180 : 0 }}>
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              </motion.div>
                            </div>
                            <p className="text-sm mt-2 text-foreground">{p.whatWasBuilt}</p>
                            <AnimatePresence>
                              {expandedTimeline === i && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="pt-3 mt-3 border-t border-border/50">
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-heading">Why it matters</span>
                                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{p.whyItMatters}</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Section>
            </motion.div>
          ) : activeTab === "timeline" ? (
            <motion.div key="timeline" className="space-y-8"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">
                  <span className="text-gradient">{data.cityName}</span> Through Time
                </h2>
                <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                  Major milestones that shaped this city from its founding to the present day.
                </p>
              </div>
              <MilestoneTimeline
                milestones={data.milestones || []}
                cityName={data.cityName}
                loading={!data.milestones?.length}
              />
            </motion.div>
          ) : activeTab === "what-if" ? (
            <motion.div key="what-if" className="space-y-16"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            >
              <WhatIfSimulator data={data} />
            </motion.div>
          ) : activeTab === "intel" ? (
            <motion.div key="intel" className="space-y-16"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}
            >
              <CityIntelligence data={data} />
            </motion.div>
          ) : null}
        </AnimatePresence>

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


const InfraVisual = ({ data }: { data: CityData }) => {
  const [activeInfra, setActiveInfra] = useState<string | null>(null);
  const items = [
    { key: "water", label: "Water Source", value: data.infrastructure.waterSource, emoji: "💧", color: "var(--infra-water)" },
    { key: "power", label: "Power Grid", value: data.infrastructure.powerGrid, emoji: "⚡", color: "var(--infra-power)" },
    { key: "transport", label: "Transport", value: data.infrastructure.transportNetwork, emoji: "🚇", color: "var(--secondary)" },
    { key: "engineering", label: "Notable Engineering", value: data.infrastructure.notableEngineering, emoji: "🏗️", color: "var(--primary)" },
  ];

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {items.map((item, i) => (
        <motion.button
          key={item.key}
          className={`glass-card p-5 text-left transition-all duration-300 ${activeInfra === item.key ? "ring-2 ring-primary" : "hover:border-primary/30"}`}
          onClick={() => setActiveInfra(activeInfra === item.key ? null : item.key)}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 + i * 0.08 }}
          whileHover={{ y: -2 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{item.emoji}</span>
            <span className="text-xs uppercase tracking-wider text-primary font-heading font-semibold">{item.label}</span>
          </div>
          <AnimatePresence mode="wait">
            {activeInfra === item.key ? (
              <motion.p key="full" className="text-sm text-foreground leading-relaxed"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {item.value}
              </motion.p>
            ) : (
              <motion.p key="truncated" className="text-sm text-muted-foreground leading-relaxed line-clamp-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {item.value}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.button>
      ))}
    </div>
  );
};

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
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-primary w-6" : "bg-muted-foreground/30"}`}
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

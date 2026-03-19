import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Calendar, MapPin, Users, TrendingUp, Building2, Landmark, Store, ChevronDown, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export interface Milestone {
  year: string;
  title: string;
  description: string;
  stat: string;
  statLabel: string;
  category: "infrastructure" | "population" | "government" | "commerce" | "culture" | "disaster";
  mapDescription?: string;
}

interface Props {
  milestones: Milestone[];
  cityName: string;
  loading?: boolean;
}

const categoryConfig: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  infrastructure: { icon: <Building2 className="w-3.5 h-3.5" />, color: "var(--infra-water)", label: "Infrastructure" },
  population: { icon: <Users className="w-3.5 h-3.5" />, color: "var(--primary)", label: "Population" },
  government: { icon: <Landmark className="w-3.5 h-3.5" />, color: "var(--infra-power)", label: "Government" },
  commerce: { icon: <Store className="w-3.5 h-3.5" />, color: "var(--secondary)", label: "Commerce" },
  culture: { icon: <TrendingUp className="w-3.5 h-3.5" />, color: "var(--infra-fiber)", label: "Culture" },
  disaster: { icon: <MapPin className="w-3.5 h-3.5" />, color: "var(--destructive)", label: "Disaster" },
};

/* ── Single milestone card ── */
const MilestoneCard = ({
  milestone,
  index,
  isLeft,
  onExpand,
}: {
  milestone: Milestone;
  index: number;
  isLeft: boolean;
  onExpand: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const cat = categoryConfig[milestone.category] || categoryConfig.infrastructure;

  return (
    <div
      ref={ref}
      className={`relative flex items-start gap-4 md:gap-0 ${
        isLeft ? "md:flex-row" : "md:flex-row-reverse"
      }`}
    >
      {/* Card */}
      <motion.div
        className={`flex-1 md:w-[calc(50%-2rem)] ${isLeft ? "md:pr-10" : "md:pl-10"}`}
        initial={{ opacity: 0, x: isLeft ? -40 : 40, y: 20 }}
        animate={isInView ? { opacity: 1, x: 0, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <button
          onClick={onExpand}
          className="w-full text-left glass-card p-5 md:p-6 hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1"
        >
          {/* Year badge */}
          <div className="flex items-center justify-between mb-3">
            <span
              className="text-xs font-heading font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: `hsl(${cat.color} / 0.15)`,
                color: `hsl(${cat.color})`,
              }}
            >
              {milestone.year}
            </span>
            <span
              className="flex items-center gap-1.5 text-[10px] font-heading uppercase tracking-wider"
              style={{ color: `hsl(${cat.color} / 0.7)` }}
            >
              {cat.icon}
              {cat.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-heading font-bold text-base md:text-lg mb-2 group-hover:text-primary transition-colors leading-tight">
            {milestone.title}
          </h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {milestone.description}
          </p>

          {/* Stat badge */}
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <TrendingUp className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-heading font-semibold text-primary">{milestone.stat}</span>
            {milestone.statLabel && (
              <span className="text-[10px] text-muted-foreground font-heading">{milestone.statLabel}</span>
            )}
          </div>

          {/* Map placeholder */}
          <div className="mt-4 rounded-lg overflow-hidden bg-muted/50 border border-border/30 aspect-[16/7] flex items-center justify-center relative">
            <div className="absolute inset-0 opacity-30">
              <svg viewBox="0 0 320 140" className="w-full h-full">
                {/* Stylized mini map */}
                <rect width="320" height="140" fill="hsl(var(--muted))" />
                {/* Grid lines */}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 20} x2="320" y2={i * 20} stroke="hsl(var(--border))" strokeWidth="0.5" />
                ))}
                {Array.from({ length: 16 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * 22} y1="0" x2={i * 22} y2="140" stroke="hsl(var(--border))" strokeWidth="0.5" />
                ))}
                {/* City footprint blob - grows with index */}
                <motion.ellipse
                  cx="160"
                  cy="70"
                  fill="hsl(var(--primary) / 0.2)"
                  stroke="hsl(var(--primary) / 0.5)"
                  strokeWidth="1"
                  initial={{ rx: 0, ry: 0 }}
                  animate={isInView ? { rx: 20 + index * 8, ry: 15 + index * 5 } : {}}
                  transition={{ duration: 1, delay: 0.3 }}
                />
                <circle cx="160" cy="70" r="3" fill="hsl(var(--primary))" />
              </svg>
            </div>
            <span className="relative text-[10px] font-heading text-muted-foreground uppercase tracking-widest">
              {milestone.mapDescription || `${milestone.year} city footprint`}
            </span>
          </div>
        </button>
      </motion.div>

      {/* Center dot on spine (desktop) */}
      <motion.div
        className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-6 z-10 w-5 h-5 rounded-full items-center justify-center"
        style={{ backgroundColor: `hsl(${cat.color} / 0.2)`, border: `2px solid hsl(${cat.color} / 0.6)` }}
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
      >
        <motion.div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: `hsl(${cat.color})` }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>

      {/* Mobile spine dot */}
      <motion.div
        className="md:hidden absolute left-0 top-6 z-10 w-4 h-4 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `hsl(${cat.color} / 0.2)`, border: `2px solid hsl(${cat.color} / 0.6)` }}
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.2 }}
      />

      {/* Empty space for opposite side (desktop) */}
      <div className="hidden md:block flex-1 md:w-[calc(50%-2rem)]" />
    </div>
  );
};

/* ── Skeleton loader ── */
const MilestoneSkeleton = ({ isLeft }: { isLeft: boolean }) => (
  <div className={`relative flex items-start ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}>
    <div className={`flex-1 md:w-[calc(50%-2rem)] ${isLeft ? "md:pr-10" : "md:pl-10"}`}>
      <div className="glass-card p-6 space-y-3">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-7 w-32 rounded-lg" />
        <Skeleton className="aspect-[16/7] w-full rounded-lg" />
      </div>
    </div>
    <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-6 z-10 w-5 h-5 rounded-full bg-muted" />
    <div className="hidden md:block flex-1 md:w-[calc(50%-2rem)]" />
  </div>
);

/* ── Expanded detail modal ── */
const MilestoneModal = ({ milestone, onClose }: { milestone: Milestone; onClose: () => void }) => {
  const cat = categoryConfig[milestone.category] || categoryConfig.infrastructure;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-2xl glass-card p-6 md:p-8 relative overflow-y-auto max-h-[85vh]"
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-muted-foreground/20 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Year + category */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-sm font-heading font-bold px-3 py-1 rounded-full"
            style={{
              backgroundColor: `hsl(${cat.color} / 0.15)`,
              color: `hsl(${cat.color})`,
            }}
          >
            {milestone.year}
          </span>
          <span
            className="flex items-center gap-1.5 text-xs font-heading uppercase tracking-wider"
            style={{ color: `hsl(${cat.color} / 0.8)` }}
          >
            {cat.icon}
            {cat.label}
          </span>
        </div>

        <h2 className="font-heading font-bold text-2xl md:text-3xl mb-4 leading-tight">
          {milestone.title}
        </h2>

        <p className="text-muted-foreground leading-relaxed mb-6">{milestone.description}</p>

        {/* Stat callout */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-heading font-bold text-lg text-primary">{milestone.stat}</p>
            <p className="text-xs text-muted-foreground font-heading">{milestone.statLabel}</p>
          </div>
        </div>

        {/* Map placeholder expanded */}
        <div className="rounded-xl overflow-hidden bg-muted/30 border border-border/30 aspect-[16/9] flex items-center justify-center relative">
          <div className="absolute inset-0 opacity-25">
            <svg viewBox="0 0 640 360" className="w-full h-full">
              <rect width="640" height="360" fill="hsl(var(--muted))" />
              {Array.from({ length: 18 }).map((_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 20} x2="640" y2={i * 20} stroke="hsl(var(--border))" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 32 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="360" stroke="hsl(var(--border))" strokeWidth="0.5" />
              ))}
              {/* River */}
              <path d="M 0 200 Q 160 160, 320 190 Q 480 220, 640 180" fill="none" stroke="hsl(var(--infra-water) / 0.4)" strokeWidth="8" />
              {/* City area */}
              <ellipse cx="320" cy="180" rx="120" ry="80" fill="hsl(var(--primary) / 0.15)" stroke="hsl(var(--primary) / 0.4)" strokeWidth="1.5" strokeDasharray="6 3" />
              <circle cx="320" cy="180" r="5" fill="hsl(var(--primary))" />
              <text x="320" y="175" textAnchor="middle" fill="hsl(var(--foreground) / 0.5)" fontSize="10" fontFamily="var(--font-heading)">
                📍
              </text>
            </svg>
          </div>
          <div className="relative text-center">
            <p className="text-xs font-heading text-muted-foreground uppercase tracking-widest">
              {milestone.mapDescription || "City boundary estimate"}
            </p>
            <p className="text-[10px] text-muted-foreground/60 mt-1">{milestone.year}</p>
          </div>
        </div>

        {/* Photo placeholder */}
        <div className="mt-4 rounded-xl overflow-hidden bg-muted/20 border border-border/20 aspect-[16/9] flex items-center justify-center">
          <div className="text-center">
            <span className="text-3xl block mb-2">🏛️</span>
            <p className="text-xs font-heading text-muted-foreground/50 uppercase tracking-widest">
              Historical photo unavailable
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Main timeline component ── */
const MilestoneTimeline = ({ milestones, cityName, loading }: Props) => {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [expandedMilestone, setExpandedMilestone] = useState<Milestone | null>(null);
  const [currentYear, setCurrentYear] = useState<string>("");
  const timelineRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const categories = useMemo(() => {
    const cats = new Set(milestones.map((m) => m.category));
    return ["all", ...Array.from(cats)];
  }, [milestones]);

  const decades = useMemo(() => {
    const set = new Set<string>();
    milestones.forEach((m) => {
      const yearNum = parseInt(m.year);
      if (!isNaN(yearNum)) {
        const decade = Math.floor(yearNum / 10) * 10;
        set.add(`${decade}s`);
      }
    });
    return Array.from(set).sort();
  }, [milestones]);

  const filtered = useMemo(
    () => (activeFilter === "all" ? milestones : milestones.filter((m) => m.category === activeFilter)),
    [milestones, activeFilter]
  );

  // Track current year on scroll
  useEffect(() => {
    if (!filtered.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-milestone-index"));
            if (!isNaN(idx) && filtered[idx]) {
              setCurrentYear(filtered[idx].year);
            }
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    cardRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [filtered]);

  const jumpToDecade = (decade: string) => {
    const decadeNum = parseInt(decade);
    const idx = filtered.findIndex((m) => {
      const y = parseInt(m.year);
      return !isNaN(y) && y >= decadeNum && y < decadeNum + 10;
    });
    if (idx >= 0) {
      const el = cardRefs.current.get(idx);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-12 max-w-5xl mx-auto px-6 py-16">
        <Skeleton className="h-8 w-48 mx-auto" />
        <div className="flex gap-2 justify-center flex-wrap">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px bg-border hidden md:block" />
          <div className="absolute left-0 top-0 bottom-0 w-px bg-border md:hidden" />
          <div className="space-y-10 md:space-y-16">
            {Array.from({ length: 4 }).map((_, i) => (
              <MilestoneSkeleton key={i} isLeft={i % 2 === 0} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!milestones.length) return null;

  return (
    <div ref={timelineRef} className="relative">
      {/* Sticky year indicator */}
      <AnimatePresence>
        {currentYear && (
          <motion.div
            className="sticky top-[7.5rem] z-20 flex justify-center mb-4 pointer-events-none"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="px-4 py-1.5 rounded-full bg-primary/90 text-primary-foreground text-xs font-heading font-bold shadow-lg shadow-primary/30 pointer-events-auto flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {currentYear}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 justify-center">
        {categories.map((cat) => {
          const config = cat === "all" ? null : categoryConfig[cat];
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-heading font-medium transition-all duration-200 flex items-center gap-1.5 ${
                activeFilter === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted-foreground/10 hover:text-foreground"
              }`}
            >
              {config?.icon}
              {cat === "all" ? "All" : config?.label || cat}
            </button>
          );
        })}
      </div>

      {/* Decade jump selector */}
      {decades.length > 2 && (
        <div className="flex justify-center mb-10">
          <div className="inline-flex items-center gap-1 bg-muted/50 rounded-full p-1">
            <span className="text-[10px] text-muted-foreground font-heading uppercase tracking-wider px-2">
              Jump to:
            </span>
            {decades.map((d) => (
              <button
                key={d}
                onClick={() => jumpToDecade(d)}
                className="px-2.5 py-1 rounded-full text-[10px] font-heading text-muted-foreground hover:bg-primary/15 hover:text-primary transition-colors"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timeline spine + cards */}
      <div className="relative">
        {/* Center spine (desktop) */}
        <div className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-px hidden md:block">
          <div className="w-full h-full bg-gradient-to-b from-primary/40 via-border to-transparent" />
        </div>
        {/* Left spine (mobile) */}
        <div className="absolute left-[7px] top-0 bottom-0 w-px md:hidden">
          <div className="w-full h-full bg-gradient-to-b from-primary/40 via-border to-transparent" />
        </div>

        <div className="space-y-8 md:space-y-14 pl-8 md:pl-0">
          {filtered.map((milestone, i) => (
            <div
              key={`${milestone.year}-${i}`}
              ref={(el) => {
                if (el) cardRefs.current.set(i, el);
              }}
              data-milestone-index={i}
            >
              <MilestoneCard
                milestone={milestone}
                index={i}
                isLeft={i % 2 === 0}
                onExpand={() => setExpandedMilestone(milestone)}
              />
            </div>
          ))}
        </div>

        {/* Timeline end cap */}
        <div className="flex justify-center mt-10">
          <div className="w-3 h-3 rounded-full bg-primary/40 border-2 border-primary/60" />
        </div>
      </div>

      {/* Expanded modal */}
      <AnimatePresence>
        {expandedMilestone && (
          <MilestoneModal milestone={expandedMilestone} onClose={() => setExpandedMilestone(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MilestoneTimeline;

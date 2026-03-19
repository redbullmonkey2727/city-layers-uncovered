import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { navSections } from "@/data/cityData";

const ProgressNav = () => {
  const [active, setActive] = useState("hero");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showLabel, setShowLabel] = useState(false);

  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    setScrollProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    navSections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  // Show label briefly when active section changes
  useEffect(() => {
    setShowLabel(true);
    const timer = setTimeout(() => setShowLabel(false), 2000);
    return () => clearTimeout(timer);
  }, [active]);

  const activeSection = navSections.find(s => s.id === active);

  return (
    <>
      {/* Top progress bar */}
      <div className="fixed top-14 left-0 right-0 h-0.5 bg-muted/30 z-50" aria-hidden="true">
        <motion.div
          className="h-full bg-primary/80 origin-left"
          style={{ scaleX: scrollProgress }}
        />
      </div>

      {/* Floating section label on mobile */}
      <AnimatePresence>
        {showLabel && activeSection && active !== "hero" && (
          <motion.div
            className="fixed top-16 left-1/2 -translate-x-1/2 z-40 lg:hidden"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <span className="px-3 py-1 rounded-full bg-card/90 border border-border/50 backdrop-blur-md text-xs font-heading text-muted-foreground shadow-sm">
              {activeSection.label}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side dots — desktop only */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3 items-end" aria-label="Section navigation">
        {navSections.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              className="group flex items-center gap-2 py-0.5"
              aria-label={label}
              aria-current={isActive ? "true" : undefined}
            >
              <span
                className={`text-[11px] font-heading font-medium transition-all duration-300 ${
                  isActive ? "opacity-100 text-primary" : "opacity-0 group-hover:opacity-80 text-muted-foreground"
                }`}
              >
                {label}
              </span>
              <motion.span
                className={`block rounded-full transition-colors duration-300 ${
                  isActive ? "bg-primary" : "bg-muted-foreground/40 group-hover:bg-muted-foreground"
                }`}
                animate={{ width: isActive ? 20 : 8, height: isActive ? 8 : 8 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
            </a>
          );
        })}
      </nav>
    </>
  );
};

export default ProgressNav;

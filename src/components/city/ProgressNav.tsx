import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { navSections } from "@/data/cityData";

const ProgressNav = () => {
  const [active, setActive] = useState("hero");
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
    };

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
  }, []);

  return (
    <>
      {/* Top progress bar */}
      <motion.div
        className="fixed top-14 left-0 right-0 h-0.5 bg-primary/80 z-50 origin-left"
        style={{ scaleX: scrollProgress }}
      />

      {/* Side dots */}
      <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-3 items-end">
        {navSections.map(({ id, label }) => {
          const isActive = active === id;
          return (
            <a
              key={id}
              href={`#${id}`}
              className="group flex items-center gap-2"
              aria-label={label}
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

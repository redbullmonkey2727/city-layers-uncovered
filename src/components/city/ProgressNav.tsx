import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { navSections } from "@/data/cityData";

/** Sticky side-dot progress indicator. */
const ProgressNav = () => {
  const [active, setActive] = useState("hero");

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
    return () => observer.disconnect();
  }, []);

  return (
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
  );
};

export default ProgressNav;

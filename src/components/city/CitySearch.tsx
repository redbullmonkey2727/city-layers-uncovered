import { useState, FormEvent, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";

interface Props {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

const CitySearch = ({ onSearch, isLoading }: Props) => {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount (desktop only)
  useEffect(() => {
    if (window.innerWidth > 768) inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed && !isLoading) onSearch(trimmed);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      role="search"
      aria-label="Search for a city"
    >
      <div className="relative group">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a city you're passing through…"
          disabled={isLoading}
          aria-label="City name"
          autoComplete="off"
          className="w-full px-6 py-4 pr-14 rounded-full bg-card/80 backdrop-blur-md border border-border/60 text-foreground placeholder:text-muted-foreground/60 font-body text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label={isLoading ? "Searching…" : "Search"}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </div>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-4 space-y-2"
        >
          <p className="text-sm text-muted-foreground">
            Researching who built this city…
          </p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/60"
                animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </motion.form>
  );
};

export default CitySearch;

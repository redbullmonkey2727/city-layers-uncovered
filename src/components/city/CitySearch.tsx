import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";

interface Props {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

const CitySearch = ({ onSearch, isLoading }: Props) => {
  const [input, setInput] = useState("");

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
    >
      <div className="relative group">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a city you're passing through…"
          disabled={isLoading}
          className="w-full px-6 py-4 pr-14 rounded-full bg-card/80 backdrop-blur-md border border-border/60 text-foreground placeholder:text-muted-foreground/60 font-body text-base focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 transition-all disabled:opacity-40"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </button>
      </div>
      {isLoading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-muted-foreground mt-3"
        >
          Researching who built this city…
        </motion.p>
      )}
    </motion.form>
  );
};

export default CitySearch;

import { useState } from "react";
import { motion } from "framer-motion";
import SectionWrapper from "./SectionWrapper";

type ZoneType = "residential" | "commercial" | "industrial" | "civic" | "parks";

const zones: { type: ZoneType; label: string; color: string; description: string }[] = [
  { type: "residential", label: "Residential", color: "hsl(38 80% 55%)", description: "Where people live: single-family homes, townhouses, apartments." },
  { type: "commercial", label: "Commercial", color: "hsl(210 70% 55%)", description: "Shops, offices, restaurants, and services people use daily." },
  { type: "industrial", label: "Industrial", color: "hsl(0 50% 50%)", description: "Factories, warehouses, and heavy infrastructure kept away from homes." },
  { type: "civic", label: "Civic / Public", color: "hsl(270 50% 55%)", description: "Schools, libraries, city hall, fire stations — the public backbone." },
  { type: "parks", label: "Parks & Open Space", color: "hsl(140 50% 40%)", description: "Green lungs of the city: parks, trails, plazas, and natural areas." },
];

// Simple grid layout representing parcels
const gridCells: { row: number; col: number; zone: ZoneType }[] = [
  // Row 0
  { row: 0, col: 0, zone: "parks" }, { row: 0, col: 1, zone: "residential" }, { row: 0, col: 2, zone: "residential" }, { row: 0, col: 3, zone: "residential" }, { row: 0, col: 4, zone: "parks" }, { row: 0, col: 5, zone: "residential" },
  // Row 1
  { row: 1, col: 0, zone: "residential" }, { row: 1, col: 1, zone: "residential" }, { row: 1, col: 2, zone: "commercial" }, { row: 1, col: 3, zone: "commercial" }, { row: 1, col: 4, zone: "residential" }, { row: 1, col: 5, zone: "residential" },
  // Row 2
  { row: 2, col: 0, zone: "residential" }, { row: 2, col: 1, zone: "commercial" }, { row: 2, col: 2, zone: "civic" }, { row: 2, col: 3, zone: "commercial" }, { row: 2, col: 4, zone: "commercial" }, { row: 2, col: 5, zone: "residential" },
  // Row 3
  { row: 3, col: 0, zone: "industrial" }, { row: 3, col: 1, zone: "industrial" }, { row: 3, col: 2, zone: "commercial" }, { row: 3, col: 3, zone: "civic" }, { row: 3, col: 4, zone: "residential" }, { row: 3, col: 5, zone: "residential" },
  // Row 4
  { row: 4, col: 0, zone: "industrial" }, { row: 4, col: 1, zone: "industrial" }, { row: 4, col: 2, zone: "parks" }, { row: 4, col: 3, zone: "residential" }, { row: 4, col: 4, zone: "residential" }, { row: 4, col: 5, zone: "parks" },
];

const CityPlanning = () => {
  const [highlight, setHighlight] = useState<ZoneType | null>(null);

  return (
    <SectionWrapper
      id="planning"
      stage={2}
      title="Planning the Land"
      subtitle="Before a single building goes up, the land is divided into zones. Zoning decides what can be built where — and it shapes every city you've ever seen."
    >
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Zoning grid */}
        <div className="glass-card p-6">
          <div className="grid grid-cols-6 gap-1.5 mb-4">
            {gridCells.map((cell, i) => {
              const zone = zones.find((z) => z.type === cell.zone)!;
              const dimmed = highlight && highlight !== cell.zone;
              return (
                <motion.div
                  key={i}
                  className="aspect-square rounded-sm cursor-pointer transition-all duration-300"
                  style={{
                    backgroundColor: zone.color,
                    opacity: dimmed ? 0.15 : 1,
                  }}
                  whileHover={{ scale: 1.15 }}
                  onClick={() => setHighlight(highlight === cell.zone ? null : cell.zone)}
                />
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">Each square = one city block. Click a color to isolate that zone.</p>
        </div>

        {/* Legend & info */}
        <div className="space-y-3">
          {zones.map((z) => (
            <button
              key={z.type}
              onClick={() => setHighlight(highlight === z.type ? null : z.type)}
              className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                highlight === z.type ? "bg-muted" : "hover:bg-muted/50"
              }`}
            >
              <span className="w-4 h-4 rounded-sm flex-shrink-0" style={{ backgroundColor: z.color }} />
              <div>
                <span className="font-heading font-semibold text-sm">{z.label}</span>
                <p className="text-xs text-muted-foreground">{z.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
};

export default CityPlanning;

/** Shared data for the city-building educational site. */

/* ── Location factors (Stage 1) ── */
export const locationFactors = [
  { id: "water", label: "Fresh Water", icon: "💧", description: "Rivers and lakes provide drinking water, irrigation, and transport. Nearly every ancient city began beside water." },
  { id: "trade", label: "Trade Routes", icon: "🛤️", description: "Crossroads, ports, and rail junctions attract merchants, creating markets and eventually cities." },
  { id: "resources", label: "Natural Resources", icon: "⛏️", description: "Coal, timber, fertile soil, or oil draw workers. Boomtowns spring up wherever extraction begins." },
  { id: "defense", label: "Defensible Land", icon: "🏔️", description: "Hilltops, peninsulas, and islands offered safety from attackers — a top priority for early settlements." },
  { id: "climate", label: "Favorable Climate", icon: "☀️", description: "Mild temperatures and reliable rainfall make farming and living easier, attracting long-term settlement." },
  { id: "transport", label: "Transport Hub", icon: "✈️", description: "Modern cities grow around highways, airports, and rail — wherever moving people and goods is easiest." },
];

/* ── Underground utilities (Stage 3 cross-section) ── */
export interface UtilityLayer {
  id: string;
  label: string;
  color: string;
  depth: string;
  description: string;
  source: string;
  failureEffect: string;
}

export const utilityLayers: UtilityLayer[] = [
  { id: "fiber", label: "Fiber / Telecom", color: "var(--infra-fiber)", depth: "0.5–1 m", description: "Carries internet, phone, and cable signals at the speed of light through glass strands thinner than a hair.", source: "Telecom companies", failureEffect: "No internet, no phone, no streaming — modern life grinds to a halt." },
  { id: "gas", label: "Natural Gas", color: "var(--infra-gas)", depth: "0.6–1.2 m", description: "Pressurized gas pipelines deliver fuel for heating, cooking, and some power plants.", source: "Gas utility", failureEffect: "No heat in winter, no gas stoves. Leaks can cause explosions." },
  { id: "electric", label: "Electricity", color: "var(--infra-power)", depth: "0.8–1.5 m", description: "Underground conduits carry high-voltage cables from substations to every building.", source: "Electric utility / grid", failureEffect: "Total blackout. Refrigeration, lights, medical equipment — everything stops." },
  { id: "water", label: "Water Main", color: "var(--infra-water)", depth: "1.2–2 m", description: "Pressurized pipes deliver clean drinking water from treatment plants to every tap.", source: "Municipal water authority", failureEffect: "No drinking water, no showers, no fire hydrants. A public health emergency within hours." },
  { id: "sewer", label: "Sanitary Sewer", color: "var(--infra-sewer)", depth: "2–4 m", description: "Gravity-fed pipes carry wastewater to treatment plants. An invisible river of waste beneath every street.", source: "Municipal sewer dept.", failureEffect: "Sewage backs up into homes and streets. Disease follows quickly." },
  { id: "storm", label: "Storm Drain", color: "var(--infra-storm)", depth: "1.5–3 m", description: "Separate system that captures rainwater runoff and channels it to rivers or retention ponds.", source: "City public works", failureEffect: "Streets flood during rain. Erosion damages roads and foundations." },
];

/* ── Services that scale with population (Stage 5) ── */
export interface ServiceThreshold {
  population: number;
  label: string;
  services: string[];
}

export const serviceThresholds: ServiceThreshold[] = [
  { population: 100, label: "Hamlet", services: ["Volunteer fire brigade", "General store"] },
  { population: 500, label: "Village", services: ["Primary school", "Post office", "Small clinic"] },
  { population: 2000, label: "Small Town", services: ["Police station", "Library", "Fire station"] },
  { population: 10000, label: "Town", services: ["Hospital", "High school", "Public transit (bus)", "Parks dept."] },
  { population: 50000, label: "Small City", services: ["University", "Airport (regional)", "Multiple fire stations", "Recycling program"] },
  { population: 200000, label: "City", services: ["Metro / light rail", "Specialized hospitals", "Convention center", "Major utilities"] },
  { population: 1000000, label: "Major City", services: ["Subway system", "International airport", "Multiple universities", "Pro sports venues", "Extensive social services"] },
];

/* ── Funding sources (Stage 6) ── */
export interface FundingSource {
  id: string;
  label: string;
  percent: number;
  type: "public" | "private";
  description: string;
  examples: string[];
}

export const fundingSources: FundingSource[] = [
  { id: "property-tax", label: "Property Taxes", percent: 28, type: "public", description: "The backbone of local government revenue. Every property owner pays based on assessed value.", examples: ["Roads", "Schools", "Police", "Parks"] },
  { id: "developers", label: "Private Developers", percent: 22, type: "private", description: "Developers fund construction of buildings and often install utilities within their projects.", examples: ["Housing", "Shopping centers", "Office buildings"] },
  { id: "utility-fees", label: "Utility Fees", percent: 18, type: "public", description: "Monthly bills for water, sewer, and trash fund the maintenance and expansion of those systems.", examples: ["Water treatment", "Sewer maintenance", "Trash collection"] },
  { id: "state-federal", label: "State & Federal Grants", percent: 15, type: "public", description: "Higher levels of government fund major projects — especially highways, transit, and affordable housing.", examples: ["Highways", "Transit systems", "Affordable housing"] },
  { id: "bonds", label: "Municipal Bonds", percent: 10, type: "public", description: "Cities borrow money by selling bonds, then repay over decades. Used for big capital projects.", examples: ["New schools", "Bridges", "Water plants"] },
  { id: "private-invest", label: "Private Investment", percent: 7, type: "private", description: "Banks, REITs, and investors fund commercial real estate, expecting returns from rents and appreciation.", examples: ["Office towers", "Hotels", "Industrial parks"] },
];

/* ── City systems (Dashboard) ── */
export interface CitySystem {
  id: string;
  label: string;
  icon: string;
  description: string;
  prerequisites: string[];
  failureConsequence: string;
  managedBy: string;
}

export const citySystems: CitySystem[] = [
  { id: "water", label: "Water Supply", icon: "💧", description: "Delivers clean water from source to tap via treatment plants, pumps, and pipes.", prerequisites: ["Water source", "Treatment plant", "Pipe network", "Pumping stations"], failureConsequence: "Boil-water advisories, rationing, public health crisis.", managedBy: "Municipal water authority" },
  { id: "sewer", label: "Sewage", icon: "🚽", description: "Collects and treats wastewater so it can be safely returned to the environment.", prerequisites: ["Pipe network", "Treatment plant", "Gravity or pump stations"], failureConsequence: "Raw sewage in streets and rivers. Disease outbreaks.", managedBy: "City sewer department" },
  { id: "power", label: "Electricity", icon: "⚡", description: "Generates, transmits, and distributes electrical power to every building.", prerequisites: ["Power plant or grid connection", "Substations", "Distribution lines"], failureConsequence: "Blackouts. Hospitals on backup. Economy halts.", managedBy: "Electric utility (public or private)" },
  { id: "roads", label: "Roads & Transit", icon: "🛣️", description: "Moves people and goods via streets, highways, sidewalks, and public transit.", prerequisites: ["Grading & paving", "Drainage", "Signage & signals", "Maintenance crews"], failureConsequence: "Gridlock, isolation, economic decline.", managedBy: "Dept. of Transportation / Public Works" },
  { id: "internet", label: "Internet & Telecom", icon: "🌐", description: "Fiber, cable, and wireless networks connecting every home and business.", prerequisites: ["Backbone fiber", "Local distribution", "Towers or conduit"], failureConsequence: "No communication, banking, remote work, or streaming.", managedBy: "Telecom companies (regulated)" },
  { id: "trash", label: "Waste Management", icon: "🗑️", description: "Collects, recycles, and disposes of solid waste from every address.", prerequisites: ["Collection fleet", "Transfer stations", "Landfill or incinerator"], failureConsequence: "Streets fill with garbage. Vermin. Health hazard.", managedBy: "City sanitation or contracted hauler" },
  { id: "schools", label: "Schools", icon: "🏫", description: "Public education from pre-K through high school, plus community colleges and universities.", prerequisites: ["Buildings", "Teachers", "Curriculum", "Funding (property taxes)"], failureConsequence: "Uneducated workforce, families leave, economic decline.", managedBy: "School district / Board of Education" },
  { id: "emergency", label: "Emergency Services", icon: "🚒", description: "Police, fire, and EMS protect life and property around the clock.", prerequisites: ["Stations", "Personnel", "Equipment", "911 dispatch"], failureConsequence: "Uncontrolled fires, crime, delayed medical care.", managedBy: "City police, fire dept., EMS" },
  { id: "food", label: "Food Supply", icon: "🍎", description: "Farms, transport, wholesale markets, grocery stores, and restaurants feed the population.", prerequisites: ["Agricultural land", "Transport network", "Cold chain", "Retail locations"], failureConsequence: "Shortages within days. Panic and rationing.", managedBy: "Private sector + health inspectors" },
  { id: "zoning", label: "Zoning & Planning", icon: "📐", description: "Rules that decide what can be built where — residential, commercial, industrial, mixed-use.", prerequisites: ["Comprehensive plan", "Zoning code", "Planning commission"], failureConsequence: "Chaotic development, factories next to schools, no parks.", managedBy: "City planning department" },
];

/* ── Simulation options (Build a City) ── */
export interface SimulationChoice {
  id: string;
  label: string;
  options: { value: string; label: string; effects: Record<string, number> }[];
}

export const simulationChoices: SimulationChoice[] = [
  {
    id: "location", label: "Location",
    options: [
      { value: "river", label: "River Valley", effects: { water: 2, trade: 1, defense: -1, cost: 0 } },
      { value: "coast", label: "Coastal Port", effects: { trade: 2, water: 1, defense: 0, cost: 1 } },
      { value: "plains", label: "Open Plains", effects: { cost: -1, sprawl: 2, trade: 0, water: -1 } },
    ],
  },
  {
    id: "density", label: "Density",
    options: [
      { value: "low", label: "Suburban Sprawl", effects: { sprawl: 2, traffic: 2, cost: 1, livability: 0 } },
      { value: "med", label: "Mixed Medium", effects: { sprawl: 0, traffic: 0, cost: 0, livability: 1 } },
      { value: "high", label: "Dense Urban", effects: { sprawl: -2, traffic: -1, cost: -1, livability: 1 } },
    ],
  },
  {
    id: "transit", label: "Transportation",
    options: [
      { value: "car", label: "Car-Centric", effects: { traffic: 2, cost: 1, sprawl: 1, livability: -1 } },
      { value: "mixed", label: "Mixed Transit", effects: { traffic: 0, cost: 0, sprawl: 0, livability: 1 } },
      { value: "public", label: "Transit-First", effects: { traffic: -2, cost: 0, sprawl: -1, livability: 2 } },
    ],
  },
  {
    id: "infra", label: "Infrastructure Investment",
    options: [
      { value: "low", label: "Minimal", effects: { cost: -2, livability: -2, resilience: -2 } },
      { value: "med", label: "Standard", effects: { cost: 0, livability: 0, resilience: 0 } },
      { value: "high", label: "Premium", effects: { cost: 2, livability: 2, resilience: 2 } },
    ],
  },
];

/* ── Timeline eras (Stage 7) ── */
export interface TimelineEra {
  year: string;
  label: string;
  description: string;
  features: string[];
}

export const timelineEras: TimelineEra[] = [
  { year: "Year 0", label: "Empty Land", description: "Nothing but terrain, trees, and a water source.", features: ["Natural landscape", "No roads", "No structures"] },
  { year: "Year 5", label: "First Settlement", description: "A small cluster of homes near the water. Dirt roads, wells, outhouses.", features: ["Dirt paths", "Wells", "General store", "~50 people"] },
  { year: "Year 20", label: "Growing Town", description: "Streets are laid out. A water tower appears. First school opens.", features: ["Gravel roads", "Water tower", "School", "Church", "~2,000 people"] },
  { year: "Year 50", label: "Small City", description: "Paved roads, underground sewers, electric grid. Downtown takes shape.", features: ["Paved streets", "Sewer system", "Electric grid", "City hall", "~15,000 people"] },
  { year: "Year 100", label: "Mature City", description: "Suburbs expand. Highway connects to other cities. Old pipes need replacing.", features: ["Suburbs", "Highway", "Hospital", "University", "~100,000 people"] },
  { year: "Year 150", label: "Modern Metro", description: "Light rail, fiber internet, mixed-use infill. Old areas redeveloped.", features: ["Light rail", "Fiber internet", "Infill development", "Green infrastructure", "~500,000 people"] },
];

/* ── Progress nav sections ── */
export const navSections = [
  { id: "hero", label: "Start" },
  { id: "big-idea", label: "Big Idea" },
  { id: "why-here", label: "Why Here?" },
  { id: "planning", label: "Planning" },
  { id: "infrastructure", label: "Underground" },
  { id: "buildings", label: "Buildings" },
  { id: "services", label: "Services" },
  { id: "funding", label: "Funding" },
  { id: "timeline", label: "Timeline" },
  { id: "systems", label: "Systems" },
  { id: "simulation", label: "Simulate" },
  { id: "takeaway", label: "Takeaway" },
];

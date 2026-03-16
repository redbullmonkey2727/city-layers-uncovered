import { motion } from "framer-motion";
import type { CityData } from "@/lib/cityLookup";

interface Props {
  data: CityData;
  onClear: () => void;
}

const CityResults = ({ data, onClear }: Props) => {
  const fadeIn = { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-12">
      {/* Header */}
      <motion.div {...fadeIn} transition={{ duration: 0.5 }} className="text-center">
        <button
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-primary transition-colors font-heading uppercase tracking-widest mb-4 inline-block"
        >
          ← Search another city
        </button>
        <h1 className="text-4xl md:text-6xl font-heading font-bold mb-2">
          <span className="text-gradient">{data.cityName}</span>
          {data.state && <span className="text-muted-foreground text-2xl md:text-3xl ml-3">{data.state}</span>}
        </h1>
        {data.nickname && (
          <p className="text-muted-foreground font-heading text-lg italic">"{data.nickname}"</p>
        )}
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-muted-foreground">
          <span>Founded: <strong className="text-foreground">{data.founded}</strong></span>
          <span>Pop: <strong className="text-foreground">{data.population}</strong></span>
        </div>
        <p className="text-lg text-muted-foreground leading-relaxed mt-6 max-w-2xl mx-auto">{data.summary}</p>
      </motion.div>

      {/* Why Here */}
      <Section title="Why Here?" icon="📍" delay={0.1}>
        <p className="text-muted-foreground mb-4">{data.whyHere.originalSettlers}</p>
        <div className="flex flex-wrap gap-2">
          {data.whyHere.reasons.map((r, i) => (
            <span key={i} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-heading">{r}</span>
          ))}
        </div>
      </Section>

      {/* Who Built This */}
      <Section title="Who Built This?" icon="🏗️" delay={0.15}>
        <p className="text-muted-foreground mb-4">{data.whoBuiltThis.majorDevelopers}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {data.whoBuiltThis.keyFigures.map((f, i) => (
            <div key={i} className="glass-card p-4">
              <h4 className="font-heading font-semibold text-sm">{f.name}</h4>
              <p className="text-xs text-muted-foreground mt-1">{f.contribution}</p>
              <span className="text-[10px] text-primary/70 font-heading mt-2 inline-block">{f.era}</span>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {data.whoBuiltThis.keyIndustries.map((ind, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">{ind}</span>
          ))}
        </div>
      </Section>

      {/* What You're Seeing */}
      <Section title="What You're Seeing" icon="👀" delay={0.2}>
        <p className="text-muted-foreground mb-2"><strong className="text-foreground">Architecture:</strong> {data.whatYoureSeeing.architecturalStyle}</p>
        <p className="text-muted-foreground mb-4"><strong className="text-foreground">Street Layout:</strong> {data.whatYoureSeeing.streetLayout}</p>

        {data.whatYoureSeeing.neighborhoods.length > 0 && (
          <div className="mb-4">
            <h4 className="font-heading font-semibold text-sm mb-2">Neighborhoods</h4>
            <div className="grid sm:grid-cols-2 gap-3">
              {data.whatYoureSeeing.neighborhoods.map((n, i) => (
                <div key={i} className="glass-card p-3">
                  <span className="font-heading font-semibold text-sm">{n.name}</span>
                  <span className="text-[10px] text-primary/70 ml-2">{n.era}</span>
                  <p className="text-xs text-muted-foreground mt-1">{n.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {data.whatYoureSeeing.landmarks.map((l, i) => (
            <span key={i} className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary text-xs">{l}</span>
          ))}
        </div>
      </Section>

      {/* Infrastructure */}
      <Section title="The Invisible Systems" icon="🔧" delay={0.25}>
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoCard label="Water Source" value={data.infrastructure.waterSource} color="infra-water" />
          <InfoCard label="Power Grid" value={data.infrastructure.powerGrid} color="infra-power" />
          <InfoCard label="Transport" value={data.infrastructure.transportNetwork} color="infra-road" />
          <InfoCard label="Notable Engineering" value={data.infrastructure.notableEngineering} color="primary" />
        </div>
      </Section>

      {/* Layers of Time */}
      <Section title="Layers of Time" icon="📅" delay={0.3}>
        <div className="space-y-3">
          {data.layers.periods.map((p, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-28">
                <span className="text-xs font-heading font-semibold text-primary">{p.era}</span>
              </div>
              <div className="flex-1 glass-card p-3">
                <p className="text-sm">{p.whatWasBuilt}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.whyItMatters}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Fun Facts */}
      <Section title="Things You Didn't Know" icon="💡" delay={0.35}>
        <div className="space-y-2">
          {data.funFacts.map((fact, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">{fact}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Challenges */}
      <Section title="Current Challenges" icon="⚠️" delay={0.4}>
        <p className="text-muted-foreground">{data.challenges}</p>
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
  );
};

/* ── Helper components ── */

const Section = ({ title, icon, delay, children }: { title: string; icon: string; delay: number; children: React.ReactNode }) => (
  <motion.section
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="flex items-center gap-3 mb-4">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-2xl md:text-3xl font-heading font-bold">{title}</h2>
    </div>
    {children}
  </motion.section>
);

const InfoCard = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="glass-card p-4">
    <span className={`text-xs uppercase tracking-wider text-${color} font-heading font-semibold`}>{label}</span>
    <p className="text-sm text-muted-foreground mt-1">{value}</p>
  </div>
);

export default CityResults;

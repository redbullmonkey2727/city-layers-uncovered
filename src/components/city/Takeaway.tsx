import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

const Takeaway = () => {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const { user, subscription } = useAuth();
  const isPro = subscription.plan === "pro";

  return (
    <section ref={ref} id="takeaway" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <motion.div
        className="relative z-10 max-w-3xl mx-auto text-center"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
      >
        <motion.p
          className="text-sm tracking-[0.3em] uppercase text-primary font-heading font-semibold mb-6"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
        >
          The Takeaway
        </motion.p>

        <h2 className="text-3xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-8">
          Every normal place is actually an{" "}
          <span className="text-gradient">enormous systems accomplishment.</span>
        </h2>

        <div className="space-y-6 text-lg text-muted-foreground leading-relaxed mb-12">
          <p>
            The next time you turn on a faucet, flush a toilet, flip a light switch, or drive down a road — remember that dozens of interconnected systems made that moment possible.
          </p>
          <p className="text-foreground font-medium">
            Most infrastructure is invisible until it breaks. Now you know what's really underneath.
          </p>
        </div>

        {/* Conversion CTA */}
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 }}
        >
          {!user ? (
            <>
              <Link to="/sign-up">
                <Button size="lg" className="font-heading gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 h-12 px-8 text-base">
                  <Zap className="w-4 h-4" />
                  Start Exploring Free
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                5 free city lookups per month · No credit card required
              </p>
            </>
          ) : !isPro ? (
            <>
              <Link to="/pricing">
                <Button size="lg" className="font-heading gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 h-12 px-8 text-base">
                  <Zap className="w-4 h-4" />
                  Unlock Unlimited Access
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Go deeper with every city — $9.99/mo, cancel anytime
              </p>
            </>
          ) : (
            <a
              href="#hero"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-sm font-heading font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
            >
              ↑ Search another city
            </a>
          )}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Takeaway;

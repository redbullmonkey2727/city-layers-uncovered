import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import {
  Check, X, Loader2, Shield, Zap, Crown, ArrowRight,
  ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";


const comparisonFeatures = [
  { feature: "City lookups per month", free: "5", pro: "Unlimited" },
  { feature: "Saved cities", free: "10", pro: "Unlimited" },
  { feature: "City summaries", free: "Basic", pro: "Premium deep dives" },
  { feature: "Search history", free: true, pro: true },
  { feature: "Route planning & trips", free: false, pro: true },
  { feature: "Compare cities side-by-side", free: false, pro: true },
  { feature: "Audio mode", free: false, pro: "Coming soon" },
  { feature: "Priority support", free: false, pro: true },
];

const faqs = [
  {
    q: "What happens after I subscribe?",
    a: "You'll be redirected to a secure Stripe checkout page. Once payment completes, your account is instantly upgraded and you get unlimited access.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes — cancel with one click from your Account page. You keep Pro access until the end of your billing period. No questions asked.",
  },
  {
    q: "What if I hit the free limit mid-research?",
    a: "You'll see a prompt to upgrade. Your searches and saved cities are preserved — upgrading unlocks them all instantly.",
  },
  {
    q: "Is my payment information secure?",
    a: "Absolutely. Payments are handled entirely by Stripe. We never see or store your card details.",
  },
];

const Pricing = () => {
  const { user, subscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const isPro = subscription.plan === "pro";
  const params = new URLSearchParams(window.location.search);
  const cancelled = params.get("checkout") === "cancelled";

  const handleUpgrade = async () => {
    if (!user) {
      navigate("/sign-up");
      return;
    }
    setLoading(true);
    setError(null);
    setCheckoutUrl(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-checkout");
      if (fnError) throw fnError;
      if (data?.url) {
        // Try opening in new tab; if blocked, show fallback link
        const win = window.open(data.url, "_blank");
        if (!win) {
          setCheckoutUrl(data.url);
          toast({ title: "Popup blocked", description: "Click the link below to continue to checkout." });
        }
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast({ title: "Checkout failed", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-0">
      <div className="max-w-5xl mx-auto px-6">
        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-heading text-[11px] uppercase tracking-wider">
            Simple pricing
          </Badge>
          <h1 className="text-4xl md:text-6xl font-heading font-bold mb-4 leading-tight">
            Stop guessing.<br />
            <span className="text-gradient">Start understanding.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            Free gets you started. Pro gives you the full picture — every city, every layer, no limits.
          </p>
          {cancelled && (
            <p className="text-sm text-muted-foreground mt-4 bg-muted/50 inline-block px-4 py-2 rounded-lg">
              Checkout was cancelled — you can try again anytime.
            </p>
          )}
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mb-20">
          {/* Free */}
          <div className="glass-card p-8 relative">
            <h2 className="text-xl font-heading font-bold mb-1">Free</h2>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-heading font-bold">$0</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Perfect for a quick road trip peek.</p>
            <ul className="space-y-3 mb-8">
              {["5 city lookups per month", "10 saved cities", "Basic summaries", "Search history"].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" className="w-full font-heading" disabled>
              {isPro ? "—" : "Current Plan"}
            </Button>
          </div>

          {/* Pro */}
          <div className="glass-card p-8 relative border-primary/40 glow-primary">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground font-heading text-[11px] uppercase tracking-wider px-3 shadow-lg shadow-primary/30">
                <Crown className="w-3 h-3 mr-1" /> Most Popular
              </Badge>
            </div>
            {isPro && (
              <Badge className="absolute top-4 right-4 text-[10px] uppercase bg-primary/15 text-primary border-primary/30">
                Your Plan
              </Badge>
            )}
            <h2 className="text-xl font-heading font-bold mb-1">Pro</h2>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-heading font-bold text-gradient">$9.99</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">For road trippers who want the full story.</p>
            <ul className="space-y-3 mb-8">
              {[
                "Unlimited city lookups",
                "Unlimited saved cities & trips",
                "Premium deep-dive insights",
                "Compare cities side-by-side",
                "Audio mode (coming soon)",
                "Priority support",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-foreground">{f}</span>
                </li>
              ))}
            </ul>
            {isPro ? (
              <Button variant="outline" className="w-full font-heading" disabled>
                You're on Pro ✦
              </Button>
            ) : (
              <div className="space-y-3">
                <Button
                  className="w-full font-heading gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 h-11"
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Opening checkout…
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Unlock Full Access
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
                {checkoutUrl && (
                  <a
                    href={checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full text-sm text-primary hover:underline font-heading py-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Stripe Checkout
                  </a>
                )}
                {error && (
                  <div className="space-y-2">
                    <p className="text-xs text-destructive text-center">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full font-heading"
                      onClick={handleUpgrade}
                      disabled={loading}
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-2xl font-heading font-bold text-center mb-8">
            Everything you get, side by side
          </h2>
          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-3 text-sm font-heading font-semibold border-b border-border/50 bg-muted/30">
              <div className="p-4">Feature</div>
              <div className="p-4 text-center">Free</div>
              <div className="p-4 text-center text-primary">Pro</div>
            </div>
            {comparisonFeatures.map(({ feature, free, pro }) => (
              <div key={feature} className="grid grid-cols-3 text-sm border-b border-border/30 last:border-0">
                <div className="p-4 text-muted-foreground">{feature}</div>
                <div className="p-4 text-center">
                  {free === true ? (
                    <Check className="w-4 h-4 text-muted-foreground mx-auto" />
                  ) : free === false ? (
                    <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                  ) : (
                    <span className="text-muted-foreground">{free}</span>
                  )}
                </div>
                <div className="p-4 text-center">
                  {pro === true ? (
                    <Check className="w-4 h-4 text-primary mx-auto" />
                  ) : pro === false ? (
                    <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />
                  ) : (
                    <span className="text-foreground font-medium">{pro}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-20">
          <h2 className="text-2xl font-heading font-bold text-center mb-8">
            Frequently asked questions
          </h2>
          <div className="space-y-2">
            {faqs.map(({ q, a }, i) => (
              <div
                key={i}
                className="glass-card overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-4 text-left text-sm font-heading font-medium hover:bg-muted/30 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  {q}
                  {openFaq === i ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                    {a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust */}
        <div className="text-center pb-16">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-4">
            <Shield className="w-4 h-4" />
            <span>Secure payment via Stripe · Cancel anytime · No card stored on our servers</span>
          </div>
          {!isPro && (
            <Button
              className="font-heading gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
              onClick={handleUpgrade}
              disabled={loading}
            >
              <Zap className="w-4 h-4" />
              {loading ? "Opening checkout…" : "Get Pro — $9.99/mo"}
            </Button>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Pricing;

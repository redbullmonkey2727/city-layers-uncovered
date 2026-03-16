import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Shield } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: [
      "5 city lookups per month",
      "10 saved cities",
      "Basic summaries",
      "Search history",
    ],
    cta: "Current Plan",
    plan: "free",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "/month",
    features: [
      "Unlimited city lookups",
      "Unlimited saved trips",
      "Premium route insights",
      "Compare cities side-by-side",
      "Audio mode (coming soon)",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    plan: "pro",
    highlight: true,
  },
];

const Pricing = () => {
  const { user, subscription } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Handle checkout=cancelled redirect
  const params = new URLSearchParams(window.location.search);
  const cancelled = params.get("checkout") === "cancelled";

  const handleUpgrade = async () => {
    if (!user) {
      navigate("/sign-up");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-checkout");
      if (fnError) throw fnError;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast({
        title: "Checkout failed",
        description: msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Simple, <span className="text-gradient">Fair</span> Pricing
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Start free. Upgrade when you want unlimited access to every city on your road trip.
          </p>
          {cancelled && (
            <p className="text-sm text-muted-foreground mt-4 bg-muted/50 inline-block px-4 py-2 rounded-lg">
              Checkout was cancelled. You can try again anytime.
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {plans.map((plan) => {
            const isCurrent = subscription.plan === plan.plan;
            return (
              <div
                key={plan.plan}
                className={`glass-card p-8 relative ${plan.highlight ? "border-primary/50 glow-primary" : ""}`}
              >
                {isCurrent && (
                  <Badge className="absolute top-4 right-4 text-[10px] uppercase">Your Plan</Badge>
                )}
                <h2 className="text-2xl font-heading font-bold mb-1">{plan.name}</h2>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-heading font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{f}</span>
                    </li>
                  ))}
                </ul>
                {plan.plan === "pro" && !isCurrent ? (
                  <div className="space-y-3">
                    <Button
                      className="w-full font-heading"
                      onClick={handleUpgrade}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redirecting…
                        </>
                      ) : (
                        plan.cta
                      )}
                    </Button>
                    {error && (
                      <p className="text-xs text-destructive text-center">{error}</p>
                    )}
                  </div>
                ) : isCurrent ? (
                  <Button variant="outline" className="w-full font-heading" disabled>
                    Current Plan
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full font-heading" disabled>
                    {plan.cta}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Trust section */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Shield className="w-4 h-4" />
            <span>Secure payment via Stripe · Cancel anytime · No card stored on our servers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;

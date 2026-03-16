import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: [
      "5 city lookups per month",
      "1 saved trip",
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
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleUpgrade = async () => {
    if (!user) {
      navigate("/sign-up");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      toast({
        title: "Checkout failed",
        description: err instanceof Error ? err.message : "Something went wrong",
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
                  <Button
                    className="w-full font-heading"
                    onClick={handleUpgrade}
                    disabled={loading}
                  >
                    {loading ? "Loading…" : plan.cta}
                  </Button>
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
      </div>
    </div>
  );
};

export default Pricing;

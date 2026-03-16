import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Lock, Zap } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
}

const PaywallModal = ({ open, onClose }: Props) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  if (!open) return null;

  const handleUpgrade = async () => {
    if (!user) {
      navigate("/sign-up");
      onClose();
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
      const msg = err instanceof Error ? err.message : "Couldn't start checkout";
      setError(msg);
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-6">
      <div className="glass-card max-w-md w-full p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-2xl font-heading font-bold">Monthly Limit Reached</h2>
        <p className="text-muted-foreground">
          You've used all 5 free city lookups this month. Upgrade to Pro for unlimited access.
        </p>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <div className="space-y-3">
          <Button className="w-full font-heading gap-2" onClick={handleUpgrade} disabled={loading}>
            <Zap className="w-4 h-4" />
            {loading ? "Redirecting to checkout…" : "Upgrade to Pro — $9.99/mo"}
          </Button>
          {error && (
            <Button variant="outline" className="w-full font-heading" onClick={handleUpgrade} disabled={loading}>
              Try Again
            </Button>
          )}
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;

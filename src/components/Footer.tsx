import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Zap } from "lucide-react";

const Footer = () => {
  const { user, subscription } = useAuth();
  const isPro = subscription.plan === "pro";

  return (
    <footer className="border-t border-border/50 bg-card/30">
      {/* Upgrade strip for free/logged-out users */}
      {!isPro && (
        <div className="border-b border-border/30 bg-primary/5">
          <div className="max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground font-heading text-center sm:text-left">
              {user
                ? "You're on the Free plan. Unlock unlimited lookups and premium insights."
                : "Sign up free to start exploring — upgrade anytime for the full experience."
              }
            </p>
            <Link
              to={user ? "/pricing" : "/sign-up"}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-heading font-medium transition-colors shadow-sm shadow-primary/20 flex-shrink-0"
            >
              <Zap className="w-3.5 h-3.5" />
              {user ? "Upgrade to Pro" : "Start Free"}
            </Link>
          </div>
        </div>
      )}
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground font-heading">
          © {new Date().getFullYear()} Who Built All This?
        </p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link to="/pricing" className="hover:text-foreground transition-colors font-heading">Pricing</Link>
          <Link to="/account" className="hover:text-foreground transition-colors font-heading">Account</Link>
          {!user && (
            <Link to="/sign-up" className="hover:text-primary transition-colors font-heading font-medium text-foreground">
              Sign Up
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

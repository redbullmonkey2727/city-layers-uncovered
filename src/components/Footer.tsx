import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Zap } from "lucide-react";

const Footer = () => {
  const { user, subscription } = useAuth();
  const isPro = subscription.plan === "pro";

  return (
    <footer className="border-t border-border/50 bg-card/30">
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
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground/60 mb-3">Product</p>
            <div className="space-y-2 text-sm">
              <Link to="/pricing" className="block text-muted-foreground hover:text-foreground transition-colors font-heading">Pricing</Link>
              <Link to="/contact-sales" className="block text-muted-foreground hover:text-foreground transition-colors font-heading">Contact Sales</Link>
              <Link to="/support" className="block text-muted-foreground hover:text-foreground transition-colors font-heading">Support</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground/60 mb-3">Account</p>
            <div className="space-y-2 text-sm">
              <Link to="/account" className="block text-muted-foreground hover:text-foreground transition-colors font-heading">Dashboard</Link>
              <Link to="/settings" className="block text-muted-foreground hover:text-foreground transition-colors font-heading">Settings</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground/60 mb-3">Internal</p>
            <div className="space-y-2 text-sm">
              <Link to="/admin" className="block text-muted-foreground hover:text-foreground transition-colors font-heading">Ops Dashboard</Link>
              <Link to="/sales" className="block text-muted-foreground hover:text-foreground transition-colors font-heading">Sales Pipeline</Link>
              <Link to="/finance" className="block text-muted-foreground hover:text-foreground transition-colors font-heading">Finance</Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground/60 mb-3">Company</p>
            <div className="space-y-2 text-sm">
              <span className="block text-muted-foreground/50 font-heading">Security</span>
              <span className="block text-muted-foreground/50 font-heading">Privacy</span>
              <span className="block text-muted-foreground/50 font-heading">Terms</span>
            </div>
          </div>
        </div>
        <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground font-heading">
            © {new Date().getFullYear()} Who Built All This?
          </p>
          {!user && (
            <Link to="/sign-up" className="text-sm text-primary hover:text-primary/80 transition-colors font-heading font-medium">
              Get Started →
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;

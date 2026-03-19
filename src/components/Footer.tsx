import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Zap, ArrowUp, Mail, MapPin, HelpCircle } from "lucide-react";

const Footer = () => {
  const { user, subscription } = useAuth();
  const isPro = subscription.plan === "pro";

  return (
    <footer className="border-t border-border/50 bg-card/30" role="contentinfo">
      {/* Upgrade banner */}
      {!isPro && (
        <div className="border-b border-border/30 bg-primary/5">
          <div className="max-w-5xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground font-heading text-center sm:text-left">
              {user
                ? "You're on the Free plan. Unlock unlimited lookups and premium insights."
                : "Sign up free to start exploring — upgrade anytime for the full experience."
              }
            </p>
            <Link
              to={user ? "/pricing" : "/sign-up"}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-heading font-medium transition-all shadow-sm shadow-primary/20 flex-shrink-0 active:scale-95"
            >
              <Zap className="w-3.5 h-3.5" />
              {user ? "Upgrade to Pro" : "Start Free"}
            </Link>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground/60 mb-3">Product</p>
            <nav className="space-y-2.5 text-sm" aria-label="Product links">
              <Link to="/pricing" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-heading group">
                <Zap className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" /> Pricing
              </Link>
              <Link to="/contact-sales" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-heading group">
                <Mail className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" /> Contact Sales
              </Link>
              <Link to="/support" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors font-heading group">
                <HelpCircle className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" /> Support
              </Link>
            </nav>
          </div>
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground/60 mb-3">Account</p>
            <nav className="space-y-2.5 text-sm" aria-label="Account links">
              <Link to="/account" className="block text-muted-foreground hover:text-foreground transition-colors font-heading">Dashboard</Link>
              <Link to={user ? "/pricing" : "/sign-up"} className="block text-muted-foreground hover:text-foreground transition-colors font-heading">
                {user ? "Manage Plan" : "Sign Up"}
              </Link>
            </nav>
          </div>
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground/60 mb-3">Explore</p>
            <nav className="space-y-2.5 text-sm" aria-label="Explore links">
              <a href="/#big-idea" className="block text-muted-foreground hover:text-foreground transition-colors font-heading">How Cities Work</a>
              <a href="/#infrastructure" className="block text-muted-foreground hover:text-foreground transition-colors font-heading">Underground Infra</a>
              <a href="/#simulation" className="block text-muted-foreground hover:text-foreground transition-colors font-heading">Build Your City</a>
            </nav>
          </div>
          <div>
            <p className="text-xs font-heading uppercase tracking-wider text-muted-foreground/60 mb-3">Company</p>
            <div className="space-y-2.5 text-sm">
              <span className="block text-muted-foreground/50 font-heading cursor-default" title="Coming soon">Security</span>
              <span className="block text-muted-foreground/50 font-heading cursor-default" title="Coming soon">Privacy Policy</span>
              <span className="block text-muted-foreground/50 font-heading cursor-default" title="Coming soon">Terms of Service</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary/60" />
            <p className="text-sm text-muted-foreground font-heading">
              © {new Date().getFullYear()} Who Built All This? — A road trip companion by Jonny Foote
            </p>
          </div>
          <div className="flex items-center gap-4">
            {!user && (
              <Link to="/sign-up" className="text-sm text-primary hover:text-primary/80 transition-colors font-heading font-medium">
                Get Started →
              </Link>
            )}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-heading"
              aria-label="Back to top"
            >
              <ArrowUp className="w-3 h-3" /> Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

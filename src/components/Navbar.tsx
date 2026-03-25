import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap, Menu, X, User, Sparkles, LifeBuoy, BarChart3,
  Settings, DollarSign, Phone, Shield,
  Compass, Heart, Route, MessageCircle, Clock,
} from "lucide-react";

const Navbar = () => {
  const { user, subscription, signOut, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isPro = subscription.plan === "pro";

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Shrink header on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const adminLinks = [
    { to: "/settings", label: "Settings", icon: Settings },
    { to: "/admin", label: "Ops", icon: BarChart3 },
    { to: "/sales", label: "Sales", icon: Phone },
    { to: "/finance", label: "Finance", icon: DollarSign },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/95 backdrop-blur-lg border-b border-border/60 shadow-lg shadow-background/20"
          : "bg-background/80 backdrop-blur-md border-b border-border/50"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-heading font-bold text-lg tracking-tight group" aria-label="Who Built All This? — Home">
          <span className="text-gradient group-hover:opacity-80 transition-opacity">Who Built All This?</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {loading ? null : user ? (
            <>
              <Link to="/explore">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-heading text-sm gap-1.5 transition-colors ${isActive("/explore") ? "text-foreground bg-muted" : ""}`}
                >
                  <Compass className="w-3.5 h-3.5" /> Explore
                </Button>
              </Link>
              <Link to="/trips">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-heading text-sm gap-1.5 transition-colors ${isActive("/trips") ? "text-foreground bg-muted" : ""}`}
                >
                  <Route className="w-3.5 h-3.5" /> Trips
                </Button>
              </Link>
              <Link to="/saved">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-heading text-sm gap-1.5 transition-colors ${isActive("/saved") ? "text-foreground bg-muted" : ""}`}
                >
                  <Heart className="w-3.5 h-3.5" /> Saved
                </Button>
              </Link>
              <Link to="/chat">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-heading text-sm gap-1.5 transition-colors ${isActive("/chat") ? "text-foreground bg-muted" : ""}`}
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Chat
                </Button>
              </Link>
              <Link to="/account">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`font-heading text-sm gap-1.5 transition-colors ${isActive("/account") || isActive("/edit-profile") ? "text-foreground bg-muted" : ""}`}
                >
                  <User className="w-3.5 h-3.5" /> Profile
                </Button>
              </Link>
              {isAdmin && adminLinks.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`font-heading text-sm gap-1.5 transition-colors ${isActive(to) ? "text-foreground bg-muted" : ""}`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </Button>
                </Link>
              ))}
              {isAdmin && (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider border-destructive/40 text-destructive ml-1 gap-1">
                  <Shield className="w-2.5 h-2.5" /> Admin
                </Badge>
              )}
              {isPro ? (
                <Badge className="text-[10px] uppercase tracking-wider bg-primary/15 text-primary border-primary/30 ml-1">
                  ✦ Pro
                </Badge>
              ) : (
                <Link to="/pricing">
                  <Button size="sm" className="font-heading text-sm gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 ml-1 active:scale-95 transition-transform">
                    <Zap className="w-3.5 h-3.5" /> Upgrade
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-sm ml-1 hover:text-foreground transition-colors"
                onClick={async () => { await signOut(); navigate("/"); }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/pricing">
                <Button variant="ghost" size="sm" className={`font-heading text-sm gap-1.5 transition-colors ${isActive("/pricing") ? "text-primary bg-primary/10" : "text-primary hover:text-primary hover:bg-primary/10"}`}>
                  <Sparkles className="w-3.5 h-3.5" /> Pricing
                </Button>
              </Link>
              <Link to="/contact-sales">
                <Button variant="ghost" size="sm" className={`font-heading text-sm gap-1.5 transition-colors ${isActive("/contact-sales") ? "text-foreground bg-muted" : ""}`}>
                  <Phone className="w-3.5 h-3.5" /> Contact Sales
                </Button>
              </Link>
              <Link to="/sign-in">
                <Button variant="ghost" size="sm" className="font-heading text-sm hover:text-foreground transition-colors">Sign In</Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm" className="font-heading text-sm gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 active:scale-95 transition-transform">
                  <Zap className="w-3.5 h-3.5" /> Start Free
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-x-0 top-14 bottom-0 bg-background z-[999] overflow-y-auto border-t border-border"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="px-6 py-6 space-y-2 max-w-md mx-auto">
            {loading ? null : user ? (
              <>
                {[
                  { to: "/explore", label: "Explore", icon: Compass },
                  { to: "/trips", label: "Trip Planner", icon: Route },
                  { to: "/saved", label: "Saved", icon: Heart },
                  { to: "/chat", label: "Messages", icon: MessageCircle },
                  { to: "/search-history", label: "Search History", icon: Clock },
                  { to: "/account", label: "Account", icon: User },
                  { to: "/support", label: "Support", icon: LifeBuoy },
                  { to: "/pricing", label: "Pricing", icon: Sparkles },
                  ...(isAdmin ? [
                    { to: "/settings", label: "Settings", icon: Settings },
                    { to: "/admin", label: "Ops Dashboard", icon: BarChart3 },
                    { to: "/sales", label: "Sales Pipeline", icon: Phone },
                    { to: "/finance", label: "Finance", icon: DollarSign },
                  ] : []),
                ].map(({ to, label, icon: Icon }) => (
                  <Link key={to} to={to}>
                    <Button
                      variant="ghost"
                      className={`w-full font-heading gap-2 justify-start text-base py-3 transition-colors ${isActive(to) ? "text-primary bg-primary/10" : ""}`}
                    >
                      <Icon className="w-5 h-5" /> {label}
                    </Button>
                  </Link>
                ))}
                <div className="border-t border-border/50 pt-4 mt-4">
                  <Button
                    variant="ghost"
                    className="w-full text-muted-foreground justify-start text-base py-3"
                    onClick={async () => { await signOut(); navigate("/"); }}
                  >
                    Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link to="/contact-sales">
                  <Button variant="ghost" className="w-full font-heading gap-2 justify-start text-base py-3">
                    <Phone className="w-5 h-5" /> Contact Sales
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="ghost" className="w-full font-heading gap-2 justify-start text-base py-3 text-primary">
                    <Sparkles className="w-5 h-5" /> Pricing
                  </Button>
                </Link>
                <div className="border-t border-border/50 pt-4 mt-4 space-y-2">
                  <Link to="/sign-up">
                    <Button className="w-full font-heading gap-2 bg-primary hover:bg-primary/90 text-primary-foreground text-base py-3">
                      <Zap className="w-5 h-5" /> Start Free
                    </Button>
                  </Link>
                  <Link to="/sign-in">
                    <Button variant="ghost" className="w-full font-heading text-base py-3">Sign In</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

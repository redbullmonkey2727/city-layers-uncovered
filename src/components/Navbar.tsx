import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Menu, X, User, Sparkles } from "lucide-react";

const Navbar = () => {
  const { user, subscription, signOut, loading } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isPro = subscription.plan === "pro";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-heading font-bold text-lg tracking-tight">
          <span className="text-gradient">Who Built All This?</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <Link to="/pricing">
                <Button variant="ghost" size="sm" className="font-heading text-sm gap-1.5 text-primary hover:text-primary hover:bg-primary/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  Pricing
                </Button>
              </Link>
              <Link to="/account">
                <Button variant="ghost" size="sm" className="font-heading text-sm gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  Account
                </Button>
              </Link>
              {isPro ? (
                <Badge className="text-[10px] uppercase tracking-wider bg-primary/15 text-primary border-primary/30">
                  ✦ Pro
                </Badge>
              ) : (
                <Link to="/pricing">
                  <Button size="sm" className="font-heading text-sm gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 ml-1">
                    <Zap className="w-3.5 h-3.5" />
                    Unlock Full Access
                  </Button>
                </Link>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground text-sm"
                onClick={async () => {
                  await signOut();
                  navigate("/");
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/pricing">
                <Button variant="ghost" size="sm" className="font-heading text-sm gap-1.5 text-primary hover:text-primary hover:bg-primary/10">
                  <Sparkles className="w-3.5 h-3.5" />
                  Pricing
                </Button>
              </Link>
              <Link to="/sign-in">
                <Button variant="ghost" size="sm" className="font-heading text-sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm" className="font-heading text-sm gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
                  <Zap className="w-3.5 h-3.5" />
                  Start Free
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-md px-6 py-4 space-y-3">
          {loading ? null : user ? (
            <>
              <Link to="/pricing" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full font-heading gap-1.5 text-primary">
                  <Sparkles className="w-4 h-4" /> Pricing
                </Button>
              </Link>
              <Link to="/account" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full font-heading gap-1.5">
                  <User className="w-4 h-4" /> Account
                </Button>
              </Link>
              {!isPro && (
                <Link to="/pricing" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full font-heading gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                    <Zap className="w-4 h-4" />
                    Unlock Full Access
                  </Button>
                </Link>
              )}
              {isPro && (
                <div className="flex justify-center">
                  <Badge className="text-[10px] uppercase tracking-wider bg-primary/15 text-primary border-primary/30">
                    ✦ Pro Member
                  </Badge>
                </div>
              )}
              <Button
                variant="ghost"
                className="w-full text-muted-foreground"
                onClick={async () => {
                  await signOut();
                  navigate("/");
                  setMobileOpen(false);
                }}
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/pricing" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full font-heading gap-1.5 text-primary">
                  <Sparkles className="w-4 h-4" /> Pricing
                </Button>
              </Link>
              <Link to="/sign-up" onClick={() => setMobileOpen(false)}>
                <Button className="w-full font-heading gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Zap className="w-4 h-4" />
                  Start Free
                </Button>
              </Link>
              <Link to="/sign-in" onClick={() => setMobileOpen(false)}>
                <Button variant="ghost" className="w-full font-heading">Sign In</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

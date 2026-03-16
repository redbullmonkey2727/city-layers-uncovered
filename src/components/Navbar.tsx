import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const { user, subscription, signOut, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-heading font-bold text-lg tracking-tight">
          <span className="text-gradient">Who Built All This?</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-heading">
            Pricing
          </Link>

          {loading ? null : user ? (
            <>
              <Badge
                variant={subscription.plan === "pro" ? "default" : "secondary"}
                className="text-[10px] uppercase tracking-wider"
              >
                {subscription.plan === "pro" ? "Pro" : "Free"}
              </Badge>
              <Link to="/account">
                <Button variant="ghost" size="sm" className="font-heading text-sm">
                  Account
                </Button>
              </Link>
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
              <Link to="/sign-in">
                <Button variant="ghost" size="sm" className="font-heading text-sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button size="sm" className="font-heading text-sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

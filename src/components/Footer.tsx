import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/30 py-10 px-6">
    <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <p className="text-sm text-muted-foreground font-heading">
        © {new Date().getFullYear()} Who Built All This? — A road trip companion
      </p>
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
        <Link to="/account" className="hover:text-foreground transition-colors">Account</Link>
        <Link to="/sign-up" className="hover:text-foreground transition-colors">Sign Up</Link>
      </div>
    </div>
  </footer>
);

export default Footer;

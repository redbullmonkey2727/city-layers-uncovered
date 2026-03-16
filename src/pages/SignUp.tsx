import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6 pt-14">
        <div className="text-center max-w-sm space-y-4">
          <h1 className="text-3xl font-heading font-bold">Check Your Email</h1>
          <p className="text-muted-foreground">
            We sent a confirmation link to <strong className="text-foreground">{email}</strong>.
            Click it to activate your account.
          </p>
          <Link to="/sign-in">
            <Button variant="outline" className="font-heading mt-4">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 pt-14">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold">Create Account</h1>
          <p className="text-muted-foreground mt-2">Start exploring the cities you drive through</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <Button type="submit" className="w-full font-heading" disabled={loading}>
            {loading ? "Creating account…" : "Sign Up"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;

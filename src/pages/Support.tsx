import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/services/analytics";
import { email as emailService } from "@/services/email";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import {
  LifeBuoy, Send, Loader2, CheckCircle2, MessageSquare,
  Bug, CreditCard, HelpCircle, Sparkles, Shield,
} from "lucide-react";

const categories = [
  { value: "general", label: "General Question", icon: HelpCircle },
  { value: "billing", label: "Billing & Subscription", icon: CreditCard },
  { value: "bug", label: "Bug Report", icon: Bug },
  { value: "feature", label: "Feature Request", icon: Sparkles },
  { value: "account", label: "Account Issue", icon: Shield },
];

const priorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const Support = () => {
  const { user, profile, subscription } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await (supabase.from("support_tickets") as any).insert({
        user_id: user.id,
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority,
      }).select("id").single();

      if (error) throw error;

      // Track event
      await analytics.track({
        name: "support_ticket_created",
        properties: { category, priority },
      });

      // Send confirmation email (mock)
      if (profile?.email) {
        await emailService.sendSupportTicketReceived(
          user.id,
          profile.email,
          data.id,
          subject.trim()
        );
      }

      setSubmitted(true);
      toast({ title: "Ticket submitted", description: "We'll get back to you soon." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast({ title: "Couldn't submit ticket", description: msg, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-0">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-3xl font-heading font-bold">Ticket Submitted</h1>
          <p className="text-muted-foreground">
            We've received your request and will respond within 24 hours.
            {profile?.email && (
              <> A confirmation has been sent to <strong>{profile.email}</strong>.</>
            )}
          </p>
          <Button
            variant="outline"
            className="font-heading mt-4"
            onClick={() => {
              setSubmitted(false);
              setSubject("");
              setDescription("");
              setCategory("general");
              setPriority("medium");
            }}
          >
            Submit Another Ticket
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-0">
      <div className="max-w-3xl mx-auto px-6 space-y-8 pb-16">
        {/* Header */}
        <div className="text-center">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-heading text-[11px] uppercase tracking-wider">
            Support
          </Badge>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-3">
            How can we help?
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Submit a ticket and our team will respond within 24 hours.
            {subscription.plan === "pro" && (
              <span className="text-primary"> As a Pro member, you get priority support.</span>
            )}
          </p>
        </div>

        {!user ? (
          <Card className="glass-card">
            <CardContent className="p-8 text-center space-y-4">
              <LifeBuoy className="w-10 h-10 text-muted-foreground/40 mx-auto" />
              <p className="text-muted-foreground">Please sign in to submit a support ticket.</p>
              <Button className="font-heading" onClick={() => window.location.href = "/sign-in"}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <label className="text-sm font-heading font-medium">Category</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCategory(value)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm font-heading transition-all ${
                      category === value
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border/50 bg-card/30 text-muted-foreground hover:border-border hover:bg-card/60"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-sm font-heading font-medium" htmlFor="subject">Subject</label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your issue"
                required
                className="w-full px-4 py-2.5 rounded-lg bg-card/60 border border-border/50 text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-heading font-medium" htmlFor="description">Description</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail. Include steps to reproduce if reporting a bug."
                required
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg bg-card/60 border border-border/50 text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
              />
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <label className="text-sm font-heading font-medium">Priority</label>
              <div className="flex gap-2">
                {priorities.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPriority(value)}
                    className={`px-4 py-2 rounded-lg border text-sm font-heading transition-all ${
                      priority === value
                        ? value === "high"
                          ? "border-destructive/50 bg-destructive/10 text-destructive"
                          : "border-primary/50 bg-primary/10 text-primary"
                        : "border-border/50 bg-card/30 text-muted-foreground hover:border-border"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Account context */}
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>Submitting as <strong className="text-foreground">{profile?.email}</strong></span>
                </div>
                <Badge variant="outline" className="text-[10px]">{subscription.plan} plan</Badge>
              </CardContent>
            </Card>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full font-heading gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 h-11"
              disabled={submitting || !subject.trim() || !description.trim()}
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
              ) : (
                <><Send className="w-4 h-4" /> Submit Ticket</>
              )}
            </Button>
          </form>
        )}

        {/* FAQ quick links */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-primary" /> Common Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { q: "How do I upgrade to Pro?", a: "Visit the Pricing page and click 'Unlock Full Access'." },
              { q: "How do I cancel my subscription?", a: "Go to Account → Manage Billing to cancel through Stripe." },
              { q: "My search isn't working", a: "Ensure you have remaining lookups. Pro users have unlimited searches." },
              { q: "How do I reset my password?", a: "Click 'Forgot password' on the Sign In page." },
            ].map(({ q, a }) => (
              <div key={q} className="py-2 border-b border-border/30 last:border-0">
                <p className="text-sm font-heading font-medium">{q}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default Support;

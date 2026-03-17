import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/services/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import {
  Send, Loader2, CheckCircle2, Building2, Users,
  Sparkles, Shield, Phone, ArrowRight,
} from "lucide-react";

const companySizes = ["1-10", "11-50", "51-200", "201-1000", "1000+"];
const sources = ["website", "referral", "linkedin", "conference", "other"];

const ContactSales = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    company: "", contact_name: "", contact_email: "", phone: "",
    company_size: "", industry: "", use_case: "", source: "website",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.contact_name.trim() || !form.contact_email.trim()) return;
    setSubmitting(true);
    try {
      const dealValue = form.company_size === "1000+" ? 5000 : form.company_size === "201-1000" ? 2500 :
        form.company_size === "51-200" ? 1200 : form.company_size === "11-50" ? 500 : 120;

      const { error } = await (supabase.from("leads") as any).insert({
        ...form,
        deal_value: dealValue,
        status: "new",
        stage: "mql",
      });
      if (error) throw error;

      analytics.track({ name: "feature_used", properties: { feature: "contact_sales", context: form.company_size } });
      setSubmitted(true);
      toast({ title: "Request received", description: "Our team will be in touch within 24 hours." });
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-3xl font-heading font-bold">We'll be in touch</h1>
          <p className="text-muted-foreground">
            Thanks for your interest. A member of our team will reach out within one business day to schedule a demo.
          </p>
          <div className="flex justify-center gap-3 pt-4">
            <Button variant="outline" className="font-heading" onClick={() => navigate("/pricing")}>View Pricing</Button>
            <Button className="font-heading" onClick={() => navigate("/")}>Explore Product</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-0">
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-5 gap-12">
          {/* Left side - value props */}
          <div className="md:col-span-2 space-y-6 pt-4">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 font-heading text-[11px] uppercase tracking-wider">
                Enterprise
              </Badge>
              <h1 className="text-3xl font-heading font-bold mb-3">
                Talk to our <span className="text-gradient">sales team</span>
              </h1>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Get a personalized demo, custom pricing for your team, and dedicated onboarding support.
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: Users, text: "Team plans with role-based access" },
                { icon: Building2, text: "Dedicated account management" },
                { icon: Shield, text: "Enterprise security & compliance" },
                { icon: Sparkles, text: "Custom integrations & API access" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - form */}
          <div className="md:col-span-3">
            <Card className="glass-card border-primary/20">
              <CardContent className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Full name *" value={form.contact_name} onChange={(v) => handleChange("contact_name", v)} placeholder="Jane Smith" required />
                    <FormField label="Work email *" value={form.contact_email} onChange={(v) => handleChange("contact_email", v)} placeholder="jane@company.com" type="email" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Company *" value={form.company} onChange={(v) => handleChange("company", v)} placeholder="Acme Corp" required />
                    <FormField label="Phone" value={form.phone} onChange={(v) => handleChange("phone", v)} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-heading font-medium">Company size</label>
                      <select
                        value={form.company_size}
                        onChange={(e) => handleChange("company_size", e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-card/60 border border-border/50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="">Select...</option>
                        {companySizes.map((s) => <option key={s} value={s}>{s} employees</option>)}
                      </select>
                    </div>
                    <FormField label="Industry" value={form.industry} onChange={(v) => handleChange("industry", v)} placeholder="Technology, Finance..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-heading font-medium">How would you use the product?</label>
                    <textarea
                      value={form.use_case}
                      onChange={(e) => handleChange("use_case", e.target.value)}
                      placeholder="Tell us about your team's needs..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-lg bg-card/60 border border-border/50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full font-heading gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 h-11"
                    disabled={submitting || !form.company.trim() || !form.contact_name.trim() || !form.contact_email.trim()}
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submitting ? "Submitting..." : "Request a Demo"}
                  </Button>
                  <p className="text-[11px] text-muted-foreground/60 text-center">
                    By submitting, you agree to our privacy policy. We'll respond within one business day.
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

function FormField({ label, value, onChange, placeholder, type = "text", required = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string; required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-heading font-medium">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 rounded-lg bg-card/60 border border-border/50 text-foreground placeholder:text-muted-foreground/50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </div>
  );
}

export default ContactSales;

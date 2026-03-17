import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Footer from "@/components/Footer";
import {
  Loader2, Users, TrendingUp, Target, Phone, Mail,
  Building2, DollarSign, ArrowRight, CheckCircle2,
  Clock, AlertTriangle, BarChart3, Filter,
} from "lucide-react";

interface Lead {
  id: string;
  company: string;
  contact_name: string;
  contact_email: string;
  company_size: string;
  use_case: string;
  source: string;
  status: string;
  stage: string;
  deal_value: number;
  notes: string;
  created_at: string;
}

const STAGES = [
  { key: "mql", label: "MQL", color: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
  { key: "sql", label: "SQL", color: "bg-purple-400/10 text-purple-400 border-purple-400/20" },
  { key: "opportunity", label: "Opportunity", color: "bg-primary/10 text-primary border-primary/20" },
  { key: "proposal", label: "Proposal", color: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20" },
  { key: "closed_won", label: "Closed Won", color: "bg-green-400/10 text-green-400 border-green-400/20" },
  { key: "closed_lost", label: "Closed Lost", color: "bg-destructive/10 text-destructive border-destructive/20" },
];

const Sales = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/sign-in");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    loadLeads();
  }, [user]);

  const loadLeads = async () => {
    setLoading(true);
    const { data } = await (supabase.from("leads") as any)
      .select("*")
      .order("created_at", { ascending: false });
    setLeads(data ?? []);
    setLoading(false);
  };

  const updateLeadStage = async (id: string, stage: string) => {
    await (supabase.from("leads") as any).update({ stage, updated_at: new Date().toISOString() }).eq("id", id);
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, stage } : l)));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-14">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }
  if (!user) return null;

  const filteredLeads = stageFilter ? leads.filter((l) => l.stage === stageFilter) : leads;
  const totalPipeline = leads.filter((l) => !["closed_won", "closed_lost"].includes(l.stage)).reduce((s, l) => s + (l.deal_value || 0), 0);
  const closedWon = leads.filter((l) => l.stage === "closed_won").reduce((s, l) => s + (l.deal_value || 0), 0);
  const conversionRate = leads.length > 0 ? Math.round((leads.filter((l) => l.stage === "closed_won").length / leads.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background pt-20 pb-0">
      <div className="max-w-7xl mx-auto px-6 space-y-8 pb-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold"><span className="text-gradient">Sales Pipeline</span></h1>
            <p className="text-muted-foreground mt-1 text-sm">Track leads, demos, and opportunities</p>
          </div>
          <Button variant="outline" size="sm" className="font-heading gap-1.5" onClick={() => navigate("/contact-sales")}>
            <Phone className="w-3.5 h-3.5" /> View Lead Form
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard icon={<Users className="w-4 h-4" />} label="Total Leads" value={leads.length} />
          <KPICard icon={<Target className="w-4 h-4" />} label="Pipeline Value" value={`$${totalPipeline.toLocaleString()}`} accent />
          <KPICard icon={<DollarSign className="w-4 h-4" />} label="Closed Won" value={`$${closedWon.toLocaleString()}`} />
          <KPICard icon={<TrendingUp className="w-4 h-4" />} label="Win Rate" value={`${conversionRate}%`} />
        </div>

        {/* Pipeline stages */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={stageFilter === null ? "default" : "outline"}
            size="sm"
            className="font-heading text-xs"
            onClick={() => setStageFilter(null)}
          >
            All ({leads.length})
          </Button>
          {STAGES.map((s) => {
            const count = leads.filter((l) => l.stage === s.key).length;
            return (
              <Button
                key={s.key}
                variant={stageFilter === s.key ? "default" : "outline"}
                size="sm"
                className="font-heading text-xs"
                onClick={() => setStageFilter(s.key)}
              >
                {s.label} ({count})
              </Button>
            );
          })}
        </div>

        {/* Leads table */}
        <Card className="glass-card">
          <CardContent className="p-0">
            {filteredLeads.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Target className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">No leads yet. Share the Contact Sales form to start capturing leads.</p>
                <Button variant="outline" size="sm" className="font-heading" onClick={() => navigate("/contact-sales")}>
                  Open Lead Form
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border/50 text-left">
                      <th className="px-4 py-3 text-[11px] font-heading uppercase tracking-wider text-muted-foreground">Company</th>
                      <th className="px-4 py-3 text-[11px] font-heading uppercase tracking-wider text-muted-foreground">Contact</th>
                      <th className="px-4 py-3 text-[11px] font-heading uppercase tracking-wider text-muted-foreground">Stage</th>
                      <th className="px-4 py-3 text-[11px] font-heading uppercase tracking-wider text-muted-foreground">Value</th>
                      <th className="px-4 py-3 text-[11px] font-heading uppercase tracking-wider text-muted-foreground">Source</th>
                      <th className="px-4 py-3 text-[11px] font-heading uppercase tracking-wider text-muted-foreground">Created</th>
                      <th className="px-4 py-3 text-[11px] font-heading uppercase tracking-wider text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => {
                      const stageInfo = STAGES.find((s) => s.key === lead.stage) || STAGES[0];
                      return (
                        <tr key={lead.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <span className="text-sm font-heading font-medium">{lead.company}</span>
                              {lead.company_size && (
                                <span className="text-[10px] text-muted-foreground ml-2">({lead.company_size})</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm">{lead.contact_name}</div>
                            <div className="text-[11px] text-muted-foreground">{lead.contact_email}</div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`text-[10px] ${stageInfo.color}`}>{stageInfo.label}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-heading">${(lead.deal_value || 0).toLocaleString()}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="text-[10px]">{lead.source}</Badge>
                          </td>
                          <td className="px-4 py-3 text-[11px] text-muted-foreground">{new Date(lead.created_at).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <select
                              value={lead.stage}
                              onChange={(e) => updateLeadStage(lead.id, e.target.value)}
                              className="text-xs bg-card/60 border border-border/50 rounded px-2 py-1 font-heading"
                            >
                              {STAGES.map((s) => (
                                <option key={s.key} value={s.key}>{s.label}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

function KPICard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string | number; accent?: boolean }) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={accent ? "text-primary" : "text-muted-foreground"}>{icon}</span>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-heading">{label}</span>
        </div>
        <span className={`text-2xl font-heading font-bold ${accent ? "text-primary" : ""}`}>{value}</span>
      </CardContent>
    </Card>
  );
}

export default Sales;

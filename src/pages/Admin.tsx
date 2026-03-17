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
  getIntegrationHealth,
  getRecentWebhookEvents,
  getCRMSyncStats,
  type IntegrationHealth,
} from "@/services/integrations";
import {
  Loader2, Users, CreditCard, Activity, BarChart3,
  CheckCircle2, AlertTriangle, XCircle, Radio,
  ArrowUpRight, Webhook, Mail, Shield, Database,
  TrendingUp, Clock, Search, LifeBuoy, Zap, Globe,
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  proUsers: number;
  totalSearches: number;
  totalTickets: number;
  openTickets: number;
  recentSignups: number;
}

const statusIcons: Record<string, React.ReactNode> = {
  healthy: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />,
  degraded: <AlertTriangle className="w-3.5 h-3.5 text-yellow-400" />,
  down: <XCircle className="w-3.5 h-3.5 text-destructive" />,
  mock: <Radio className="w-3.5 h-3.5 text-blue-400" />,
};

const statusColors: Record<string, string> = {
  healthy: "bg-green-400/10 text-green-400 border-green-400/20",
  degraded: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  down: "bg-destructive/10 text-destructive border-destructive/20",
  mock: "bg-blue-400/10 text-blue-400 border-blue-400/20",
};

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationHealth[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<any[]>([]);
  const [crmStats, setCrmStats] = useState({ total: 0, synced: 0, failed: 0, pending: 0 });
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/sign-in");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [
        integrationData,
        webhookData,
        crmData,
      ] = await Promise.all([
        getIntegrationHealth(),
        getRecentWebhookEvents(10),
        getCRMSyncStats(),
      ]);

      setIntegrations(integrationData);
      setWebhookEvents(webhookData);
      setCrmStats(crmData);

      // Fetch stats from DB
      const [profilesRes, proRes, searchRes, ticketsRes, openTicketsRes, recentSignupsRes, recentSearchRes, ticketListRes, notifRes] =
        await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("profiles").select("id", { count: "exact", head: true }).eq("plan", "pro"),
          supabase.from("search_events").select("id", { count: "exact", head: true }),
          (supabase.from("support_tickets") as any).select("id", { count: "exact", head: true }),
          (supabase.from("support_tickets") as any).select("id", { count: "exact", head: true }).eq("status", "open"),
          supabase.from("profiles").select("id", { count: "exact", head: true })
            .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          supabase.from("search_events").select("id, city_name, state_region, created_at, user_id")
            .order("created_at", { ascending: false }).limit(10),
          (supabase.from("support_tickets") as any).select("*")
            .order("created_at", { ascending: false }).limit(10),
          (supabase.from("notification_log") as any).select("*")
            .order("created_at", { ascending: false }).limit(10),
        ]);

      setStats({
        totalUsers: profilesRes.count ?? 0,
        proUsers: proRes.count ?? 0,
        totalSearches: searchRes.count ?? 0,
        totalTickets: ticketsRes.count ?? 0,
        openTickets: openTicketsRes.count ?? 0,
        recentSignups: recentSignupsRes.count ?? 0,
      });
      setRecentSearches(recentSearchRes.data ?? []);
      setTickets(ticketListRes.data ?? []);
      setNotifications(notifRes.data ?? []);
    } catch (e) {
      console.error("Dashboard load error:", e);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-14">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  const liveCount = integrations.filter((i) => i.mode === "live").length;
  const mockCount = integrations.filter((i) => i.mode === "mock").length;
  const healthyCount = integrations.filter((i) => i.status === "healthy").length;

  return (
    <div className="min-h-screen bg-background pt-20 pb-0">
      <div className="max-w-7xl mx-auto px-6 space-y-8 pb-16">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold">
              <span className="text-gradient">Ops Dashboard</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              System health, user metrics, and integration status
            </p>
          </div>
          <Button variant="outline" size="sm" className="font-heading gap-1.5" onClick={loadDashboard}>
            <Activity className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        {/* KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <StatCard icon={<Users className="w-4 h-4" />} label="Total Users" value={stats.totalUsers} />
            <StatCard icon={<CreditCard className="w-4 h-4" />} label="Pro Subscribers" value={stats.proUsers} accent />
            <StatCard icon={<Search className="w-4 h-4" />} label="Total Searches" value={stats.totalSearches} />
            <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Signups (7d)" value={stats.recentSignups} />
            <StatCard icon={<LifeBuoy className="w-4 h-4" />} label="Open Tickets" value={stats.openTickets} warn={stats.openTickets > 0} />
            <StatCard icon={<Zap className="w-4 h-4" />} label="Conversion" value={stats.totalUsers > 0 ? `${Math.round((stats.proUsers / stats.totalUsers) * 100)}%` : "—"} />
          </div>
        )}

        <Tabs defaultValue="integrations" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border/50">
            <TabsTrigger value="integrations" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <Globe className="w-3.5 h-3.5" /> Integrations
            </TabsTrigger>
            <TabsTrigger value="events" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <Activity className="w-3.5 h-3.5" /> Events
            </TabsTrigger>
            <TabsTrigger value="crm" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <Users className="w-3.5 h-3.5" /> CRM
            </TabsTrigger>
            <TabsTrigger value="support" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <LifeBuoy className="w-3.5 h-3.5" /> Support
            </TabsTrigger>
            <TabsTrigger value="email" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <Mail className="w-3.5 h-3.5" /> Email
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <Webhook className="w-3.5 h-3.5" /> Webhooks
            </TabsTrigger>
          </TabsList>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
              <span>{healthyCount} healthy</span>
              <span>·</span>
              <span>{liveCount} live</span>
              <span>·</span>
              <span>{mockCount} mock</span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrations.map((integration) => (
                <Card key={integration.name} className="glass-card">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {statusIcons[integration.status]}
                        <span className="font-heading font-semibold text-sm">{integration.displayName}</span>
                      </div>
                      <Badge className={`text-[10px] uppercase ${statusColors[integration.status]}`}>
                        {integration.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{integration.details}</p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/60">
                      <span className="uppercase tracking-wider">{integration.category}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(integration.lastChecked).toLocaleTimeString()}
                      </span>
                    </div>
                    {integration.docsUrl && (
                      <a
                        href={integration.docsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-primary/60 hover:text-primary mt-2 transition-colors"
                      >
                        API Docs <ArrowUpRight className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" /> Recent Search Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentSearches.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No search events yet</p>
                ) : (
                  <div className="space-y-1">
                    {recentSearches.map((s: any) => (
                      <div key={s.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 text-sm">
                        <span className="font-heading">{s.city_name}{s.state_region ? `, ${s.state_region}` : ""}</span>
                        <span className="text-[11px] text-muted-foreground">{new Date(s.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CRM Tab */}
          <TabsContent value="crm" className="space-y-4">
            <div className="grid md:grid-cols-4 gap-4">
              <StatCard icon={<Activity className="w-4 h-4" />} label="Total Syncs" value={crmStats.total} />
              <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Synced" value={crmStats.synced} accent />
              <StatCard icon={<XCircle className="w-4 h-4" />} label="Failed" value={crmStats.failed} warn={crmStats.failed > 0} />
              <StatCard icon={<Clock className="w-4 h-4" />} label="Pending" value={crmStats.pending} />
            </div>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Database className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-sm">HubSpot CRM (Mock)</h3>
                    <p className="text-xs text-muted-foreground">Contact lifecycle and deal pipeline sync</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Pipeline Stages</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["Subscriber", "Lead", "Opportunity", "Customer", "Churned"].map((s) => (
                        <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground text-xs block mb-1">Sync Events</span>
                    <div className="flex flex-wrap gap-1.5">
                      {["signup", "upgrade", "cancellation"].map((e) => (
                        <Badge key={e} variant="outline" className="text-[10px]">{e}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-primary" /> Recent Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tickets.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No support tickets yet</p>
                ) : (
                  <div className="space-y-1">
                    {tickets.map((t: any) => (
                      <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                        <div>
                          <span className="text-sm font-heading">{t.subject}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                            <Badge className={`text-[10px] ${t.status === "open" ? "bg-green-400/10 text-green-400 border-green-400/20" : "bg-muted text-muted-foreground"}`}>
                              {t.status}
                            </Badge>
                            <Badge variant="outline" className={`text-[10px] ${t.priority === "high" ? "text-destructive border-destructive/30" : ""}`}>
                              {t.priority}
                            </Badge>
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground flex-shrink-0">{new Date(t.created_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="space-y-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" /> Notification Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No notifications sent yet</p>
                ) : (
                  <div className="space-y-1">
                    {notifications.map((n: any) => (
                      <div key={n.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                        <div>
                          <span className="text-sm font-heading">{n.template_name}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground">{n.recipient}</span>
                            <Badge className={`text-[10px] ${n.status === "sent" ? "bg-green-400/10 text-green-400 border-green-400/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                              {n.status}
                            </Badge>
                            <Badge variant="outline" className="text-[10px]">{n.provider}</Badge>
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground flex-shrink-0">{new Date(n.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Webhooks Tab */}
          <TabsContent value="webhooks" className="space-y-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Webhook className="w-4 h-4 text-primary" /> Stripe Webhook Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {webhookEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No webhook events recorded yet</p>
                ) : (
                  <div className="space-y-1">
                    {webhookEvents.map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                        <div>
                          <span className="text-sm font-heading font-mono">{e.event_type}</span>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-muted-foreground font-mono">{e.stripe_event_id?.slice(0, 20)}…</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-muted-foreground flex-shrink-0">{new Date(e.created_at).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong className="text-foreground">Webhook Architecture:</strong></p>
                    <p>• Signature verification via <code className="text-primary/80">STRIPE_WEBHOOK_SECRET</code></p>
                    <p>• Idempotency check using <code className="text-primary/80">stripe_event_id</code> in billing_events</p>
                    <p>• Customer resolution by stripe_customer_id → profile, with email fallback</p>
                    <p>• Events: checkout.session.completed, subscription.created/updated/deleted, invoice.payment_failed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

// ─── Stat Card Component ────────────────────────────────────

function StatCard({ icon, label, value, accent, warn }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  accent?: boolean;
  warn?: boolean;
}) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={warn ? "text-destructive" : accent ? "text-primary" : "text-muted-foreground"}>{icon}</span>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-heading">{label}</span>
        </div>
        <span className={`text-2xl font-heading font-bold ${warn ? "text-destructive" : accent ? "text-primary" : ""}`}>
          {value}
        </span>
      </CardContent>
    </Card>
  );
}

export default Admin;

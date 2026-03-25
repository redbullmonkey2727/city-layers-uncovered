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
  Loader2, Users, CreditCard, Activity, BarChart3,
  CheckCircle2, AlertTriangle, XCircle, Radio,
  ArrowUpRight, Webhook, Mail, Shield,
  TrendingUp, Clock, Search, LifeBuoy, Zap, Globe,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";

interface DashboardStats {
  totalUsers: number;
  proUsers: number;
  totalSearches: number;
  totalTickets: number;
  openTickets: number;
  recentSignups: number;
}

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(38 95% 52%)",
  "hsl(270 65% 55%)",
  "hsl(185 55% 38%)",
  "hsl(340 75% 55%)",
];

const Admin = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [searchesByDay, setSearchesByDay] = useState<any[]>([]);
  const [signupsByDay, setSignupsByDay] = useState<any[]>([]);
  const [topCities, setTopCities] = useState<any[]>([]);
  const [ticketsByCategory, setTicketsByCategory] = useState<any[]>([]);
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
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        profilesRes, proRes, searchRes, ticketsRes, openTicketsRes, recentSignupsRes,
        recentSearchRes, ticketListRes, allSearches30d, allProfiles30d, allTickets,
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("plan", "pro"),
        supabase.from("search_events").select("id", { count: "exact", head: true }),
        (supabase.from("support_tickets") as any).select("id", { count: "exact", head: true }),
        (supabase.from("support_tickets") as any).select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
        supabase.from("search_events").select("id, city_name, state_region, created_at, user_id")
          .order("created_at", { ascending: false }).limit(15),
        (supabase.from("support_tickets") as any).select("*")
          .order("created_at", { ascending: false }).limit(10),
        // For charts: searches in last 30 days
        supabase.from("search_events").select("city_name, created_at")
          .gte("created_at", thirtyDaysAgo).order("created_at", { ascending: true }).limit(1000),
        // For charts: signups in last 30 days
        supabase.from("profiles").select("created_at")
          .gte("created_at", thirtyDaysAgo).order("created_at", { ascending: true }).limit(1000),
        // For charts: tickets by category
        (supabase.from("support_tickets") as any).select("category, status, priority").limit(500),
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

      // Process searches by day
      const searchDayMap: Record<string, number> = {};
      const cityCount: Record<string, number> = {};
      for (const s of allSearches30d.data ?? []) {
        const day = new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        searchDayMap[day] = (searchDayMap[day] || 0) + 1;
        if (s.city_name) {
          cityCount[s.city_name] = (cityCount[s.city_name] || 0) + 1;
        }
      }
      setSearchesByDay(Object.entries(searchDayMap).map(([day, count]) => ({ day, searches: count })));

      // Top cities
      const sorted = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 8);
      setTopCities(sorted.map(([city, count]) => ({ city, count })));

      // Process signups by day
      const signupDayMap: Record<string, number> = {};
      for (const p of allProfiles30d.data ?? []) {
        const day = new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
        signupDayMap[day] = (signupDayMap[day] || 0) + 1;
      }
      setSignupsByDay(Object.entries(signupDayMap).map(([day, count]) => ({ day, signups: count })));

      // Tickets by category
      const catMap: Record<string, number> = {};
      for (const t of allTickets.data ?? []) {
        catMap[t.category] = (catMap[t.category] || 0) + 1;
      }
      setTicketsByCategory(Object.entries(catMap).map(([name, value]) => ({ name, value })));

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
              Real-time analytics, user metrics, and operational health
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

        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border/50">
            <TabsTrigger value="analytics" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <BarChart3 className="w-3.5 h-3.5" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="searches" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <Search className="w-3.5 h-3.5" /> Searches
            </TabsTrigger>
            <TabsTrigger value="users" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <Users className="w-3.5 h-3.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="support" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <LifeBuoy className="w-3.5 h-3.5" /> Support
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab — Charts */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Searches over time */}
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-heading flex items-center gap-2">
                    <Search className="w-4 h-4 text-primary" /> Searches (30d)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {searchesByDay.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={searchesByDay}>
                        <defs>
                          <linearGradient id="searchGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Area type="monotone" dataKey="searches" stroke="hsl(var(--primary))" fill="url(#searchGrad)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">No search data yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Top cities */}
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-heading flex items-center gap-2">
                    <Globe className="w-4 h-4 text-primary" /> Top Cities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topCities.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={topCities} layout="vertical">
                        <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="city" type="category" width={100} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">No city data yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Signups over time */}
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-heading flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" /> Signups (30d)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {signupsByDay.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={signupsByDay}>
                        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        <Line type="monotone" dataKey="signups" stroke="hsl(var(--secondary))" strokeWidth={2} dot={{ fill: "hsl(var(--secondary))", r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">No signup data yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Tickets by category */}
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-heading flex items-center gap-2">
                    <LifeBuoy className="w-4 h-4 text-primary" /> Tickets by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ticketsByCategory.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width="50%" height={180}>
                        <PieChart>
                          <Pie data={ticketsByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} strokeWidth={2} stroke="hsl(var(--card))">
                            {ticketsByCategory.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2">
                        {ticketsByCategory.map((cat, i) => (
                          <div key={cat.name} className="flex items-center gap-2 text-xs">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                            <span className="text-muted-foreground capitalize">{cat.name}</span>
                            <span className="font-heading font-semibold">{cat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-10">No ticket data yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Searches Tab */}
          <TabsContent value="searches" className="space-y-4">
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

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            {stats && (
              <div className="grid md:grid-cols-3 gap-4">
                <Card className="glass-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-heading font-bold text-primary mb-1">{stats.totalUsers}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-heading">Total Users</div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-heading font-bold text-secondary mb-1">{stats.proUsers}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-heading">Pro Subscribers</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {stats.totalUsers > 0 ? `${Math.round((stats.proUsers / stats.totalUsers) * 100)}%` : "0%"} conversion
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl font-heading font-bold mb-1">{stats.recentSignups}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider font-heading">Signups (7d)</div>
                  </CardContent>
                </Card>
              </div>
            )}
            {signupsByDay.length > 0 && (
              <Card className="glass-card">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-heading">Signup Trend (30d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={signupsByDay}>
                      <defs>
                        <linearGradient id="signupGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
                      <Area type="monotone" dataKey="signups" stroke="hsl(var(--secondary))" fill="url(#signupGrad)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
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
        </Tabs>
      </div>
      <Footer />
    </div>
  );
};

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

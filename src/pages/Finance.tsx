import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import {
  Loader2, DollarSign, TrendingUp, TrendingDown, Users,
  CreditCard, AlertTriangle, CheckCircle2, ArrowUpRight,
  BarChart3, Calendar, RefreshCw,
} from "lucide-react";

interface FinanceStats {
  totalUsers: number;
  proUsers: number;
  mrr: number;
  arr: number;
  churnedThisMonth: number;
  failedPayments: number;
  totalRevenue: number;
  avgRevenuePerUser: number;
}

const Finance = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) navigate("/sign-in");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    loadFinance();
  }, [user]);

  const loadFinance = async () => {
    setLoading(true);
    try {
      const [profilesRes, proRes, subsRes, invoicesRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("plan", "pro"),
        supabase.from("subscriptions").select("*").order("created_at", { ascending: false }),
        (supabase.from("invoices") as any).select("*").order("created_at", { ascending: false }).limit(20),
      ]);

      const totalUsers = profilesRes.count ?? 0;
      const proUsers = proRes.count ?? 0;
      const mrr = proUsers * 9.99;
      const canceledSubs = (subsRes.data ?? []).filter((s: any) => s.status === "canceled");

      setStats({
        totalUsers,
        proUsers,
        mrr: Math.round(mrr * 100) / 100,
        arr: Math.round(mrr * 12 * 100) / 100,
        churnedThisMonth: canceledSubs.length,
        failedPayments: 0,
        totalRevenue: Math.round(mrr * 100) / 100,
        avgRevenuePerUser: totalUsers > 0 ? Math.round((mrr / totalUsers) * 100) / 100 : 0,
      });
      setSubscriptions(subsRes.data ?? []);
      setInvoices(invoicesRes.data ?? []);
    } catch (e) {
      console.error("Finance load error:", e);
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
  if (!user || !stats) return null;

  return (
    <div className="min-h-screen bg-background pt-20 pb-0">
      <div className="max-w-7xl mx-auto px-6 space-y-8 pb-16">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold"><span className="text-gradient">Finance & Revenue</span></h1>
            <p className="text-muted-foreground mt-1 text-sm">MRR, subscriptions, invoices, and billing health</p>
          </div>
          <Button variant="outline" size="sm" className="font-heading gap-1.5" onClick={loadFinance}>
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
        </div>

        {/* Revenue KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <RevenueCard icon={<DollarSign className="w-4 h-4" />} label="MRR" value={`$${stats.mrr.toLocaleString()}`} accent />
          <RevenueCard icon={<TrendingUp className="w-4 h-4" />} label="ARR" value={`$${stats.arr.toLocaleString()}`} />
          <RevenueCard icon={<Users className="w-4 h-4" />} label="Paying Customers" value={stats.proUsers} />
          <RevenueCard icon={<BarChart3 className="w-4 h-4" />} label="ARPU" value={`$${stats.avgRevenuePerUser}`} />
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <RevenueCard icon={<CreditCard className="w-4 h-4" />} label="Total Users" value={stats.totalUsers} />
          <RevenueCard icon={<TrendingDown className="w-4 h-4" />} label="Churned (period)" value={stats.churnedThisMonth} warn={stats.churnedThisMonth > 0} />
          <RevenueCard icon={<AlertTriangle className="w-4 h-4" />} label="Failed Payments" value={stats.failedPayments} warn={stats.failedPayments > 0} />
        </div>

        {/* Revenue breakdown */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Subscriptions */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" /> Active Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No subscriptions recorded yet.</p>
              ) : (
                <div className="space-y-1">
                  {subscriptions.slice(0, 10).map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={`text-[10px] ${sub.status === "active" ? "bg-green-400/10 text-green-400 border-green-400/20" : "bg-muted text-muted-foreground"}`}>
                            {sub.status}
                          </Badge>
                          <span className="text-xs font-mono text-muted-foreground">{sub.stripe_subscription_id?.slice(0, 20)}…</span>
                        </div>
                        {sub.current_period_end && (
                          <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
                            <Calendar className="w-2.5 h-2.5" />
                            {sub.cancel_at_period_end ? "Expires" : "Renews"}: {new Date(sub.current_period_end).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <span className="text-sm font-heading font-semibold">$9.99/mo</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" /> Invoice History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <DollarSign className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">No invoices yet. Invoices sync from Stripe on payment.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {invoices.map((inv: any) => (
                    <div key={inv.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                      <div>
                        <span className="text-sm font-heading">${(inv.amount / 100).toFixed(2)} {inv.currency.toUpperCase()}</span>
                        <Badge className={`text-[10px] ml-2 ${inv.status === "paid" ? "bg-green-400/10 text-green-400 border-green-400/20" : "bg-yellow-400/10 text-yellow-400 border-yellow-400/20"}`}>
                          {inv.status}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue recognition note */}
        <Card className="glass-card">
          <CardContent className="p-4 flex items-start gap-3">
            <BarChart3 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong className="text-foreground">Revenue Recognition & Accounting:</strong></p>
              <p>• MRR is calculated as (active Pro subscribers × $9.99). Revenue is recognized ratably over the subscription period per ASC 606.</p>
              <p>• Invoices sync from Stripe via webhooks. Failed payments enter a 3-attempt dunning cycle before subscription cancellation.</p>
              <p>• For accounting export, revenue data maps to GL accounts: 4000 (SaaS Revenue), 4100 (Deferred Revenue), 1200 (Accounts Receivable).</p>
              <p>• Tax/VAT is handled by Stripe Tax. Credit memos and refunds are tracked in the billing_events audit table.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

function RevenueCard({ icon, label, value, accent, warn }: {
  icon: React.ReactNode; label: string; value: string | number; accent?: boolean; warn?: boolean;
}) {
  return (
    <Card className="glass-card">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={warn ? "text-destructive" : accent ? "text-primary" : "text-muted-foreground"}>{icon}</span>
          <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-heading">{label}</span>
        </div>
        <span className={`text-2xl font-heading font-bold ${warn ? "text-destructive" : accent ? "text-primary" : ""}`}>{value}</span>
      </CardContent>
    </Card>
  );
}

export default Finance;

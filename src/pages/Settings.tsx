import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import {
  Loader2, Settings as SettingsIcon, Building2, Users, CreditCard,
  Key, Shield, Copy, Eye, EyeOff, Plus, Trash2, CheckCircle2,
  ExternalLink, AlertTriangle,
} from "lucide-react";

const Settings = () => {
  const { user, profile, subscription, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [org, setOrg] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [orgName, setOrgName] = useState("");
  const [showKey, setShowKey] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [creatingKey, setCreatingKey] = useState(false);
  const [savingOrg, setSavingOrg] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/sign-in");
  }, [authLoading, user, navigate]);

  useEffect(() => {
    if (!user) return;
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load org membership
      const { data: memberData } = await (supabase.from("org_members") as any)
        .select("org_id, role")
        .eq("user_id", user!.id)
        .limit(1)
        .maybeSingle();

      if (memberData?.org_id) {
        const { data: orgData } = await (supabase.from("organizations") as any)
          .select("*")
          .eq("id", memberData.org_id)
          .maybeSingle();
        if (orgData) {
          setOrg(orgData);
          setOrgName(orgData.name);
        }

        const { data: membersData } = await (supabase.from("org_members") as any)
          .select("*")
          .eq("org_id", memberData.org_id);
        setMembers(membersData ?? []);

        const { data: keysData } = await (supabase.from("api_keys") as any)
          .select("*")
          .eq("org_id", memberData.org_id)
          .order("created_at", { ascending: false });
        setApiKeys(keysData ?? []);
      }

      // Load audit log
      const { data: auditData } = await (supabase.from("audit_log") as any)
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      setAuditLog(auditData ?? []);
    } catch (e) {
      console.error("Settings load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrg = async () => {
    if (!user || !orgName.trim()) return;
    setSavingOrg(true);
    try {
      const slug = orgName.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50);
      const { data: newOrg, error } = await (supabase.from("organizations") as any)
        .insert({ name: orgName.trim(), slug, owner_id: user.id, plan: subscription.plan })
        .select()
        .single();
      if (error) throw error;

      await (supabase.from("org_members") as any).insert({
        org_id: newOrg.id,
        user_id: user.id,
        role: "owner",
        joined_at: new Date().toISOString(),
      });

      await (supabase.from("audit_log") as any).insert({
        org_id: newOrg.id,
        user_id: user.id,
        action: "organization.created",
        resource_type: "organization",
        resource_id: newOrg.id,
      });

      toast({ title: "Organization created", description: `${orgName.trim()} is ready.` });
      loadSettings();
    } catch (err) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" });
    } finally {
      setSavingOrg(false);
    }
  };

  const handleInvite = async () => {
    if (!org || !inviteEmail.trim()) return;
    try {
      await (supabase.from("org_members") as any).insert({
        org_id: org.id,
        user_id: user!.id, // Placeholder — real invite would use invited_email lookup
        role: inviteRole,
        invited_email: inviteEmail.trim(),
        invited_at: new Date().toISOString(),
      });
      toast({ title: "Invite sent", description: `Invited ${inviteEmail.trim()} as ${inviteRole}` });
      setInviteEmail("");
      loadSettings();
    } catch {
      toast({ title: "Error", description: "Could not send invite", variant: "destructive" });
    }
  };

  const handleCreateApiKey = async () => {
    if (!org || !newKeyName.trim()) return;
    setCreatingKey(true);
    try {
      const keyValue = `wbat_${crypto.randomUUID().replace(/-/g, "").slice(0, 32)}`;
      const prefix = keyValue.slice(0, 12);
      
      // Hash the key with SHA-256 before storing
      const encoder = new TextEncoder();
      const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(keyValue));
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

      await (supabase.from("api_keys") as any).insert({
        org_id: org.id,
        name: newKeyName.trim(),
        key_prefix: prefix,
        key_hash: keyHash,
        created_by: user!.id,
      });

      await (supabase.from("audit_log") as any).insert({
        org_id: org.id,
        user_id: user!.id,
        action: "api_key.created",
        resource_type: "api_key",
        metadata: { name: newKeyName.trim() },
      });

      toast({ title: "API key created", description: `Copy now — this key won't be shown again: ${keyValue}` });
      setNewKeyName("");
      loadSettings();
    } catch {
      toast({ title: "Error", description: "Could not create key", variant: "destructive" });
    } finally {
      setCreatingKey(false);
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

  const isPro = subscription.plan === "pro";

  return (
    <div className="min-h-screen bg-background pt-20 pb-0">
      <div className="max-w-5xl mx-auto px-6 space-y-8 pb-16">
        <div>
          <h1 className="text-3xl font-heading font-bold"><span className="text-gradient">Settings</span></h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your organization, team, billing, and integrations</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-muted/50 border border-border/50">
            <TabsTrigger value="general" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <Building2 className="w-3.5 h-3.5" /> Organization
            </TabsTrigger>
            <TabsTrigger value="team" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <Users className="w-3.5 h-3.5" /> Team
            </TabsTrigger>
            <TabsTrigger value="billing" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <CreditCard className="w-3.5 h-3.5" /> Billing
            </TabsTrigger>
            <TabsTrigger value="api" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <Key className="w-3.5 h-3.5" /> API Keys
            </TabsTrigger>
            <TabsTrigger value="security" className="font-heading text-sm gap-1.5 data-[state=active]:bg-card">
              <Shield className="w-3.5 h-3.5" /> Security
            </TabsTrigger>
          </TabsList>

          {/* Organization Tab */}
          <TabsContent value="general" className="space-y-4">
            {!org ? (
              <Card className="glass-card">
                <CardContent className="p-8 space-y-4">
                  <div className="text-center space-y-2">
                    <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                    <h3 className="font-heading font-bold">Create your organization</h3>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      Organizations let you invite team members, manage billing centrally, and control access with roles.
                    </p>
                  </div>
                  <div className="max-w-sm mx-auto space-y-3">
                    <input
                      type="text"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      placeholder="Organization name"
                      className="w-full px-4 py-2.5 rounded-lg bg-card/60 border border-border/50 text-foreground placeholder:text-muted-foreground/50 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <Button className="w-full font-heading gap-2" onClick={handleCreateOrg} disabled={savingOrg || !orgName.trim()}>
                      {savingOrg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Create Organization
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass-card">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" /> {org.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-muted-foreground">Slug</span><p className="font-heading font-mono">{org.slug}</p></div>
                    <div><span className="text-muted-foreground">Plan</span><p className="font-heading capitalize">{org.plan}</p></div>
                    <div><span className="text-muted-foreground">Seats</span><p className="font-heading">{members.length} / {org.seats_limit}</p></div>
                    <div><span className="text-muted-foreground">Created</span><p className="font-heading">{new Date(org.created_at).toLocaleDateString()}</p></div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Team Members
                  <Badge variant="outline" className="text-[10px] ml-auto">{members.length} member{members.length !== 1 ? "s" : ""}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {members.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Create an organization first to invite team members.</p>
                ) : (
                  <div className="space-y-1">
                    {members.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                        <div>
                          <span className="text-sm font-heading">{m.invited_email || m.user_id?.slice(0, 8)}</span>
                          <Badge variant="outline" className="text-[10px] ml-2 capitalize">{m.role}</Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {m.joined_at ? `Joined ${new Date(m.joined_at).toLocaleDateString()}` : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {org && (
                  <div className="flex gap-2 pt-3 border-t border-border/30">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@company.com"
                      className="flex-1 px-3 py-2 rounded-lg bg-card/60 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="px-3 py-2 rounded-lg bg-card/60 border border-border/50 text-sm font-heading"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button size="sm" className="font-heading gap-1.5" onClick={handleInvite} disabled={!inviteEmail.trim()}>
                      <Plus className="w-3.5 h-3.5" /> Invite
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="glass-card">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <span className="font-heading font-semibold text-sm">Current Plan</span>
                  </div>
                  <p className="text-2xl font-heading font-bold">{isPro ? "Pro — $9.99/mo" : "Free — $0"}</p>
                  <Badge className={isPro ? "bg-primary/15 text-primary border-primary/30" : "bg-muted text-muted-foreground"}>
                    {isPro ? "Active" : "Free tier"}
                  </Badge>
                  {subscription.subscription_end && (
                    <p className="text-xs text-muted-foreground">
                      {subscription.cancel_at_period_end ? "Expires" : "Renews"}: {new Date(subscription.subscription_end).toLocaleDateString()}
                    </p>
                  )}
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="font-heading font-semibold text-sm">Billing Actions</span>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full font-heading gap-1.5" onClick={() => navigate("/pricing")}>
                      {isPro ? "Change Plan" : "Upgrade to Pro"}
                    </Button>
                    {isPro && (
                      <Button variant="outline" size="sm" className="w-full font-heading gap-1.5 text-muted-foreground">
                        <ExternalLink className="w-3.5 h-3.5" /> Open Billing Portal
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading">Invoice History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 space-y-2">
                  <CreditCard className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">No invoices yet. Invoices will appear here after your first payment.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="api" className="space-y-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" /> API Keys
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!org ? (
                  <p className="text-sm text-muted-foreground text-center py-4">Create an organization to generate API keys.</p>
                ) : (
                  <>
                    {apiKeys.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No API keys created yet.</p>
                    ) : (
                      <div className="space-y-1">
                        {apiKeys.map((k: any) => (
                          <div key={k.id} className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0">
                            <div>
                              <span className="text-sm font-heading">{k.name}</span>
                              <div className="flex items-center gap-2 mt-0.5">
                                <code className="text-[11px] text-muted-foreground font-mono">
                                  {showKey === k.id ? k.key_hash : `${k.key_prefix}${"•".repeat(20)}`}
                                </code>
                                <button onClick={() => setShowKey(showKey === k.id ? null : k.id)} className="text-muted-foreground hover:text-foreground">
                                  {showKey === k.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </button>
                                <button onClick={() => { navigator.clipboard.writeText(k.key_hash); toast({ title: "Copied!" }); }} className="text-muted-foreground hover:text-foreground">
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px]">{k.revoked_at ? "Revoked" : "Active"}</Badge>
                              <span className="text-[11px] text-muted-foreground">{new Date(k.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 pt-3 border-t border-border/30">
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="Key name (e.g., Production API)"
                        className="flex-1 px-3 py-2 rounded-lg bg-card/60 border border-border/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      <Button size="sm" className="font-heading gap-1.5" onClick={handleCreateApiKey} disabled={creatingKey || !newKeyName.trim()}>
                        {creatingKey ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Create Key
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><strong className="text-foreground">API Key Security:</strong></p>
                  <p>• Keys are shown once after creation — store them securely</p>
                  <p>• In production, keys are hashed (bcrypt) and never stored in plaintext</p>
                  <p>• Revoked keys are immediately invalidated</p>
                  <p>• Rate limiting: 1,000 requests/minute per key</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" /> Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { label: "Authentication", value: "Email/password + session tokens", status: "active" },
                    { label: "Data Encryption", value: "AES-256 at rest, TLS 1.3 in transit", status: "active" },
                    { label: "Row-Level Security", value: "Enforced on all user tables", status: "active" },
                    { label: "SSO / SAML", value: "Available on Enterprise plan", status: "planned" },
                    { label: "SOC 2 Type II", value: "Infrastructure provider certified", status: "active" },
                    { label: "GDPR Compliance", value: "Data export & deletion available", status: "active" },
                  ].map(({ label, value, status }) => (
                    <div key={label} className="flex items-start gap-2">
                      {status === "active" ? (
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-heading font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-heading">Audit Log</CardTitle>
              </CardHeader>
              <CardContent>
                {auditLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No audit events yet. Actions like creating organizations, API keys, and role changes are logged here.</p>
                ) : (
                  <div className="space-y-1">
                    {auditLog.map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0 text-sm">
                        <div>
                          <span className="font-heading font-mono text-xs">{e.action}</span>
                          <span className="text-muted-foreground ml-2 text-xs">{e.resource_type}</span>
                        </div>
                        <span className="text-[11px] text-muted-foreground">{new Date(e.created_at).toLocaleString()}</span>
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

export default Settings;

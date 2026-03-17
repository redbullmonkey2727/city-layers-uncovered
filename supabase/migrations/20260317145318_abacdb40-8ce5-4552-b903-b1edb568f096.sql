
-- Organizations (multi-tenant B2B)
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  seats_limit INTEGER NOT NULL DEFAULT 5,
  industry TEXT,
  website TEXT,
  logo_url TEXT,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  stripe_customer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Organization members with roles
CREATE TABLE public.org_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  invited_email TEXT,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(org_id, user_id)
);

-- Leads / sales pipeline
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  phone TEXT,
  company_size TEXT,
  industry TEXT,
  use_case TEXT,
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'new',
  stage TEXT NOT NULL DEFAULT 'mql',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  deal_value NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoices (mirrors Stripe invoices for internal visibility)
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'draft',
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  pdf_url TEXT,
  line_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Audit log for compliance
CREATE TABLE public.audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- API keys for developer integrations
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  scopes JSONB DEFAULT '["read"]'::jsonb,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS: organizations
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read own org" ON public.organizations FOR SELECT TO authenticated
  USING (id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));
CREATE POLICY "Owners can update org" ON public.organizations FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Authenticated can insert org" ON public.organizations FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- RLS: org_members
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read org members" ON public.org_members FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM public.org_members om WHERE om.user_id = auth.uid()));
CREATE POLICY "Admins can insert members" ON public.org_members FOR INSERT TO authenticated
  WITH CHECK (org_id IN (SELECT org_id FROM public.org_members om WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));
CREATE POLICY "Admins can delete members" ON public.org_members FOR DELETE TO authenticated
  USING (org_id IN (SELECT org_id FROM public.org_members om WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));

-- RLS: leads (accessible to all authenticated for demo/portfolio purposes)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read leads" ON public.leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert leads" ON public.leads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated can update leads" ON public.leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS: invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own invoices" ON public.invoices FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- RLS: audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own audit" ON public.audit_log FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users can insert audit" ON public.audit_log FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS: api_keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read org keys" ON public.api_keys FOR SELECT TO authenticated
  USING (org_id IN (SELECT org_id FROM public.org_members WHERE user_id = auth.uid()));
CREATE POLICY "Admins can insert keys" ON public.api_keys FOR INSERT TO authenticated
  WITH CHECK (org_id IN (SELECT org_id FROM public.org_members om WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));
CREATE POLICY "Admins can update keys" ON public.api_keys FOR UPDATE TO authenticated
  USING (org_id IN (SELECT org_id FROM public.org_members om WHERE om.user_id = auth.uid() AND om.role IN ('owner', 'admin')));

-- Allow anonymous lead submission (contact sales form)
CREATE POLICY "Anyone can submit leads" ON public.leads FOR INSERT TO anon WITH CHECK (true);

-- Indexes
CREATE INDEX idx_org_members_user ON public.org_members(user_id);
CREATE INDEX idx_org_members_org ON public.org_members(org_id);
CREATE INDEX idx_leads_status ON public.leads(status, stage);
CREATE INDEX idx_leads_created ON public.leads(created_at DESC);
CREATE INDEX idx_invoices_user ON public.invoices(user_id, created_at DESC);
CREATE INDEX idx_audit_log_user ON public.audit_log(user_id, created_at DESC);
CREATE INDEX idx_api_keys_org ON public.api_keys(org_id);

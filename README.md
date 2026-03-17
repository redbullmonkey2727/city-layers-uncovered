# Who Built All This?

A road trip companion that explains who built the cities you drive through, why they grew there, and what you're really seeing.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + TypeScript
- **Backend**: Lovable Cloud (Supabase) — auth, database, edge functions
- **Payments**: Stripe Checkout + Billing Portal via edge functions
- **Analytics**: Centralized event bus with warehouse-ready event store
- **CRM**: HubSpot-style contact/deal lifecycle sync (adapter pattern)
- **Email**: Transactional email service with template abstraction
- **Support**: Ticket system with category routing and priority levels

---

## Enterprise Integrations

This project demonstrates hands-on proficiency with the tools and patterns used in modern SaaS products. Each integration follows a **provider adapter pattern** — real services can replace mock providers by swapping a single module.

### 1. Payments — Stripe (Live)

| Component | Description |
|-----------|-------------|
| `create-checkout` | Edge function that creates Stripe Checkout sessions |
| `check-subscription` | Polls Stripe API to sync plan state to DB |
| `customer-portal` | Opens Stripe Billing Portal for self-service |
| `stripe-webhook` | Handles subscription lifecycle events with idempotency |

**Architecture highlights:**
- Webhook signature verification via `STRIPE_WEBHOOK_SECRET`
- Idempotent event processing using `stripe_event_id` in `billing_events`
- Customer resolution by `stripe_customer_id` → profile, with email fallback
- Free/Pro tier enforcement with monthly lookup counters and reset logic

### 2. Analytics — Segment-Style Event Bus (Mock + DB)

**File:** `src/services/analytics.ts`

Centralized event tracking with typed event schema and fan-out to multiple providers:

```
Frontend → AnalyticsService → [PostHog, GA4, Segment] (console mock)
                            → analytics_events table (warehouse-ready)
```

**Event schema includes:** `signup_completed`, `city_searched`, `checkout_started`, `subscription_activated`, `support_ticket_created`, `feature_used`, and more.

**To connect real providers:**
- PostHog: Set `VITE_POSTHOG_KEY`, uncomment `posthog.capture()`
- GA4: Add `gtag.js` script, set `VITE_GA4_MEASUREMENT_ID`
- Segment: Add `analytics.js`, set `VITE_SEGMENT_WRITE_KEY`

### 3. CRM — HubSpot-Style Lifecycle Sync (Mock)

**File:** `src/services/crm.ts`

Provider-agnostic CRM sync with contact lifecycle stages and deal pipeline:

| Lifecycle Stage | Trigger |
|----------------|---------|
| Subscriber | User signs up |
| Customer | User upgrades to Pro |
| Churned | User cancels subscription |

**Features:**
- Contact upsert with mapped properties (email, name, plan, source)
- Deal creation on upgrade ($9.99 Pro plan)
- Audit trail in `crm_sync_log` table with sync status tracking
- Admin dashboard visibility into sync success/failure rates

**To connect real HubSpot:**
1. Set `HUBSPOT_API_KEY` in edge function secrets
2. Replace `mockHubSpotProvider` with real HubSpot API v3 calls

### 4. Email — Transactional Notification Service (Mock)

**File:** `src/services/email.ts`

Template-based transactional email with provider abstraction:

| Template | Trigger |
|----------|---------|
| `welcome` | New user signup |
| `subscription_confirmed` | Pro upgrade |
| `payment_receipt` | Successful payment |
| `support_ticket_received` | Ticket submitted |
| `usage_limit_warning` | Approaching free limit |

**Features:**
- Notification log in `notification_log` table
- Delivery status tracking (queued → sent / failed)
- Provider metadata for debugging

**To connect real Resend:**
1. Set `RESEND_API_KEY` in edge function secrets
2. Replace `mockResendProvider` with `POST https://api.resend.com/emails`

### 5. Support — Ticket System (Live DB)

**Page:** `/support`

Full support ticket system with:
- Category routing (General, Billing, Bug, Feature, Account)
- Priority levels (Low, Medium, High)
- Account context attached to each ticket
- Confirmation email on submission
- Admin dashboard visibility

### 6. Integration Health Monitor

**File:** `src/services/integrations.ts`

Observability layer showing status of all connected services:
- Stripe: Live connectivity check via subscriptions table
- Database: Live connectivity check via profiles table
- CRM: Mock status with sync statistics
- Analytics: Provider registry with enable/disable status
- Email: Mock provider status
- Auth: Supabase Auth health
- AI: Lovable AI Gateway status

### 7. Admin / Ops Dashboard

**Page:** `/admin`

Internal operations panel with tabs:

| Tab | Shows |
|-----|-------|
| Integrations | Health status of all 8+ services |
| Events | Recent search activity log |
| CRM | Sync statistics and pipeline stages |
| Support | Recent tickets with status/priority badges |
| Email | Notification delivery log |
| Webhooks | Stripe webhook event history with architecture docs |

**KPI cards:** Total users, Pro subscribers, total searches, 7-day signups, open tickets, conversion rate.

---

## Service Abstraction Pattern

Every integration follows the same pattern for easy provider swapping:

```typescript
// 1. Define provider interface
interface Provider {
  name: string;
  send(data: Payload): Promise<Result>;
}

// 2. Implement mock provider
const mockProvider: Provider = { ... };

// 3. Service class uses provider
class Service {
  private provider: Provider = mockProvider;
  // Methods call this.provider internally
}

// 4. Export singleton
export const service = new Service();
```

To switch from mock to real: replace the provider instance. No other code changes needed.

---

## What Is Real vs Mocked

| Integration | Status | Notes |
|-------------|--------|-------|
| Stripe Payments | ✅ Live | Real Checkout, webhooks, portal |
| Supabase Auth | ✅ Live | Email/password with auto-confirm |
| Supabase Database | ✅ Live | RLS-enforced, 10+ tables |
| AI City Lookup | ✅ Live | Gemini 2.5 Flash via gateway |
| Analytics Events | 🔵 DB + Mock | Events persist to DB, providers log to console |
| CRM Sync | 🔵 Mock | Realistic payloads, logged to DB |
| Email Notifications | 🔵 Mock | Templates defined, logged to DB |
| PostHog / GA4 / Segment | 🔵 Mock | Console logging, ready for real SDKs |

---

## Subscribe / Paid Flow

1. User clicks **Upgrade to Pro** on `/pricing` or in the paywall modal
2. Frontend calls the `create-checkout` edge function
3. Edge function creates a Stripe Checkout session and returns the URL
4. User is redirected to Stripe Checkout (same window)
5. On success, Stripe redirects to `/account?checkout=success`
6. The `check-subscription` edge function polls Stripe to sync plan status
7. Stripe webhooks handle real-time updates

### Webhook Events Handled
- `checkout.session.completed` — activates Pro
- `customer.subscription.created` / `updated` — syncs status
- `customer.subscription.deleted` — reverts to Free
- `invoice.payment_failed` — logged

---

## Key Files

| File | Purpose |
|------|---------|
| `src/services/analytics.ts` | Centralized event tracking (Segment-style) |
| `src/services/crm.ts` | CRM sync abstraction (HubSpot-style) |
| `src/services/email.ts` | Transactional email abstraction (Resend-style) |
| `src/services/integrations.ts` | Integration health monitoring |
| `src/contexts/AuthContext.tsx` | Global auth + subscription + event wiring |
| `src/pages/Admin.tsx` | Ops dashboard with 6 tab views |
| `src/pages/Support.tsx` | Support ticket submission |
| `src/pages/Pricing.tsx` | Plan comparison + checkout trigger |
| `src/pages/Account.tsx` | Billing, usage, search history |
| `src/components/PaywallModal.tsx` | Limit-reached upgrade prompt |
| `supabase/functions/create-checkout/` | Creates Stripe Checkout session |
| `supabase/functions/check-subscription/` | Syncs subscription status |
| `supabase/functions/customer-portal/` | Opens Stripe Billing Portal |
| `supabase/functions/stripe-webhook/` | Handles Stripe webhook events |
| `supabase/functions/city-lookup/` | AI-powered city research |

---

## Why This Is a Strong Portfolio Piece

This project demonstrates:

1. **Stripe billing architecture** — real checkout, webhooks with idempotency, portal integration, plan enforcement
2. **CRM integration patterns** — contact lifecycle mapping, deal pipeline, audit logging
3. **Analytics engineering** — typed event schema, warehouse-ready event store, multi-provider fan-out
4. **Auth & access control** — session-aware UI, plan-gated features, RLS-enforced data isolation
5. **Support operations** — ticket routing, priority levels, email confirmation workflows
6. **Email service design** — template system, delivery logging, provider abstraction
7. **Observability** — integration health monitoring, webhook event audit trail
8. **Admin tooling** — operational dashboard with KPIs, sync status, and event logs
9. **Clean architecture** — service adapters, typed interfaces, environment-driven config
10. **Production patterns** — error handling, loading states, idempotency, graceful degradation

# Who Built All This?

A road trip companion that explains who built the cities you drive through — built as a **portfolio-grade B2B SaaS platform** demonstrating enterprise software proficiency.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + TypeScript
- **Backend**: Lovable Cloud (Supabase) — auth, database, edge functions
- **Payments**: Stripe Checkout + Billing Portal + Webhooks
- **Analytics**: Centralized event bus with warehouse-ready event store
- **CRM**: HubSpot-style contact/deal lifecycle sync (adapter pattern)
- **Email**: Transactional notification service with template abstraction
- **Support**: Ticket system with category routing and priority levels
- **Organizations**: Multi-tenant B2B with roles, seats, and team management

---

## B2B SaaS Feature Map

### Product Features
| Page | Purpose |
|------|---------|
| `/` | AI-powered city lookup with usage enforcement |
| `/account` | User dashboard with usage, search history, saved cities |
| `/settings` | Org management, team invites, billing, API keys, security & audit |
| `/pricing` | Plan comparison with self-serve checkout |
| `/contact-sales` | Enterprise lead capture form (→ sales pipeline) |
| `/support` | Support ticket submission with categories & priorities |

### Internal Operations (B2B Back Office)
| Page | Purpose |
|------|---------|
| `/admin` | Ops dashboard — users, integrations, events, CRM, email, webhooks |
| `/sales` | Sales pipeline — leads, stages (MQL→SQL→Opportunity→Closed), deal values |
| `/finance` | Revenue dashboard — MRR, ARR, ARPU, subscriptions, invoices, churn |

---

## Data Model

```
profiles ←── org_members ──→ organizations
    │                              │
    ├── search_events              ├── api_keys
    ├── saved_cities               ├── audit_log
    ├── support_tickets            └── invoices
    ├── subscriptions
    ├── analytics_events
    ├── crm_sync_log
    ├── notification_log
    └── billing_events
    
leads (sales pipeline, independent)
trips ←── trip_stops
```

---

## Enterprise Integrations

### Payments — Stripe (Live)
- Checkout sessions, subscription lifecycle, billing portal
- Webhook handling with signature verification + idempotency
- Plan enforcement (free: 5 lookups/mo, Pro: unlimited)

### Analytics — Segment-Style Event Bus (Mock + DB)
- Typed event schema (signup, search, checkout, support, etc.)
- Fan-out to PostHog, GA4, Segment (console mock)
- Warehouse-ready persistence in `analytics_events` table

### CRM — HubSpot-Style Lifecycle (Mock)
- Contact lifecycle: Subscriber → Lead → Customer → Churned
- Deal pipeline sync on upgrade/cancellation
- Audit trail in `crm_sync_log`

### Email — Resend-Style Notifications (Mock)
- Templates: welcome, subscription_confirmed, payment_receipt, support_ticket_received
- Delivery logging in `notification_log`

### Organizations & Teams
- Multi-tenant with owner/admin/member roles
- Seat limits, team invites, org settings
- API key generation and management

### Sales Pipeline
- Lead capture from Contact Sales form
- Pipeline stages: MQL → SQL → Opportunity → Proposal → Closed Won/Lost
- Deal value tracking, source attribution, stage progression

### Finance & Revenue
- MRR/ARR calculation from active subscriptions
- ARPU, churn tracking, failed payment monitoring
- Revenue recognition notes (ASC 606), GL account mapping
- Invoice history synced from Stripe

### Security & Compliance
- Row-Level Security on all user tables
- Audit log for org actions (create org, API key, role changes)
- API key management with prefix display, revocation
- Security posture dashboard (encryption, RLS, SOC 2, GDPR)

---

## What Is Real vs Mocked

| Integration | Status | Notes |
|-------------|--------|-------|
| Stripe Payments | ✅ Live | Real Checkout, webhooks, portal |
| Supabase Auth | ✅ Live | Email/password with auto-confirm |
| Database (15+ tables) | ✅ Live | RLS-enforced, multi-tenant |
| AI City Lookup | ✅ Live | Gemini 2.5 Flash |
| Organizations & Teams | ✅ Live | Real DB with roles |
| Sales Pipeline | ✅ Live | Real DB, lead capture |
| Support Tickets | ✅ Live | Real DB, ticket routing |
| API Keys | ✅ Live | Real generation + storage |
| Audit Log | ✅ Live | Real event logging |
| Analytics Events | 🔵 DB + Mock | Persists to DB, providers mock |
| CRM Sync | 🔵 Mock | Realistic payloads, logged to DB |
| Email Notifications | 🔵 Mock | Templates defined, logged to DB |

---

## Service Abstraction Pattern

Every mock integration follows the same adapter pattern:

```typescript
interface Provider { name: string; send(data): Promise<Result>; }
const mockProvider: Provider = { /* realistic mock */ };
class Service { private provider = mockProvider; /* methods */ }
export const service = new Service();
```

To switch to real: replace the provider instance. No other code changes needed.

---

## Key Files

| File | Purpose |
|------|---------|
| `src/services/analytics.ts` | Centralized event tracking |
| `src/services/crm.ts` | CRM sync abstraction |
| `src/services/email.ts` | Email notification service |
| `src/services/integrations.ts` | Integration health monitor |
| `src/contexts/AuthContext.tsx` | Auth + subscription + event wiring |
| `src/pages/Settings.tsx` | Org/team/billing/API/security settings |
| `src/pages/Sales.tsx` | Sales pipeline dashboard |
| `src/pages/ContactSales.tsx` | Enterprise lead capture |
| `src/pages/Finance.tsx` | Revenue & billing dashboard |
| `src/pages/Admin.tsx` | Ops dashboard (6 tab views) |
| `src/pages/Support.tsx` | Support ticket system |
| `supabase/functions/` | Stripe edge functions (checkout, subscription, webhook, portal) |

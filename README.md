# Who Built All This?

A road trip companion that explains who built the cities you drive through, why they grew there, and what you're really seeing.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + TypeScript
- **Backend**: Lovable Cloud (Supabase) — auth, database, edge functions
- **Payments**: Stripe Checkout + Billing Portal via edge functions

## Subscribe / Paid Flow

1. User clicks **Upgrade to Pro** on `/pricing` or in the paywall modal
2. Frontend calls the `create-checkout` edge function
3. Edge function creates a Stripe Checkout session and returns the URL
4. User is redirected to Stripe Checkout (same window)
5. On success, Stripe redirects to `/account?checkout=success`
6. The `check-subscription` edge function polls Stripe to sync plan status
7. Stripe webhooks (`stripe-webhook` edge function) handle real-time updates

### Webhook Events Handled
- `checkout.session.completed` — activates Pro
- `customer.subscription.created` / `updated` — syncs status
- `customer.subscription.deleted` — reverts to Free
- `invoice.payment_failed` — logged

### Where to Configure
- **Stripe Secret Key**: Already set as `STRIPE_SECRET_KEY` edge function secret
- **Stripe Webhook Secret**: Set `STRIPE_WEBHOOK_SECRET` in edge function secrets, then configure your Stripe dashboard webhook endpoint to point to: `https://chsmomjcxrvfzjdfbltn.supabase.co/functions/v1/stripe-webhook`
- **Price ID**: Hardcoded in `supabase/functions/create-checkout/index.ts` as `PRO_PRICE_ID`

## Email / Auth Flow

- **Auto-confirm** is enabled — new signups are logged in immediately without email verification
- Auth uses Supabase Auth with email/password
- A database trigger automatically creates a profile row on signup
- To require email verification in production, disable auto-confirm in auth settings

## Testing Locally

### Success Flow
1. Sign up → automatically logged in
2. Search cities → usage count increments
3. Click Upgrade to Pro → redirected to Stripe Checkout
4. Complete payment → redirected to `/account?checkout=success`
5. Plan badge updates to "Pro"

### Error Flow
- If `STRIPE_SECRET_KEY` is not set, checkout shows a clear error message
- If the edge function fails, the pricing page shows an inline error with retry

### Free Tier Limits
- 5 city lookups/month (resets monthly)
- 10 saved cities
- Paywall modal appears when limit is reached

## Key Files

| File | Purpose |
|------|---------|
| `src/contexts/AuthContext.tsx` | Global auth + subscription state |
| `src/pages/Pricing.tsx` | Plan comparison + checkout trigger |
| `src/components/PaywallModal.tsx` | Limit-reached upgrade prompt |
| `supabase/functions/create-checkout/` | Creates Stripe Checkout session |
| `supabase/functions/check-subscription/` | Syncs subscription status from Stripe |
| `supabase/functions/customer-portal/` | Opens Stripe Billing Portal |
| `supabase/functions/stripe-webhook/` | Handles Stripe webhook events |
| `supabase/functions/city-lookup/` | AI-powered city research |

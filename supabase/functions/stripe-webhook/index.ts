import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    return new Response("STRIPE_SECRET_KEY not configured", { status: 500 });
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    let event: Stripe.Event;

    if (webhookSecret) {
      const sig = req.headers.get("stripe-signature");
      if (!sig) throw new Error("Missing stripe-signature header");
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    console.log(`[stripe-webhook] Processing event: ${event.type} (${event.id})`);

    // Idempotency check
    const { data: existing } = await supabase
      .from("billing_events")
      .select("id")
      .eq("stripe_event_id", event.id)
      .maybeSingle();

    if (existing) {
      console.log(`[stripe-webhook] Event ${event.id} already processed, skipping`);
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find user by stripe customer ID
    const getCustomerId = (obj: any): string | null => {
      if (typeof obj.customer === "string") return obj.customer;
      return null;
    };

    const eventObj = event.data.object as any;
    const stripeCustomerId = getCustomerId(eventObj);
    let userId: string | null = null;

    if (stripeCustomerId) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", stripeCustomerId)
        .maybeSingle();

      if (profile) {
        userId = profile.id;
      } else {
        // Try to find by email via Stripe customer
        try {
          const customer = await stripe.customers.retrieve(stripeCustomerId);
          if (customer && !customer.deleted && customer.email) {
            const { data: profileByEmail } = await supabase
              .from("profiles")
              .select("id")
              .eq("email", customer.email)
              .maybeSingle();

            if (profileByEmail) {
              userId = profileByEmail.id;
              await supabase
                .from("profiles")
                .update({ stripe_customer_id: stripeCustomerId })
                .eq("id", userId);
            }
          }
        } catch (e) {
          console.error("[stripe-webhook] Error fetching customer:", e);
        }
      }
    }

    // Handle events
    switch (event.type) {
      case "checkout.session.completed": {
        const session = eventObj as Stripe.Checkout.Session;
        if (session.subscription && userId) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await supabase.from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_subscription_id: sub.id,
              stripe_customer_id: stripeCustomerId,
              status: sub.status,
              price_id: sub.items.data[0]?.price.id,
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              cancel_at_period_end: sub.cancel_at_period_end,
            },
            { onConflict: "stripe_subscription_id" }
          );
          await supabase.from("profiles").update({ plan: "pro" }).eq("id", userId);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = eventObj as Stripe.Subscription;
        if (userId) {
          const isActive = ["active", "trialing"].includes(sub.status);
          await supabase.from("subscriptions").upsert(
            {
              user_id: userId,
              stripe_subscription_id: sub.id,
              stripe_customer_id: stripeCustomerId,
              status: sub.status,
              price_id: sub.items.data[0]?.price.id,
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
              cancel_at_period_end: sub.cancel_at_period_end,
            },
            { onConflict: "stripe_subscription_id" }
          );
          await supabase
            .from("profiles")
            .update({ plan: isActive ? "pro" : "free" })
            .eq("id", userId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = eventObj as Stripe.Subscription;
        if (userId) {
          await supabase
            .from("subscriptions")
            .update({ status: "canceled", cancel_at_period_end: false })
            .eq("stripe_subscription_id", sub.id);
          await supabase.from("profiles").update({ plan: "free" }).eq("id", userId);
        }
        break;
      }

      case "invoice.payment_failed": {
        console.log(`[stripe-webhook] Payment failed for customer ${stripeCustomerId}`);
        break;
      }
    }

    // Log billing event
    await supabase.from("billing_events").insert({
      user_id: userId,
      stripe_customer_id: stripeCustomerId,
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event.data.object as any,
    });

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[stripe-webhook] ERROR:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});

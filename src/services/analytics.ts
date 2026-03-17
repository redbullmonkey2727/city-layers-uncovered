/**
 * Centralized Analytics Service
 * 
 * Segment-style event tracking with fan-out to multiple providers.
 * All product events flow through this service, which:
 * 1. Persists events to the analytics_events table (warehouse-ready)
 * 2. Fans out to configured providers (PostHog, GA4, Segment, etc.)
 * 3. Provides a typed event schema for consistency
 * 
 * Architecture:
 * ┌─────────────┐    ┌───────────────────┐    ┌──────────────┐
 * │  Frontend    │───▶│  AnalyticsService │───▶│  Supabase DB │
 * │  Components  │    │  (Event Bus)      │    │  (Warehouse) │
 * └─────────────┘    └───────┬───────────┘    └──────────────┘
 *                            │
 *                     ┌──────┴──────┐
 *                     ▼             ▼
 *               ┌──────────┐ ┌──────────┐
 *               │ PostHog  │ │   GA4    │
 *               │ (mock)   │ │  (mock)  │
 *               └──────────┘ └──────────┘
 * 
 * To connect real providers:
 * - PostHog: Set VITE_POSTHOG_KEY env var, uncomment posthog.capture()
 * - GA4: Set VITE_GA4_MEASUREMENT_ID, add gtag.js script
 * - Segment: Set VITE_SEGMENT_WRITE_KEY, add analytics.js
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Event Schema ───────────────────────────────────────────
// Warehouse-ready event definitions following Segment spec

export type AnalyticsEvent =
  | { name: "page_viewed"; properties: { path: string; title?: string; referrer?: string } }
  | { name: "signup_started"; properties: { method: string } }
  | { name: "signup_completed"; properties: { method: string; user_id: string } }
  | { name: "login_completed"; properties: { method: string } }
  | { name: "city_searched"; properties: { city: string; state?: string; was_cached?: boolean } }
  | { name: "city_saved"; properties: { city: string; state?: string } }
  | { name: "checkout_started"; properties: { plan: string; price: number } }
  | { name: "checkout_completed"; properties: { plan: string; price: number; stripe_session_id?: string } }
  | { name: "subscription_activated"; properties: { plan: string } }
  | { name: "subscription_cancelled"; properties: { plan: string; reason?: string } }
  | { name: "support_ticket_created"; properties: { category: string; priority: string } }
  | { name: "billing_portal_opened"; properties: Record<string, never> }
  | { name: "upgrade_prompt_shown"; properties: { trigger: string; current_usage?: number } }
  | { name: "upgrade_prompt_clicked"; properties: { trigger: string } }
  | { name: "feature_used"; properties: { feature: string; context?: string } }
  | { name: "admin_dashboard_viewed"; properties: { section?: string } }
  | { name: "crm_contact_synced"; properties: { provider: string; lifecycle_stage: string } };

// ─── Provider Interface ─────────────────────────────────────

interface AnalyticsProvider {
  name: string;
  enabled: boolean;
  track: (event: AnalyticsEvent, userId?: string) => void;
  identify: (userId: string, traits: Record<string, unknown>) => void;
}

// ─── Mock Providers ─────────────────────────────────────────

const postHogProvider: AnalyticsProvider = {
  name: "PostHog",
  enabled: true, // Would check VITE_POSTHOG_KEY in production
  track: (event, userId) => {
    console.log(`[PostHog] track: ${event.name}`, { ...event.properties, distinct_id: userId });
    // Real: posthog.capture(event.name, { ...event.properties, distinct_id: userId })
  },
  identify: (userId, traits) => {
    console.log(`[PostHog] identify: ${userId}`, traits);
    // Real: posthog.identify(userId, traits)
  },
};

const ga4Provider: AnalyticsProvider = {
  name: "GA4",
  enabled: true, // Would check VITE_GA4_MEASUREMENT_ID in production
  track: (event) => {
    console.log(`[GA4] event: ${event.name}`, event.properties);
    // Real: gtag('event', event.name, event.properties)
  },
  identify: (userId) => {
    console.log(`[GA4] set user_id: ${userId}`);
    // Real: gtag('config', GA4_ID, { user_id: userId })
  },
};

const segmentProvider: AnalyticsProvider = {
  name: "Segment",
  enabled: true, // Would check VITE_SEGMENT_WRITE_KEY in production
  track: (event, userId) => {
    console.log(`[Segment] track: ${event.name}`, { userId, ...event.properties });
    // Real: analytics.track(event.name, { userId, ...event.properties })
  },
  identify: (userId, traits) => {
    console.log(`[Segment] identify: ${userId}`, traits);
    // Real: analytics.identify(userId, traits)
  },
};

// ─── Provider Registry ──────────────────────────────────────

const providers: AnalyticsProvider[] = [postHogProvider, ga4Provider, segmentProvider];

// ─── Session Management ─────────────────────────────────────

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }
  return sessionId;
}

// ─── Core Analytics Service ─────────────────────────────────

class AnalyticsService {
  private userId: string | null = null;
  private userTraits: Record<string, unknown> = {};

  /**
   * Identify a user across all providers
   * Call on login/signup to associate events with user
   */
  identify(userId: string, traits: Record<string, unknown> = {}) {
    this.userId = userId;
    this.userTraits = { ...this.userTraits, ...traits };

    providers.forEach((p) => {
      if (p.enabled) {
        try {
          p.identify(userId, this.userTraits);
        } catch (e) {
          console.warn(`[Analytics] ${p.name} identify failed:`, e);
        }
      }
    });
  }

  /**
   * Track a typed product event
   * Events are persisted to DB and fanned out to all providers
   */
  async track(event: AnalyticsEvent) {
    const context = {
      page: { path: window.location.pathname, url: window.location.href },
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      providers: providers.filter((p) => p.enabled).map((p) => p.name),
    };

    // 1. Fan out to providers (non-blocking)
    providers.forEach((p) => {
      if (p.enabled) {
        try {
          p.track(event, this.userId ?? undefined);
        } catch (e) {
          console.warn(`[Analytics] ${p.name} track failed:`, e);
        }
      }
    });

    // 2. Persist to warehouse table (if user is identified)
    if (this.userId) {
      try {
        await supabase.from("analytics_events").insert({
          user_id: this.userId,
          event_name: event.name,
          properties: event.properties as Record<string, unknown>,
          context,
          session_id: getSessionId(),
        });
      } catch (e) {
        console.warn("[Analytics] DB persist failed:", e);
      }
    }
  }

  /**
   * Reset on logout
   */
  reset() {
    this.userId = null;
    this.userTraits = {};
    sessionId = null;
  }

  /**
   * Get list of configured providers and their status
   */
  getProviderStatus(): { name: string; enabled: boolean }[] {
    return providers.map((p) => ({ name: p.name, enabled: p.enabled }));
  }
}

// Singleton export
export const analytics = new AnalyticsService();

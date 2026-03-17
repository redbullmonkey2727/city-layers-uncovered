/**
 * CRM Sync Service
 * 
 * HubSpot-style contact/deal lifecycle management.
 * Provides a provider-agnostic abstraction for syncing user data
 * to CRM systems (HubSpot, Salesforce, Pipedrive, etc.)
 * 
 * Architecture:
 * ┌──────────────┐     ┌─────────────┐     ┌──────────────┐
 * │  App Events  │────▶│  CRM Service│────▶│  crm_sync_log│
 * │  (signup,    │     │  (Adapter)  │     │  (Supabase)  │
 * │   upgrade)   │     └──────┬──────┘     └──────────────┘
 * └──────────────┘            │
 *                      ┌──────┴──────┐
 *                      ▼             ▼
 *                ┌──────────┐  ┌───────────┐
 *                │ HubSpot  │  │ Salesforce│
 *                │ (mock)   │  │  (mock)   │
 *                └──────────┘  └───────────┘
 * 
 * To connect real HubSpot:
 * 1. Set HUBSPOT_API_KEY in edge function secrets
 * 2. Replace MockHubSpotProvider with real API calls
 * 3. CRM sync events are already logged for audit trail
 */

import { supabase } from "@/integrations/supabase/client";

// ─── CRM Data Models ────────────────────────────────────────

export type LifecycleStage = "subscriber" | "lead" | "opportunity" | "customer" | "churned";
export type DealStage = "qualification" | "proposal" | "negotiation" | "closed_won" | "closed_lost";

export interface CRMContact {
  email: string;
  firstName?: string;
  lastName?: string;
  lifecycleStage: LifecycleStage;
  plan?: string;
  signupDate?: string;
  lastActive?: string;
  totalSearches?: number;
  source?: string;
}

export interface CRMDeal {
  contactEmail: string;
  dealName: string;
  stage: DealStage;
  amount: number;
  currency: string;
  closeDate?: string;
}

// ─── Provider Interface ─────────────────────────────────────

interface CRMProvider {
  name: string;
  upsertContact: (contact: CRMContact) => Promise<{ success: boolean; externalId?: string }>;
  updateLifecycle: (email: string, stage: LifecycleStage) => Promise<{ success: boolean }>;
  createDeal: (deal: CRMDeal) => Promise<{ success: boolean; dealId?: string }>;
}

// ─── Mock HubSpot Provider ──────────────────────────────────

const mockHubSpotProvider: CRMProvider = {
  name: "hubspot_mock",

  async upsertContact(contact) {
    // Simulate HubSpot API: POST /crm/v3/objects/contacts
    console.log("[HubSpot Mock] Upsert contact:", {
      properties: {
        email: contact.email,
        firstname: contact.firstName,
        lastname: contact.lastName,
        lifecyclestage: contact.lifecycleStage,
        hs_lead_status: contact.plan === "pro" ? "CONNECTED" : "NEW",
      },
    });
    await new Promise((r) => setTimeout(r, 150)); // Simulate latency
    return { success: true, externalId: `hub_${Date.now()}` };
  },

  async updateLifecycle(email, stage) {
    console.log("[HubSpot Mock] Update lifecycle:", { email, stage });
    await new Promise((r) => setTimeout(r, 100));
    return { success: true };
  },

  async createDeal(deal) {
    // Simulate HubSpot API: POST /crm/v3/objects/deals
    console.log("[HubSpot Mock] Create deal:", {
      properties: {
        dealname: deal.dealName,
        dealstage: deal.stage,
        amount: deal.amount,
        pipeline: "default",
      },
      associations: [{ to: deal.contactEmail, types: [{ category: "HUBSPOT_DEFINED", typeId: 3 }] }],
    });
    await new Promise((r) => setTimeout(r, 200));
    return { success: true, dealId: `deal_${Date.now()}` };
  },
};

// ─── CRM Service ────────────────────────────────────────────

class CRMService {
  private provider: CRMProvider = mockHubSpotProvider;

  /**
   * Sync a new signup to the CRM as a subscriber/lead
   */
  async syncNewSignup(userId: string, email: string, fullName?: string) {
    const [firstName, ...rest] = (fullName || "").split(" ");
    const contact: CRMContact = {
      email,
      firstName: firstName || undefined,
      lastName: rest.join(" ") || undefined,
      lifecycleStage: "subscriber",
      plan: "free",
      signupDate: new Date().toISOString(),
      source: "organic",
    };

    return this.syncContact(userId, contact, "signup");
  }

  /**
   * Sync a plan upgrade to the CRM
   */
  async syncUpgrade(userId: string, email: string, plan: string) {
    const result = await this.provider.updateLifecycle(email, "customer");
    await this.logSync(userId, "upgrade", { email, plan, lifecycle: "customer" }, result.success);

    // Create a deal for the upgrade
    await this.provider.createDeal({
      contactEmail: email,
      dealName: `Pro Upgrade - ${email}`,
      stage: "closed_won",
      amount: 9.99,
      currency: "USD",
      closeDate: new Date().toISOString(),
    });

    return result;
  }

  /**
   * Sync a cancellation to the CRM
   */
  async syncCancellation(userId: string, email: string) {
    const result = await this.provider.updateLifecycle(email, "churned");
    await this.logSync(userId, "cancellation", { email, lifecycle: "churned" }, result.success);
    return result;
  }

  /**
   * Sync contact data to the CRM provider
   */
  private async syncContact(userId: string, contact: CRMContact, eventType: string) {
    try {
      const result = await this.provider.upsertContact(contact);
      await this.logSync(userId, eventType, contact, result.success);
      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      await this.logSync(userId, eventType, contact, false, msg);
      return { success: false };
    }
  }

  /**
   * Log sync event for audit trail and admin dashboard
   */
  private async logSync(
    userId: string,
    eventType: string,
    payload: unknown,
    success: boolean,
    errorMessage?: string
  ) {
    try {
      await supabase.from("crm_sync_log").insert({
        user_id: userId,
        event_type: eventType,
        provider: this.provider.name,
        payload: payload as Record<string, unknown>,
        status: success ? "synced" : "failed",
        error_message: errorMessage || null,
      });
    } catch (e) {
      console.warn("[CRM] Failed to log sync event:", e);
    }
  }

  /**
   * Get provider name and status for admin dashboard
   */
  getProviderInfo() {
    return {
      name: this.provider.name,
      displayName: "HubSpot (Mock)",
      connected: true,
      mode: "mock" as const,
    };
  }
}

export const crm = new CRMService();

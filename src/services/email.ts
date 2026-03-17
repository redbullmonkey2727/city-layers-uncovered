/**
 * Email Notification Service
 * 
 * Provider-agnostic email abstraction layer.
 * Supports template-based transactional emails with mock/real provider switching.
 * 
 * Architecture:
 * ┌──────────────┐     ┌───────────────┐     ┌──────────────────┐
 * │  App Events  │────▶│ EmailService  │────▶│ notification_log │
 * │  (signup,    │     │ (Templates)   │     │   (Supabase)     │
 * │   payment)   │     └───────┬───────┘     └──────────────────┘
 * └──────────────┘             │
 *                       ┌──────┴──────┐
 *                       ▼             ▼
 *                 ┌──────────┐  ┌──────────┐
 *                 │ Resend   │  │ SendGrid │
 *                 │ (mock)   │  │  (mock)  │
 *                 └──────────┘  └──────────┘
 * 
 * To connect real Resend:
 * 1. Set RESEND_API_KEY in edge function secrets
 * 2. Create a send-email edge function
 * 3. Replace mock provider with real API calls
 */

import { supabase } from "@/integrations/supabase/client";

// ─── Email Templates ────────────────────────────────────────

export type EmailTemplate =
  | "welcome"
  | "subscription_confirmed"
  | "payment_receipt"
  | "subscription_cancelled"
  | "usage_limit_warning"
  | "support_ticket_received"
  | "monthly_digest";

interface EmailPayload {
  to: string;
  template: EmailTemplate;
  data: Record<string, unknown>;
  userId?: string;
}

// ─── Provider Interface ─────────────────────────────────────

interface EmailProvider {
  name: string;
  send: (payload: EmailPayload) => Promise<{ success: boolean; messageId?: string }>;
}

// ─── Mock Provider ──────────────────────────────────────────

const TEMPLATE_SUBJECTS: Record<EmailTemplate, string> = {
  welcome: "Welcome to Who Built All This! 🏗️",
  subscription_confirmed: "Your Pro subscription is active ✦",
  payment_receipt: "Payment receipt — Who Built All This",
  subscription_cancelled: "Your subscription has been cancelled",
  usage_limit_warning: "You're approaching your monthly lookup limit",
  support_ticket_received: "We received your support request",
  monthly_digest: "Your monthly city exploration digest",
};

const mockResendProvider: EmailProvider = {
  name: "resend_mock",
  async send(payload) {
    const subject = TEMPLATE_SUBJECTS[payload.template];
    console.log(`[Resend Mock] Sending "${subject}" to ${payload.to}`, {
      template: payload.template,
      data: payload.data,
      // Real Resend call would be:
      // POST https://api.resend.com/emails
      // { from: "noreply@whobuiltallthis.com", to, subject, html: renderTemplate(payload) }
    });
    await new Promise((r) => setTimeout(r, 100));
    return { success: true, messageId: `msg_${Date.now()}` };
  },
};

// ─── Email Service ──────────────────────────────────────────

class EmailService {
  private provider: EmailProvider = mockResendProvider;

  async sendWelcome(userId: string, email: string, name?: string) {
    return this.send({
      to: email,
      template: "welcome",
      data: { name: name || "Explorer", signupDate: new Date().toISOString() },
      userId,
    });
  }

  async sendSubscriptionConfirmed(userId: string, email: string, plan: string) {
    return this.send({
      to: email,
      template: "subscription_confirmed",
      data: { plan, startDate: new Date().toISOString() },
      userId,
    });
  }

  async sendPaymentReceipt(userId: string, email: string, amount: number, invoiceId?: string) {
    return this.send({
      to: email,
      template: "payment_receipt",
      data: { amount, currency: "USD", invoiceId, date: new Date().toISOString() },
      userId,
    });
  }

  async sendSupportTicketReceived(userId: string, email: string, ticketId: string, subject: string) {
    return this.send({
      to: email,
      template: "support_ticket_received",
      data: { ticketId, subject },
      userId,
    });
  }

  async sendUsageLimitWarning(userId: string, email: string, current: number, limit: number) {
    return this.send({
      to: email,
      template: "usage_limit_warning",
      data: { current, limit, remaining: limit - current },
      userId,
    });
  }

  private async send(payload: EmailPayload): Promise<{ success: boolean; messageId?: string }> {
    try {
      const result = await this.provider.send(payload);

      // Log to notification_log table
      if (payload.userId) {
        await (supabase.from("notification_log") as any).insert({
          user_id: payload.userId,
          channel: "email",
          template_name: payload.template,
          recipient: payload.to,
          status: result.success ? "sent" : "failed",
          provider: this.provider.name,
          metadata: { subject: TEMPLATE_SUBJECTS[payload.template], ...payload.data } as Record<string, unknown>,
        });
      }

      return result;
    } catch (error) {
      console.error("[Email] Send failed:", error);
      if (payload.userId) {
        await (supabase.from("notification_log") as any).insert({
          user_id: payload.userId,
          channel: "email",
          template_name: payload.template,
          recipient: payload.to,
          status: "failed",
          provider: this.provider.name,
          error_message: error instanceof Error ? error.message : "Unknown error",
        });
      }
      return { success: false };
    }
  }

  getProviderInfo() {
    return {
      name: this.provider.name,
      displayName: "Resend (Mock)",
      connected: true,
      mode: "mock" as const,
    };
  }
}

export const email = new EmailService();

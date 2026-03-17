import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/services/analytics";
import { crm } from "@/services/crm";
import { email } from "@/services/email";
import type { User, Session } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  plan: string;
  monthly_lookup_count: number;
  lookup_reset_at: string | null;
  stripe_customer_id: string | null;
}

interface SubscriptionInfo {
  subscribed: boolean;
  plan: string;
  subscription_end: string | null;
  cancel_at_period_end: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  subscription: SubscriptionInfo;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const defaultSub: SubscriptionInfo = {
  subscribed: false,
  plan: "free",
  subscription_end: null,
  cancel_at_period_end: false,
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  subscription: defaultSub,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  refreshSubscription: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(defaultSub);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();
    if (data) setProfile(data as Profile);
  }, []);

  const refreshSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (!error && data) {
        setSubscription({
          subscribed: data.subscribed ?? false,
          plan: data.plan ?? "free",
          subscription_end: data.subscription_end ?? null,
          cancel_at_period_end: data.cancel_at_period_end ?? false,
        });
      }
    } catch (e) {
      console.error("Failed to check subscription:", e);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    // Set up auth listener first
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      async (_event, sess) => {
        setSession(sess);
        setUser(sess?.user ?? null);
        if (sess?.user) {
          await fetchProfile(sess.user.id);
          // Identify user for analytics + CRM
          analytics.identify(sess.user.id, {
            email: sess.user.email,
            created_at: sess.user.created_at,
          });
          if (_event === "SIGNED_IN") {
            analytics.track({ name: "login_completed", properties: { method: "email" } });
            // On first sign-in after signup, sync to CRM + send welcome
            const isNewUser = sess.user.created_at && 
              (Date.now() - new Date(sess.user.created_at).getTime()) < 60000;
            if (isNewUser && sess.user.email) {
              analytics.track({ name: "signup_completed", properties: { method: "email", user_id: sess.user.id } });
              crm.syncNewSignup(sess.user.id, sess.user.email, sess.user.user_metadata?.full_name);
              email.sendWelcome(sess.user.id, sess.user.email, sess.user.user_metadata?.full_name);
            }
          }
          setTimeout(() => refreshSubscription(), 100);
        } else {
          setProfile(null);
          setSubscription(defaultSub);
          analytics.reset();
        }
        setLoading(false);
      }
    );

    // Then check existing session
    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      if (sess?.user) {
        fetchProfile(sess.user.id);
        setTimeout(() => refreshSubscription(), 100);
      }
      setLoading(false);
    });

    return () => authSub.unsubscribe();
  }, [fetchProfile, refreshSubscription]);

  // Periodic subscription refresh every 60s
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(refreshSubscription, 60000);
    return () => clearInterval(interval);
  }, [user, refreshSubscription]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setSubscription(defaultSub);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, subscription, loading, signOut, refreshProfile, refreshSubscription }}
    >
      {children}
    </AuthContext.Provider>
  );
};

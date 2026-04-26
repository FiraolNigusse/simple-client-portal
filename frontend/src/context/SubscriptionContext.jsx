import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getAccessToken } from "../utils/authStorage";
import { apiClient } from "../services/apiClient";

const SubscriptionContext = createContext(null);

const PLAN_ORDER = ["starter", "pro", "agency"];

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    // Only fetch if we have an access token to avoid 401 noise in console
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [subRes, plansRes] = await Promise.all([
        apiClient.get("/users/subscriptions/me/"),
        apiClient.get("/users/subscriptions/plans/"),
      ]);
      setSubscription(subRes.data);
      setPlans(plansRes.data);
    } catch (err) {
      console.error("Failed to fetch subscription data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const upgradePlan = useCallback(async (plan, user) => {
    if (user?.is_staff) {
      const res = await apiClient.post("/users/admin/change-plan/", { user_id: user.id, plan });
      await fetchSubscription();
      return res.data;
    } else {
      // Mock payment flow: Call create session, then immediately call success
      // In a real Stripe integration, this would redirect to stripe.com
      await apiClient.post("/users/create-checkout-session/", { plan });
      
      // Simulate successful return from Stripe
      const res = await apiClient.get(`/users/billing/payment-success/?plan=${plan}`);
      await fetchSubscription();
      return res.data.subscription;
    }
  }, [fetchSubscription]);

  const value = useMemo(
    () => ({
      subscription,
      plans,
      loading,
      upgradePlan,
      refresh: fetchSubscription,
      isAtLimit: (resource, currentCount) => {
        if (!subscription) return false;
        const limit = subscription.limits?.[resource];
        if (limit === "unlimited" || limit == null) return false;
        return currentCount >= limit;
      },
      planIndex: PLAN_ORDER.indexOf(subscription?.plan ?? "starter"),
    }),
    [subscription, plans, loading, upgradePlan, fetchSubscription]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used inside SubscriptionProvider");
  return ctx;
}

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "../services/apiClient";

const SubscriptionContext = createContext(null);

const PLAN_ORDER = ["starter", "professional", "agency"];

export function SubscriptionProvider({ children }) {
  const [subscription, setSubscription] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    try {
      const [subRes, plansRes] = await Promise.all([
        apiClient.get("/users/subscriptions/me/"),
        apiClient.get("/users/subscriptions/plans/"),
      ]);
      setSubscription(subRes.data);
      setPlans(plansRes.data);
    } catch {
      // Not authenticated yet — silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const upgradePlan = useCallback(async (plan) => {
    const res = await apiClient.patch("/users/subscriptions/me/", { plan });
    setSubscription(res.data);
    return res.data;
  }, []);

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

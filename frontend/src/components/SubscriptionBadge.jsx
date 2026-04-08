import { useSubscription } from "../context/SubscriptionContext";

const PLAN_STYLES = {
  starter:      "status-badge status-pending",
  pro:          "status-badge status-active",
  agency:       "status-badge status-active border-accent/30 bg-accent/10 text-accent",
};

export function SubscriptionBadge() {
  const { subscription, loading } = useSubscription();

  if (loading || !subscription) return null;

  const style = PLAN_STYLES[subscription.plan] ?? PLAN_STYLES.starter;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${style}`}
      title={`${subscription.plan_label} plan — ${subscription.status_label}`}
    >
      {subscription.plan_label}
    </span>
  );
}

import { useSubscription } from "../context/SubscriptionContext";

const PLAN_STYLES = {
  starter:      "border-slate-600/40 bg-slate-800/60 text-slate-400",
  professional: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  agency:       "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
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

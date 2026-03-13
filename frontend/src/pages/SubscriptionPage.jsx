import { useState } from "react";
import { useSubscription } from "../context/SubscriptionContext";

const PLAN_STYLES = {
  starter: {
    ring: "ring-slate-600/40",
    header: "bg-slate-800/60",
    badge: "bg-slate-700 text-slate-400",
    cta: "bg-slate-700 hover:bg-slate-600 text-slate-200",
    current: "bg-slate-700/60 text-slate-400",
  },
  professional: {
    ring: "ring-blue-500/40",
    header: "bg-blue-500/10",
    badge: "bg-blue-500/20 text-blue-400",
    cta: "bg-blue-600/80 hover:bg-blue-500/80 text-white shadow-blue-500/20",
    current: "bg-blue-500/10 text-blue-400",
  },
  agency: {
    ring: "ring-emerald-500/40",
    header: "bg-emerald-500/10",
    badge: "bg-emerald-500/20 text-emerald-400",
    cta: "bg-emerald-600/80 hover:bg-emerald-500/80 text-white shadow-emerald-500/20",
    current: "bg-emerald-500/10 text-emerald-400",
  },
};

const PLAN_ORDER = ["starter", "professional", "agency"];

export function SubscriptionPage() {
  const { subscription, plans, loading, upgradePlan } = useSubscription();
  const [upgrading, setUpgrading] = useState(null);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleUpgrade = async (plan) => {
    if (plan === subscription?.plan) return;
    setUpgrading(plan);
    setError(null);
    setSuccess(null);
    try {
      const updated = await upgradePlan(plan);
      setSuccess(`Successfully switched to the ${updated.plan_label} plan.`);
    } catch {
      setError("Failed to update your plan. Please try again.");
    } finally {
      setUpgrading(null);
    }
  };

  const sortedPlans = [...plans].sort(
    (a, b) => PLAN_ORDER.indexOf(a.plan) - PLAN_ORDER.indexOf(b.plan)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
          Subscription
        </h1>
        <p className="text-sm text-slate-400">
          Manage your plan and feature limits.
        </p>
      </div>

      {/* Current plan highlight */}
      {!loading && subscription && (
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-5 py-4">
          <div>
            <p className="text-xs text-slate-500">Current plan</p>
            <p className="mt-0.5 text-lg font-bold text-slate-50">
              {subscription.plan_label}
            </p>
            <p className="text-xs text-slate-500">
              Status:{" "}
              <span className={`font-medium ${subscription.status === "active" ? "text-emerald-400" : "text-amber-400"}`}>
                {subscription.status_label}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500">Limits</p>
            {Object.entries(subscription.limits ?? {}).map(([k, v]) => (
              <p key={k} className="text-xs text-slate-400">
                <span className="capitalize">{k}</span>:{" "}
                <span className="font-medium text-slate-200">{v}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Feedback */}
      {success && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-400">
          {success}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
          {error}
        </p>
      )}

      {/* Plan comparison grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-72 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {sortedPlans.map((p) => {
            const isCurrent = p.plan === subscription?.plan;
            const s = PLAN_STYLES[p.plan] ?? PLAN_STYLES.starter;
            const isUpgradable = PLAN_ORDER.indexOf(p.plan) > PLAN_ORDER.indexOf(subscription?.plan ?? "starter");
            const isDowngrade = PLAN_ORDER.indexOf(p.plan) < PLAN_ORDER.indexOf(subscription?.plan ?? "starter");

            return (
              <div
                key={p.plan}
                className={`relative flex flex-col overflow-hidden rounded-2xl border bg-slate-950/50 ring-1 transition-all ${s.ring}
                  ${isCurrent ? "border-slate-600 scale-[1.02]" : "border-slate-800"}
                `}
              >
                {/* Card header */}
                <div className={`px-5 py-4 ${s.header}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-100">{p.label}</p>
                    {isCurrent && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.current}`}>
                        Current
                      </span>
                    )}
                  </div>
                </div>

                {/* Limits */}
                <div className="flex-1 space-y-2 px-5 py-4">
                  {Object.entries(p.limits).map(([resource, limit]) => (
                    <div key={resource} className="flex items-center justify-between">
                      <span className="text-xs capitalize text-slate-400">{resource}</span>
                      <span className={`text-xs font-semibold ${limit === "unlimited" ? "text-emerald-400" : "text-slate-200"}`}>
                        {limit === "unlimited" ? "∞ unlimited" : limit}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-5 pb-5">
                  <button
                    type="button"
                    disabled={isCurrent || upgrading === p.plan}
                    onClick={() => handleUpgrade(p.plan)}
                    className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                      isCurrent ? s.current : s.cta
                    }`}
                  >
                    {upgrading === p.plan
                      ? "Switching…"
                      : isCurrent
                      ? "Current plan"
                      : isDowngrade
                      ? `Downgrade to ${p.label}`
                      : `Upgrade to ${p.label}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Multi-tenant note */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/40 px-5 py-4 text-xs text-slate-500 space-y-1">
        <p className="font-medium text-slate-400">Multi-tenant isolation</p>
        <p>
          All your data — clients, projects, invoices, tasks, files, and messages — is fully isolated.
          Other freelancer accounts can never access your data. Plan limits apply per account.
        </p>
      </div>
    </div>
  );
}
